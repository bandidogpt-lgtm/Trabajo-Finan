import type { Cliente as ClienteModel, Inmueble as InmuebleModel } from '@prisma/client';

export function serializeCliente(cliente: ClienteModel) {
  return {
    id: cliente.id,
    dni: cliente.dni,
    nombres: cliente.nombres,
    apellidos: cliente.apellidos,
    fecha_nacimiento: cliente.fecha_nacimiento.toISOString().split('T')[0],
    duenio_propiedad: cliente.duenio_propiedad,
    email: cliente.email,
    direccion: cliente.direccion,
    ingreso_mensual: Number(cliente.ingreso_mensual),
    estado_civil: cliente.estado_civil,
    telefono: cliente.telefono,
    cok: cliente.cok !== null ? Number(cliente.cok) : null,
  };
}

export function serializeInmueble(inmueble: InmuebleModel) {
  return {
    id: inmueble.id,
    nombre_proyecto: inmueble.nombre_proyecto,
    precio_venta: Number(inmueble.precio_venta),
    nro_cuartos: inmueble.nro_cuartos,
    area_m2: Number(inmueble.area_m2),
    ubicacion: inmueble.ubicacion,
    descripcion: inmueble.descripcion,
    tipo: inmueble.tipo,
    imagen_referencial: inmueble.imagen_referencial,
  };
}
