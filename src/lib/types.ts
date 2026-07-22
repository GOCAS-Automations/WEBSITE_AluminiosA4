export type Rol = "administrador" | "coordinador";

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagen_url: string | null;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductoColor {
  id: string;
  producto_id: string;
  nombre: string;
  hex: string | null;
  imagen_url: string | null;
  orden: number;
  created_at: string;
}

export interface Producto {
  id: string;
  categoria_id: string | null;
  nombre: string;
  referencia: string | null;
  descripcion: string | null;
  diametro_cm: number | null;
  altura_cm: number | null;
  capacidad: string | null;
  refuerzo: boolean;
  empaque: string | null;
  precio: number;
  imagen_url: string | null;
  qr_url: string | null;
  destacado: boolean;
  activo: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface JuegoColor {
  id: string;
  juego_id: string;
  nombre: string;
  hex: string | null;
  imagen_url: string | null;
  orden: number;
  created_at: string;
}

export interface Juego {
  id: string;
  categoria_id: string | null;
  nombre: string;
  referencia: string | null;
  descripcion: string | null;
  refuerzo: boolean;
  empaque: string | null;
  precio: number;
  imagen_url: string | null;
  qr_url: string | null;
  destacado: boolean;
  activo: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface Usuario {
  id: string;
  usuario: string;
  email: string | null;
  nombre: string;
  rol: Rol;
  activo: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

/* Compuestos */
export interface ProductoConColores extends Producto {
  colores: ProductoColor[];
  categoria?: Categoria | null;
}

export interface JuegoComponente {
  producto: Producto;
  cantidad: number;
  orden: number;
}

export interface JuegoConDetalle extends Juego {
  colores: JuegoColor[];
  componentes: JuegoComponente[];
  categoria?: Categoria | null;
}

export interface CategoriaConConteo extends Categoria {
  total_productos: number;
  total_juegos: number;
}
