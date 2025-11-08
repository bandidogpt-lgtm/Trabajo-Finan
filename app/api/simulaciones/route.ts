import { NextResponse } from 'next/server'
import db from '@/lib/db'

// === POST: Crear nueva simulación ===
export async function POST(req: Request) {
  try {
    const body = await req.json() 
    const {
      tipo_moneda,
      tipo_tasa,
      tasa_interes,
      fecha_inicio,
      capitalizacion,
      monto_prestamo,
      cuota_inicial,
      cuota_mensual,
      periodo_gracia,
      plazo_tasa_interes,
      plazo_meses,
      plazo_periodo_gracia,
      monto_bono_bbp,
      clasificacion_bono_bbp,
      portes,
      tem_seguro_desgravamen,
      tasa_seguro_inmueble,
      usuario_id,
      clientes_id,
      inmueble_id,
      costos_iniciales // 👈 nueva columna
    } = body

    const nuevaSimulacion = await db.simulacion.create({
      data: {
        tipo_moneda,
        tipo_tasa,
        tasa_interes,
        fecha_inicio: new Date(fecha_inicio),
        capitalizacion,
        monto_prestamo,
        cuota_inicial,
        cuota_mensual,
        periodo_gracia,
        plazo_tasa_interes,
        plazo_meses,
        plazo_periodo_gracia,
        monto_bono_bbp,
        clasificacion_bono_bbp,
        portes,
        tem_seguro_desgravamen,
        tasa_seguro_inmueble,
        usuario_id,
        clientes_id,
        inmueble_id,
        //costos_iniciales -->PENDIENTE
      }
    })

    return NextResponse.json(nuevaSimulacion)
  } catch (error) {
    console.error('Error al crear simulación:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// === GET: Calcular matriz de pagos desde BD ===
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = parseInt(searchParams.get('id_simulacion') || '0')

    if (!id) {
      return NextResponse.json(
        { error: 'Debe proporcionar un id_simulacion válido en la URL' },
        { status: 400 }
      )
    }

    // === 1️⃣ Obtener los datos de la simulación ===
    const simulacion = await db.simulacion.findUnique({
      where: { id_simulacion: id },
    })

    if (!simulacion) {
      return NextResponse.json(
        { error: `No se encontró una simulación con id_simulacion = ${id}` },
        { status: 404 }
      )
    }

    // === 2️⃣ Extraer variables del registro ===
    const n = simulacion.plazo_meses || 0
    const r = Number(simulacion.tasa_interes) / 12 // ejemplo mensual
    const PV = Number(simulacion.monto_prestamo)
    const TSD = Number(simulacion.tem_seguro_desgravamen) || 0
    const TSI = Number(simulacion.tasa_seguro_inmueble) || 0
    const Porte = Number(simulacion.portes) || 0
    const cuotaBase = Number(simulacion.cuota_mensual) || 0

    // === 3️⃣ Cálculo de flujos ===
    let Saldo = PV
    const Flujos: number[][] = []

    for (let i = 1; i <= n; i++) {
      const Interes = Saldo * r
      const Amort = cuotaBase - Interes
      const SegDes = Saldo * TSD
      const SegInm = PV * TSI
      const Cuota = cuotaBase + SegDes + SegInm + Porte
      Saldo = Saldo - Amort
      const Flujo = -1 * Cuota

      Flujos.push([
        i, cuotaBase, Interes, Amort, Saldo, SegDes, SegInm, Porte, Cuota, Flujo
      ])
    }

    // === 4️⃣ Retornar resultado ===
    return NextResponse.json({
      id_simulacion: simulacion.id_simulacion,
      resumen: {
        monto_prestamo: PV,
        tasa_interes: simulacion.tasa_interes,
        plazo_meses: n,
        cuota_base: cuotaBase,
      },
      headers: ["Iter", "CuotaBase", "Interes", "Amort", "Saldo", "SegDes", "SegInm", "Porte", "Cuota", "Flujo"],
      data: Flujos
    })

  } catch (error) {
    console.error('Error al generar matriz de pagos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}