import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const clientes = await db.cliente.findMany({
      select: {
        id: true,
        dni: true,
        nombres: true,
        apellidos: true,
        fecha_nacimiento: true,
        duenio_propiedad: true,
        email: true,
        direccion: true,
        ingreso_mensual: true,
        estado_civil: true,
        telefono: true,
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error("Error al listar clientes:", error);
    return NextResponse.json(
      { error: "Error al listar clientes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
      !email ||
      !direccion ||
      ingreso_mensual === undefined ||
      !estado_civil ||
      !telefono
    ) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const nacimiento = new Date(fecha_nacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - nacimiento.getFullYear() -
      (hoy < new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate()) ? 1 : 0);

    const ingreso = parseFloat(ingreso_mensual);
    let riesgoIngreso = 0;

    if (ingreso < 1500) riesgoIngreso = 3;
    else if (ingreso < 3000) riesgoIngreso = 2;
    else if (ingreso < 5000) riesgoIngreso = 1;
    else riesgoIngreso = 0.5;

    const riesgoEdad = (edad / 100) * 1;
    const cok = 5 + riesgoEdad + riesgoIngreso;

    const nuevoCliente = await db.cliente.create({
      data: {
        dni,
        nombres,
        apellidos,
        fecha_nacimiento: nacimiento,
        duenio_propiedad: Number(duenio_propiedad),
        email,
        direccion,
        ingreso_mensual: ingreso,
        estado_civil,
        telefono,
        cok: cok.toFixed(2),
      },
    });

    return NextResponse.json(nuevoCliente, { status: 201 });
  } catch (error: any) {
    console.error("Error al insertar cliente:", error);

    if (error.code === "P2002") {
      const campo = error.meta?.target?.[0] || "campo único";
      return NextResponse.json(
        { error: `El ${campo} ya existe` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear cliente" },
      { status: 500 }
    );
  }
}
