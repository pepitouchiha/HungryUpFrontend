import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  protected modalMode = signal<'create' | 'edit' | null>(null);
  protected editingId = signal<number | null>(null);
  protected roles: UserRole[] = ['Admin', 'Cashier', 'Waiter'];

  protected userForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: [''],
    fullName: ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    role:     ['Cashier' as UserRole, Validators.required],
    isActive: [true],
  });

  ngOnInit(): void {
    this.load();
  }

  protected openCreate(): void {
    this.userForm.reset({ username: '', password: '', fullName: '', email: '', role: 'Cashier', isActive: true });
    this.userForm.get('password')!.setValidators(Validators.required);
    this.userForm.get('password')!.updateValueAndValidity();
    this.editingId.set(null);
    this.modalMode.set('create');
  }

  protected openEdit(user: UserProfile): void {
    this.userForm.patchValue({ ...user, password: '' });
    this.userForm.get('password')!.clearValidators();
    this.userForm.get('password')!.updateValueAndValidity();
    this.editingId.set(user.id);
    this.modalMode.set('edit');
  }

  protected save(): void {
    if (this.userForm.invalid) return;
    const { password, isActive, ...rest } = this.userForm.getRawValue();

    if (this.modalMode() === 'create') {
      this.userService.createUser({ ...rest, password }).subscribe(user => {
        this.users.update(us => [...us, user]);
        this.closeModal();
      });
    } else {
      const id = this.editingId()!;
      const payload = password ? { ...rest, password } : rest;
      this.userService.updateUser(id, payload).subscribe(updated => {
        this.users.update(us => us.map(u => u.id === id ? updated : u));
        this.closeModal();
      });
    }
  }

  protected deleteUser(id: number): void {
    if (!confirm('¿Eliminar este usuario?')) return;
    this.userService.deleteUser(id).subscribe(() =>
      this.users.update(us => us.filter(u => u.id !== id))
    );
  }

  protected closeModal(): void { this.modalMode.set(null); }

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
