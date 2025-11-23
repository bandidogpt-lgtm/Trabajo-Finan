export type Cliente = {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  duenio_propiedad: number;
  email: string;
  direccion: string;
  ingreso_mensual: number;
  estado_civil: string;
  telefono: string;
  cok?: number | null;
  flag_condiciones?: boolean;
};
