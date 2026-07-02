export type EstadoMesa = 'Libre' | 'Ocupada';

export interface MesaDto {
  id:     string;
  numero: number;
  estado: EstadoMesa;
  activo: boolean;
}

export interface CreateMesaDto {
  numero: number;
}

export interface UpdateMesaDto {
  numero: number;
  estado: EstadoMesa;
  activo: boolean;
}
