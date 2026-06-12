export type EstadoMesa = 'Libre' | 'Ocupada';

export interface MesaDto {
  id:     string;
  numero: number;
  estado: EstadoMesa;
}
