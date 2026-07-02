export interface CategoriaDto {
  id:     string;
  nombre: string;
  activo: boolean;
}

export interface CreateCategoriaDto {
  nombre: string;
}

export interface UpdateCategoriaDto {
  nombre: string;
  activo: boolean;
}

export interface ProductoDto {
  id:          string;
  nombre:      string;
  precio:      number;
  stockActual: number;
  categoriaId: string;
  imagenUrl:   string | null;
  activo:      boolean;
}

export interface CreateProductoDto {
  nombre:       string;
  precio:       number;
  stockInicial: number;
  categoriaId:  string;
  imagenUrl?:   string | null;
}

export interface UpdateProductoDto {
  nombre:       string;
  precio:       number;
  stockActual:  number;
  categoriaId:  string;
  imagenUrl?:   string | null;
}
