export type EstadoPrep      = 'Pendiente' | 'EnPreparacion' | 'Entregado';
export type EstadoFin       = 'PorPagar' | 'Pagado';
export type TipoRestaurante = 'FastFood' | 'Gourmet';

export interface DetallePedidoDto {
  productoId:     string;
  cantidad:       number;
  precioUnitario: number;
}

export interface PedidoDto {
  id:            string;
  mesaId:        string | null;
  fechaCreacion: string;
  estadoPrep:    EstadoPrep;
  estadoFin:     EstadoFin;
  tipo:          TipoRestaurante;
  numeroTurno:   number;
  detalles:      DetallePedidoDto[];
}

export interface CreatePedidoDto {
  tipoRestaurante: TipoRestaurante;
  mesaId?:         string;
  items:           { productoId: string; cantidad: number }[];
}
