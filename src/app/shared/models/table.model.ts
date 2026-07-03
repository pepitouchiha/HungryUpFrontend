export type EstadoMesa = 'Libre' | 'Ocupada';

export interface MesaDto {
  id:     string;
  numero: number;
  estado: EstadoMesa;
  activo: boolean;
}

export interface CreateMesaDto {}

export interface UpdateMesaDto {
  numero: number;
  estado: EstadoMesa;
  activo: boolean;
}
