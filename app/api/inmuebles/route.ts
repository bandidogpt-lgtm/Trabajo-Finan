import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { serializeInmueble } from '@/lib/serializers';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!id) {
        return NextResponse.json(
          { error: 'Debe proporcionar un id de inmueble válido en la URL' },
          { status: 400 },
        );
      }

      const inmueble = await db.inmueble.findUnique({
        where: { id },
      });

      if (!inmueble) {
        return NextResponse.json(
          { error: `No se encontró un inmueble con el id = ${id}` },
          { status: 404 },
        );
      }

      return NextResponse.json(serializeInmueble(inmueble));
    }

    const inmuebles = await db.inmueble.findMany({
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(inmuebles.map(serializeInmueble));
  } catch (error) {
    console.error('Error al obtener inmueble(s):', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nombre_proyecto,
      precio_venta,
      nro_cuartos,
      area_m2,
      ubicacion,
      descripcion,
      tipo,
      imagen_referencial,
    } = body;

    if (
      !nombre_proyecto ||
      precio_venta === undefined ||
      precio_venta === null ||
      nro_cuartos === undefined ||
      nro_cuartos === null ||
      area_m2 === undefined ||
      area_m2 === null ||
      !ubicacion ||
      !tipo
    ) {
      return NextResponse.json({ error: 'Todos los campos obligatorios deben completarse' }, { status: 400 });
    }

    const payload = {
      nombre_proyecto,
      precio_venta: Number(precio_venta),
      nro_cuartos: Number(nro_cuartos),
      area_m2: Number(area_m2),
      ubicacion,
      descripcion,
      tipo,
      imagen_referencial,
    };

    const nuevoInmueble = await db.inmueble.create({
      data: payload,
    });

    return NextResponse.json(serializeInmueble(nuevoInmueble), { status: 201 });
  } catch (error) {
    console.error('Error al crear inmueble:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Debe proporcionar un id para actualizar' },
        { status: 400 },
      );
    }

    const payload = {
      ...data,
      precio_venta: data.precio_venta !== undefined ? Number(data.precio_venta) : undefined,
      nro_cuartos: data.nro_cuartos !== undefined ? Number(data.nro_cuartos) : undefined,
      area_m2: data.area_m2 !== undefined ? Number(data.area_m2) : undefined,
    };

    const inmuebleActualizado = await db.inmueble.update({
      where: { id: Number(id) },
      data: payload,
    });

    return NextResponse.json(serializeInmueble(inmuebleActualizado));
  } catch (error) {
    console.error('Error al actualizar inmueble:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get('id') || '0', 10);

    if (!id) {
      return NextResponse.json({ error: 'Debe proporcionar un id válido para eliminar' }, { status: 400 });
    }

    const inmuebleEliminado = await db.inmueble.delete({
      where: { id },
    });

    return NextResponse.json({
      mensaje: `Inmueble con id ${id} eliminado correctamente`,
      eliminado: serializeInmueble(inmuebleEliminado),
    });
  } catch (error) {
    console.error('Error al eliminar inmueble:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
