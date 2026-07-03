import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Toast, confirmDelete } from '../../../../shared/utils/swal';
import { UserRole, UserProfile } from '../../../../shared/models/user-enterprise-manager.model';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-users',
  imports: [ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class Users implements OnInit {
  private fb          = inject(FormBuilder);
  private userService = inject(UserService);

  protected users     = signal<UserProfile[]>([]);
  protected loading   = signal(true);
  protected error     = signal<string | null>(null);
  protected formError = signal<string | null>(null);
  protected modalMode = signal<'create' | 'edit' | null>(null);
  protected editingId = signal<number | null>(null);
  protected passwordTargetId = signal<number | null>(null);
  protected roles: UserRole[] = ['Admin', 'Cashier', 'Waiter'];

  protected userForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: [''],
    fullName: ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    rol:      ['Cashier' as UserRole, Validators.required],
    activo:   [true],
  });

  protected passwordForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this.load();
  }

  protected openCreate(): void {
    this.userForm.reset({ username: '', password: '', fullName: '', email: '', rol: 'Cashier', activo: true });
    this.userForm.get('username')!.enable();
    this.userForm.get('password')!.setValidators(Validators.required);
    this.userForm.get('password')!.updateValueAndValidity();
    this.formError.set(null);
    this.editingId.set(null);
    this.modalMode.set('create');
  }

  protected openEdit(user: UserProfile): void {
    this.userForm.reset({ ...user, password: '' });
    this.userForm.get('username')!.disable();
    this.userForm.get('password')!.clearValidators();
    this.userForm.get('password')!.updateValueAndValidity();
    this.formError.set(null);
    this.editingId.set(user.id);
    this.modalMode.set('edit');
  }

  protected save(): void {
    if (this.userForm.invalid) return;
    this.formError.set(null);
    const { username, password, fullName, email, rol, activo } = this.userForm.getRawValue();

    if (this.modalMode() === 'create') {
      this.userService.createUser({ username, password, fullName, email, rol }).subscribe({
        next: user => {
          this.users.update(us => [...us, user]);
          this.closeModal();
        },
        error: (err: HttpErrorResponse) => this.formError.set(this.extractError(err)),
      });
    } else {
      const id = this.editingId()!;
      this.userService.updateUser(id, { fullName, email, rol, activo }).subscribe({
        next: updated => {
          this.users.update(us => us.map(u => u.id === id ? updated : u));
          this.closeModal();
        },
        error: (err: HttpErrorResponse) => this.formError.set(this.extractError(err)),
      });
    }
  }

  protected deleteUser(id: number): void {
    confirmDelete('Este usuario quedará inactivo.').then(ok => {
      if (!ok) return;
      this.userService.deleteUser(id).subscribe(() => {
        this.users.update(us => us.map(u => u.id === id ? { ...u, activo: false } : u));
        Toast.fire({ icon: 'success', title: 'Usuario desactivado' });
      });
    });
  }

  protected restoreUser(user: UserProfile): void {
    this.userService.updateUser(user.id, {
      email: user.email, fullName: user.fullName, rol: user.rol, activo: true
    }).subscribe(updated =>
      this.users.update(us => us.map(u => u.id === user.id ? updated : u))
    );
  }

  protected openChangePassword(user: UserProfile): void {
    this.passwordForm.reset({ newPassword: '' });
    this.formError.set(null);
    this.passwordTargetId.set(user.id);
  }

  protected savePassword(): void {
    if (this.passwordForm.invalid) return;
    const id = this.passwordTargetId()!;
    const { newPassword } = this.passwordForm.getRawValue();
    this.userService.changePassword(id, newPassword).subscribe({
      next: () => this.closePasswordModal(),
      error: (err: HttpErrorResponse) => this.formError.set(this.extractError(err)),
    });
  }

  protected closePasswordModal(): void {
    this.passwordTargetId.set(null);
    this.formError.set(null);
  }

  protected closeModal(): void {
    this.modalMode.set(null);
    this.formError.set(null);
  }

  private extractError(err: HttpErrorResponse): string {
    return err.error?.detail ?? err.error?.message ?? 'Ha ocurrido un error.';
  }

  private load(): void {
    this.userService.getUsers().subscribe({
      next: users => { this.users.set(users); this.loading.set(false); },
      error: () => {
        this.error.set('La gestión de usuarios aún no está disponible en el backend.');
        this.loading.set(false);
      }
    });
  }
}
