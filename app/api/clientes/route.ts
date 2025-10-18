import { NextResponse } from 'next/server';
import {
  addCliente,
  listClientes,
  validarPayload,
} from '@/lib/clientes';
import { ClientePayload } from '@/types/cliente';

export async function GET() {
  return NextResponse.json(listClientes());
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ClientePayload>;
  const errores = validarPayload(body);

  if (errores.length > 0) {
    return NextResponse.json(
      { errores },
      {
        status: 400,
      },
    );
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

  const nuevo = addCliente(payload);
  return NextResponse.json(nuevo, { status: 201 });
}
