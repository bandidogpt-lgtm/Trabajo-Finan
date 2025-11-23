export type Inmueble = {
  id: number;
  nombre_proyecto: string;
  precio_venta: number;
  nro_cuartos: number;
  area_m2: number;
  ubicacion: string;
  descripcion?: string | null;
  tipo: string;
  imagen_referencial?: string | null;
  sostenible?: boolean;
};
