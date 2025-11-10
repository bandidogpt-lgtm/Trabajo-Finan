import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: Request,{ params }: { params: { id: string }}) {
  try {
    const clienteId = parseInt(params.id);

    const cliente = await db.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("❌ Error al obtener cliente:", error);
    return NextResponse.json(
      { error: "Error al obtener cliente" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clienteId = parseInt(params.id);
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
      !duenio_propiedad ||
      !email ||
      !direccion ||
      !ingreso_mensual ||
      !estado_civil ||
      !telefono
    ) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const clienteActualizado = await db.cliente.update({
      where: { id: clienteId },
      data: {
        dni,
        nombres,
        apellidos,
        fecha_nacimiento: new Date(fecha_nacimiento),
        duenio_propiedad: Number(duenio_propiedad),
        email,
        direccion,
        ingreso_mensual: parseFloat(ingreso_mensual),
        estado_civil,
        telefono,
      },
    });

    return NextResponse.json(clienteActualizado);
  } catch (error: any) {
    console.error("❌ Error al actualizar cliente:", error);

    if (error.code === "P2002") {
      const campo = error.meta?.target?.[0] || "campo único";
      return NextResponse.json(
        { error: `El ${campo} ya existe en otro registro` },
        { status: 409 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Cliente no encontrado para actualizar" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar cliente" },
      { status: 500 }
    );
  }
}
