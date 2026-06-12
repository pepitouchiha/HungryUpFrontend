// Tipos que reflejan exactamente los DTOs del backend (.NET)
// Nombres en español para coincidir con la serialización JSON del servidor.

// ── Catalog ──────────────────────────────────────────────────────────────────

export interface ProductoDto {
  id: string;
  nombre: string;
  precio: number;
  stockActual: number;
  categoriaId: string;
}

export interface CreateProductoDto {
  nombre: string;
  precio: number;
  stockInicial: number;
  categoriaId: string;
}

// ── Orders ───────────────────────────────────────────────────────────────────

export type TipoRestaurante = 'FastFood' | 'Gourmet';
export type EstadoPreparacion = 'Pendiente' | 'EnPreparacion' | 'Entregado';
export type EstadoFinanciero = 'PorPagar' | 'Pagado';

export interface OrdenItemDto {
  productoId: string;
  cantidad: number;
}

export interface CreatePedidoDto {
  tipoRestaurante: TipoRestaurante;
  mesaId?: string;
  items: OrdenItemDto[];
}

export interface UpdateEstadoRequest {
  nuevoEstado: EstadoPreparacion;
}

export interface DetallePedidoDto {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
}

export interface PedidoDto {
  id: string;
  mesaId?: string;
  fechaCreacion: string;
  estadoPrep: EstadoPreparacion;
  estadoFin: EstadoFinanciero;
  tipo: TipoRestaurante;
  numeroTurno: number;
  detalles: DetallePedidoDto[];
}

// ── Billing ──────────────────────────────────────────────────────────────────

export type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Transferencia';

export interface ProcesarPagoDto {
  pedidoId: string;
  metodo: MetodoPago;
  montoPagado: number;
}

export interface PagoDto {
  id: string;
  pedidoId: string;
  montoTotal: number;
  metodo: MetodoPago;
  fechaPago: string;
}

export interface ResumenVentasDto {
  ingresos: number;
  cantidad: number;
}

// ── Orders — Mesas ───────────────────────────────────────────────────────────

export type EstadoMesa = 'Libre' | 'Ocupada';

export interface MesaDto {
  id: string;
  numero: number;
  estado: EstadoMesa;
}

// ── Analytics ────────────────────────────────────────────────────────────────

export type Periodo = 'dia' | 'semana' | 'mes';

export interface SalesSummaryDto {
  ingresosTotales: number;
  cantidadOrdenes: number;
}
