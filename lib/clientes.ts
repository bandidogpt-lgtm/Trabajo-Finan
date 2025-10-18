import { Cliente, ClientePayload } from '@/types/cliente';

type ClienteStore = {
  clientes: Cliente[];
  nextId: number;
};

const globalForClientes = globalThis as typeof globalThis & {
  __clienteStore?: ClienteStore;
};

if (!globalForClientes.__clienteStore) {
  const clientesSemilla: Cliente[] = [
    {
      id: 1,
      dni: '76543210',
      nombres: 'María',
      apellidos: 'Gonzales Ríos',
      fecha_nacimiento: '1990-05-12',
      duenho_propiedad: 1,
      email: 'maria.gonzales@example.com',
      direccion: 'Av. Los Olivos 123, Lima',
      ingreso_mensual: 3500.5,
      estado_civil: 'Casado',
      telefono: '987654321',
    },
    {
      id: 2,
      dni: '12345678',
      nombres: 'Juan',
      apellidos: 'Pérez López',
      fecha_nacimiento: '1985-09-30',
      duenho_propiedad: 0,
      email: 'juan.perez@example.com',
      direccion: 'Jr. Las Palmeras 456, Arequipa',
      ingreso_mensual: 4200.0,
      estado_civil: 'Soltero',
      telefono: '912345678',
    },
  ];

  globalForClientes.__clienteStore = {
    clientes: clientesSemilla,
    nextId: clientesSemilla.length + 1,
  };
}

const store = globalForClientes.__clienteStore;

export function listClientes() {
  return store.clientes;
}

export function findCliente(id: number) {
  return store.clientes.find((cliente) => cliente.id === id);
}

export function addCliente(payload: ClientePayload) {
  const nuevo: Cliente = {
    id: store.nextId++,
    ...payload,
  };
  store.clientes.push(nuevo);
  return nuevo;
}

export function updateCliente(id: number, payload: ClientePayload) {
  const index = store.clientes.findIndex((cliente) => cliente.id === id);
  if (index === -1) {
    return undefined;
  }

  const actualizado: Cliente = {
    id,
    ...payload,
  };
  store.clientes[index] = actualizado;
  return actualizado;
}

export function deleteCliente(id: number) {
  const index = store.clientes.findIndex((cliente) => cliente.id === id);
  if (index === -1) {
    return false;
  }
  store.clientes.splice(index, 1);
  return true;
}

function isNumericString(value: unknown, length?: number) {
  return (
    typeof value === 'string' &&
    /^\d+$/.test(value) &&
    (typeof length === 'undefined' || value.length === length)
  );
}

function isValidEmail(value: unknown) {
  return typeof value === 'string' && /.+@.+\..+/.test(value);
}

export function validarPayload(payload: Partial<ClientePayload>) {
  const errores: string[] = [];

  if (!isNumericString(payload.dni, 8)) {
    errores.push('El DNI debe contener exactamente 8 dígitos.');
  }
  if (!payload.nombres) {
    errores.push('Los nombres son obligatorios.');
  }
  if (!payload.apellidos) {
    errores.push('Los apellidos son obligatorios.');
  }
  if (!payload.fecha_nacimiento || isNaN(Date.parse(payload.fecha_nacimiento))) {
    errores.push('La fecha de nacimiento es obligatoria y debe ser válida.');
  }
  if (
    typeof payload.duenho_propiedad !== 'number' ||
    ![0, 1].includes(payload.duenho_propiedad)
  ) {
    errores.push('Debe indicar si es dueño de propiedad (Sí/No).');
  }
  if (!isValidEmail(payload.email)) {
    errores.push('El correo electrónico no es válido.');
  }
  if (!payload.direccion) {
    errores.push('La dirección es obligatoria.');
  }
  if (
    typeof payload.ingreso_mensual !== 'number' ||
    Number.isNaN(payload.ingreso_mensual) ||
    payload.ingreso_mensual < 0
  ) {
    errores.push('El ingreso mensual es obligatorio y debe ser un número positivo.');
  }
  if (!payload.estado_civil) {
    errores.push('El estado civil es obligatorio.');
  }
  if (!isNumericString(payload.telefono, 9)) {
    errores.push('El teléfono debe contener exactamente 9 dígitos.');
  }

  return errores;
}
