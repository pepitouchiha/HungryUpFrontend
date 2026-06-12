export interface CategoriaDto {
  id:     string;
  nombre: string;
  activo: boolean;
}

export interface ProductoDto {
  id:          string;
  nombre:      string;
  precio:      number;
  stockActual: number;
  categoriaId: string;
}

export interface CreateProductoDto {
  nombre:       string;
  precio:       number;
  stockInicial: number;
  categoriaId:  string;
}
