import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Toast, confirmDelete } from '../../../../shared/utils/swal';
import { EstadoMesa, MesaDto } from '../../../../shared/models/table.model';
import { TableService } from '../../../../core/services/table.service';

@Component({
  selector: 'app-mesas',
  imports: [ReactiveFormsModule],
  templateUrl: './mesas.html',
  styleUrl: './mesas.scss'
})
export class Mesas implements OnInit {
  private fb           = inject(FormBuilder);
  private tableService = inject(TableService);

  protected mesas      = signal<MesaDto[]>([]);
  protected loading    = signal(true);
  protected formError  = signal<string | null>(null);
  protected modalMode  = signal<'create' | 'edit' | null>(null);
  protected editingId  = signal<string | null>(null);
  protected estados: EstadoMesa[] = ['Libre', 'Ocupada'];

  protected mesaForm = this.fb.nonNullable.group({
    numero: [1, [Validators.required, Validators.min(1)]],
    estado: ['Libre' as EstadoMesa, Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.tableService.getMesas().subscribe(mesas => {
      this.mesas.set(mesas);
      this.loading.set(false);
    });
  }

  protected openCreate(): void {
    this.mesaForm.reset({ numero: 1, estado: 'Libre' });
    this.mesaForm.get('numero')?.clearValidators();
    this.mesaForm.get('numero')?.updateValueAndValidity();
    this.formError.set(null);
    this.editingId.set(null);
    this.modalMode.set('create');
  }

  protected openEdit(mesa: MesaDto): void {
    this.mesaForm.get('numero')?.setValidators([Validators.required, Validators.min(1)]);
    this.mesaForm.get('numero')?.updateValueAndValidity();
    this.mesaForm.reset({ numero: mesa.numero, estado: mesa.estado });
    this.formError.set(null);
    this.editingId.set(mesa.id);
    this.modalMode.set('edit');
  }

  protected save(): void {
    if (this.mesaForm.invalid) return;
    const v = this.mesaForm.getRawValue();
    this.formError.set(null);

    if (this.modalMode() === 'create') {
      this.tableService.createMesa().subscribe({
        next: mesa => {
          this.mesas.update(ms => [...ms, mesa].sort((a, b) => a.numero - b.numero));
          this.closeModal();
          Toast.fire({ icon: 'success', title: `Mesa #${mesa.numero} creada` });
        },
        error: (err: HttpErrorResponse) => this.formError.set(this.extractError(err)),
      });
    } else {
      const id = this.editingId()!;
      this.tableService.updateMesa(id, { numero: v.numero, estado: v.estado, activo: true }).subscribe({
        next: updated => {
          this.mesas.update(ms => ms.map(m => m.id === id ? updated : m));
          this.closeModal();
          Toast.fire({ icon: 'success', title: `Mesa #${updated.numero} actualizada` });
        },
        error: (err: HttpErrorResponse) => this.formError.set(this.extractError(err)),
      });
    }
  }

  protected deleteMesa(mesa: MesaDto): void {
    confirmDelete(`¿Eliminar la mesa #${mesa.numero}? Esta acción no se puede deshacer.`).then(ok => {
      if (!ok) return;
      this.tableService.deleteMesa(mesa.id).subscribe({
        next: () => {
          this.mesas.update(ms => ms.filter(m => m.id !== mesa.id));
          Toast.fire({ icon: 'success', title: `Mesa #${mesa.numero} eliminada` });
        },
        error: () => Toast.fire({ icon: 'error', title: 'Error al eliminar la mesa' }),
      });
    });
  }

  protected closeModal(): void {
    this.modalMode.set(null);
    this.formError.set(null);
  }

  private extractError(err: HttpErrorResponse): string {
    return err.error?.detail ?? err.error?.message ?? 'Ha ocurrido un error.';
  }
}
