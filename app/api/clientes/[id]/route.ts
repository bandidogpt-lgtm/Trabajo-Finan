import { NextResponse } from 'next/server';
import {
  deleteCliente,
  findCliente,
  updateCliente,
  validarPayload,
} from '@/lib/clientes';
import { ClientePayload } from '@/types/cliente';

function parseId(id: string) {
  const parsed = Number(id);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const id = parseId(params.id);
  if (typeof id === 'undefined') {
    return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });
  }

  const cliente = findCliente(id);
  if (!cliente) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  return NextResponse.json(cliente);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const id = parseId(params.id);
  if (typeof id === 'undefined') {
    return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });
  }

  const body = (await request.json()) as Partial<ClientePayload>;
  const errores = validarPayload(body);

  if (errores.length > 0) {
    return NextResponse.json({ errores }, { status: 400 });
  }

  const payload: ClientePayload = {
    dni: body.dni!,
    nombres: body.nombres!,
    apellidos: body.apellidos!,
    fecha_nacimiento: body.fecha_nacimiento!,
    duenho_propiedad: body.duenho_propiedad!,
    email: body.email!,
    direccion: body.direccion!,
    ingreso_mensual: body.ingreso_mensual!,
    estado_civil: body.estado_civil!,
    telefono: body.telefono!,
  };

  const actualizado = updateCliente(id, payload);
  if (!actualizado) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  return NextResponse.json(actualizado);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const id = parseId(params.id);
  if (typeof id === 'undefined') {
    return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });
  }

  const eliminado = deleteCliente(id);
  if (!eliminado) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
