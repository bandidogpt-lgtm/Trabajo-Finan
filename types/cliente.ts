export interface Cliente {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  duenho_propiedad: number;
  email: string;
  direccion: string;
  ingreso_mensual: number;
  estado_civil: string;
  telefono: string;
}

export type ClientePayload = Omit<Cliente, 'id'>;
