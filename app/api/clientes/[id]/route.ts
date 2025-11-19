import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { serializeCliente } from '@/lib/serializers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const clienteId = parseInt(params.id, 10);

    const cliente = await db.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json(serializeCliente(cliente));
  } catch (error) {
    console.error('❌ Error al obtener cliente:', error);
    return NextResponse.json(
      { error: 'Error al obtener cliente' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const clienteId = parseInt(params.id, 10);
    const body = await request.json();
    const {
      dni,
      nombres,
      apellidos,
      fecha_nacimiento,
      duenio_propiedad,
      email,
      direccion,
      ingreso_mensual,
      estado_civil,
      telefono,
    } = body;

    if (
      !dni ||
      !nombres ||
      !apellidos ||
      !fecha_nacimiento ||
      duenio_propiedad === undefined ||
      duenio_propiedad === null ||
      !email ||
      !direccion ||
      ingreso_mensual === undefined ||
      ingreso_mensual === null ||
      !estado_civil ||
      !telefono
    ) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 },
      );
    }

    const payload = {
      dni,
      nombres,
      apellidos,
      fecha_nacimiento: new Date(fecha_nacimiento),
      duenio_propiedad: Number(duenio_propiedad),
      email,
      direccion,
      ingreso_mensual: Number(ingreso_mensual),
      estado_civil,
      telefono,
    };

    const clienteActualizado = await db.cliente.update({
      where: { id: clienteId },
      data: payload,
    });

    return NextResponse.json(serializeCliente(clienteActualizado));
  } catch (error: any) {
    console.error('❌ Error al actualizar cliente:', error);

    if (error.code === 'P2002') {
      const campo = error.meta?.target?.[0] || 'campo único';
      return NextResponse.json(
        { error: `El ${campo} ya existe en otro registro` },
        { status: 409 },
      );
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Cliente no encontrado para actualizar' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar cliente' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const clienteId = parseInt(params.id, 10);

    const clienteEliminado = await db.cliente.delete({
      where: { id: clienteId },
    });

    return NextResponse.json({
      message: 'Cliente eliminado correctamente',
      cliente: serializeCliente(clienteEliminado),
    });
  } catch (error: any) {
    console.error('❌ Error al eliminar cliente:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Cliente no encontrado para eliminar' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar cliente' },
      { status: 500 },
    );
  }
}
