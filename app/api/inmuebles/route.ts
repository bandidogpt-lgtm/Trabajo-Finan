import { NextResponse } from 'next/server'
import db from '@/lib/db'

// === POST: Crear inmueble === //
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      id,
      nombre_proyecto,
      precio_venta,
      nro_cuartos,
      area_m2,
      ubicacion,
      descripcion,
      tipo,
      imagen_referencial
    } = body

    const nuevoInmueble = await db.inmueble.create({
      data: {
        id,
        nombre_proyecto,
        precio_venta,
        nro_cuartos,
        area_m2,
        ubicacion,
        descripcion,
        tipo,
        imagen_referencial
      }
    })

    return NextResponse.json(nuevoInmueble)
  } catch (error) {
    console.error('Error al crear inmueble:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// === GET: Obtener inmueble por ID === //
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = parseInt(searchParams.get('id') || '0')

    if (!id) {
      return NextResponse.json(
        { error: 'Debe proporcionar un id de inmueble válido en la URL' },
        { status: 400 }
      )
    }

    // === Buscar inmueble ===
    const inmueble = await db.inmueble.findUnique({
      where: { id },
    })

    if (!inmueble) {
      return NextResponse.json(
        { error: `No se encontró un inmueble con el id = ${id}` },
        { status: 404 }
      )
    }

    // === Retornar información del inmueble ===
    return NextResponse.json({
      id_inmueble: inmueble.id,
      nombre_proyecto: inmueble.nombre_proyecto,
      precio_venta: inmueble.precio_venta,
      nro_cuartos: inmueble.nro_cuartos,
      area_m2: inmueble.area_m2,
      ubicacion: inmueble.ubicacion,
      tipo: inmueble.tipo,
      descripcion: inmueble.descripcion,
      imagen_referencial: inmueble.imagen_referencial,
    })
  } catch (error) {
    console.error('Error al obtener inmueble:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// === PUT: Actualizar inmueble === //
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Debe proporcionar un id para actualizar' }, { status: 400 })
    }

    const inmuebleActualizado = await db.inmueble.update({
      where: { id },
      data
    })

    return NextResponse.json(inmuebleActualizado)
  } catch (error) {
    console.error('Error al actualizar inmueble:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// === DELETE: Eliminar inmueble === //
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = parseInt(searchParams.get('id') || '0')

    if (!id) {
      return NextResponse.json({ error: 'Debe proporcionar un id válido para eliminar' }, { status: 400 })
    }

    const inmuebleEliminado = await db.inmueble.delete({
      where: { id }
    })

    return NextResponse.json({
      mensaje: `Inmueble con id ${id} eliminado correctamente`,
      eliminado: inmuebleEliminado
    })
  } catch (error) {
    console.error('Error al eliminar inmueble:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}