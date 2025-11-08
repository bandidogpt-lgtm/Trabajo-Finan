import { NextResponse } from 'next/server'
import db from '@/lib/db'

// ============================================================
// === 1️⃣ POST: Registrar una nueva simulación (con validaciones)
// ============================================================
export async function POST(req: Request) {
  try {
    const body = await req.json()
    let {
      tipo_moneda,
      tipo_tasa,
      tasa_interes,
      capitalizacion,
      monto_prestamo,
      cuota_inicial,
      plazo_meses,
      fecha_inicio,
      plazo_tasa_interes,
      periodo_gracia,
      plazo_periodo_gracia,
      monto_bono_bbp,
      clasificacion_bono_bbp,
      tem_seguro_desgravamen,
      tasa_seguro_inmueble,
      portes,
      usuario_id,
      clientes_id,
      inmueble_id
    } = body

    // === Defaults
    const hoy = new Date()
    fecha_inicio = fecha_inicio ? new Date(fecha_inicio) : hoy
    tipo_moneda = tipo_moneda ?? 0
    tipo_tasa = tipo_tasa ?? 0
    plazo_tasa_interes = plazo_tasa_interes ?? 7
    capitalizacion = capitalizacion ?? 0
    periodo_gracia = periodo_gracia ?? 0
    plazo_periodo_gracia = plazo_periodo_gracia ?? 1
    clasificacion_bono_bbp = clasificacion_bono_bbp ?? 0
    monto_bono_bbp = monto_bono_bbp ?? 0
    tem_seguro_desgravamen = tem_seguro_desgravamen ?? 0
    tasa_seguro_inmueble = tasa_seguro_inmueble ?? 0
    portes = portes ?? 0

    const errores: string[] = []

    // === Validaciones según tu tabla
    if (tipo_moneda === 0) {
      if (monto_prestamo < 68800 || monto_prestamo > 362100)
        errores.push('El valor del inmueble (PV) debe estar entre S/. 68,800 y S/. 362,100.')
    } else {
      if (monto_prestamo < 19607.84 || monto_prestamo > 104411.76)
        errores.push('El valor del inmueble (PV) en dólares debe estar entre $ 19,607.84 y $ 104,411.76.')
    }

    if (cuota_inicial < 7.5 || cuota_inicial > 100)
      errores.push('La cuota inicial (CI) debe estar entre 7.5% y 100%.')
    if (plazo_meses < 60 || plazo_meses > 300)
      errores.push('El plazo en meses (n) debe estar entre 60 y 300.')
    if (fecha_inicio < hoy)
      errores.push('La fecha de desembolso no puede ser anterior a hoy.')
    if (tasa_interes <= 0)
      errores.push('La tasa de interés (i) debe ser mayor que 0.')
    if (plazo_tasa_interes < 0 || plazo_tasa_interes > 7)
      errores.push('El plazo de tasa de interés (p) debe estar entre 0 y 7.')
    if (capitalizacion < 0 || capitalizacion > 7)
      errores.push('La capitalización (c) debe estar entre 0 y 7.')
    if (periodo_gracia < 0 || periodo_gracia > 2)
      errores.push('El periodo de gracia (g) debe estar entre 0 y 2.')
    if (plazo_periodo_gracia < 1 || plazo_periodo_gracia > 24)
      errores.push('El plazo del periodo de gracia (pg) debe estar entre 1 y 24.')
    if (monto_bono_bbp < 0 || monto_bono_bbp > 33700)
      errores.push('El monto del bono BBP (mbbp) debe estar entre S/. 7,800 y S/. 33,700.')
    if (tem_seguro_desgravamen < 0)
      errores.push('El TEM del seguro desgravamen debe ser >= 0.')
    if (tasa_seguro_inmueble < 0)
      errores.push('La tasa del seguro inmueble debe ser >= 0.')
    if (portes < 0)
      errores.push('El monto de portes debe ser >= 0.')
    if (!usuario_id || !clientes_id || !inmueble_id)
      errores.push('Debe incluir usuario_id, clientes_id e inmueble_id válidos.')

    if (errores.length > 0) {
    console.log("⚠️ Validaciones activas:", errores)
    return NextResponse.json({ error: errores }, { status: 400 })
    }

    // === Insertar simulación ===
    const nuevaSimulacion = await db.simulacion.create({
      data: {
        tipo_moneda: tipo_moneda === 0 ? 'Soles' : 'Dólares',
        tipo_tasa: tipo_tasa === 0 ? 'Efectiva' : 'Nominal',
        tasa_interes,
        fecha_inicio,
        capitalizacion: String(capitalizacion),
        monto_prestamo,
        cuota_inicial,
        cuota_mensual: 0,
        periodo_gracia: String(periodo_gracia),
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
        inmueble_id
      }
    })

    return NextResponse.json({
      message: '✅ Simulación registrada correctamente.',
      simulacion: nuevaSimulacion
    })
  } catch (error: any) {
    console.error('❌ Error en POST /simulaciones:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// ============================================================
// === 2️⃣ GET: Calcular simulación (Método Francés)
// ============================================================
export async function GET() {
  try {
    // Traer la última simulación registrada
    const simulacion = await db.simulacion.findFirst({
      orderBy: { id_simulacion: 'desc' }
    })
    if (!simulacion)
      return NextResponse.json({ error: 'No se encontró ninguna simulación.' }, { status: 404 })

    // === Conversión a números ===
    const tipoTasa = simulacion.tipo_tasa === 'Efectiva' ? 0 : 1
    const i = Number(simulacion.tasa_interes)
    const p = simulacion.plazo_tasa_interes
    const c = Number(simulacion.capitalizacion)
    const PV = Number(simulacion.monto_prestamo)
    const CI = Number(simulacion.cuota_inicial) / 100
    const bbp = simulacion.monto_bono_bbp ? 1 : 0
    const mbbp = Number(simulacion.monto_bono_bbp) || 0
    const n = simulacion.plazo_meses
    const TSD = Number(simulacion.tem_seguro_desgravamen) || 0
    const TSI = Number(simulacion.tasa_seguro_inmueble) || 0
    const Porte = Number(simulacion.portes) || 0

    // === 1. Calcular TEM (tasa efectiva mensual)
    function calcularTEM(TipoTasa: number, i: number, p: number, c: number): number {
      if (TipoTasa === 0) {
        switch (p) {
          case 0: return Math.pow(1 + i, 30) - 1
          case 1: return Math.pow(1 + i, 2) - 1
          case 2: return i
          case 3: return Math.pow(1 + i, 1 / 2) - 1
          case 4: return Math.pow(1 + i, 1 / 3) - 1
          case 5: return Math.pow(1 + i, 1 / 4) - 1
          case 6: return Math.pow(1 + i, 1 / 6) - 1
          default: return Math.pow(1 + i, 1 / 12) - 1
        }
      } else {
        const m = c === 0 ? 360 : c === 1 ? 24 : c === 2 ? 12 : c === 3 ? 6 : c === 4 ? 4 : c === 5 ? 3 : c === 6 ? 2 : 1
        const TEA = Math.pow(1 + i / m, m) - 1
        return Math.pow(1 + TEA, 1 / 12) - 1
      }
    }

    const r = calcularTEM(tipoTasa, i, p, c)

    // === 2. Calcular capital vivo (S)
    const CI_monto = PV * CI
    const BBP_aplicado = bbp === 1 ? mbbp : 0
    const S = PV - CI_monto - BBP_aplicado

    // === 3. Calcular cuota base (método francés)
    const CuotaBase = (S * r) / (1 - Math.pow(1 + r, -n))

    // === 4. Generar matriz de pagos
    let Saldo = S
    const Flujos: number[][] = []
    const cuotas: number[] = []
    let InteresTot = 0, AmortTot = 0, SegDesTot = 0, SegInmTot = 0, PortesTot = 0

    for (let k = 1; k <= n; k++) {
      const Interes = Saldo * r
      const Amort = CuotaBase - Interes
      const SegDes = Saldo * TSD
      const SegInm = PV * TSI
      const Cuota = CuotaBase + SegDes + SegInm + Porte
      const Flujo = -1 * Cuota
      Saldo -= Amort

      InteresTot += Interes
      AmortTot += Amort
      SegDesTot += SegDes
      SegInmTot += SegInm
      PortesTot += Porte
      cuotas.push(Cuota)

      Flujos.push([
        k, CuotaBase, Interes, Amort, Saldo, SegDes, SegInm, Porte, Cuota, Flujo
      ])
    }

    // === 5. Calcular VAN
    let sumaCuotas = 0
    for (let i = 0; i < n; i++) sumaCuotas += cuotas[i] / Math.pow(1 + r, i + 1)
    const VAN = S - sumaCuotas

    // === 6. Calcular TIR (búsqueda incremental)
    let tasaAprox = 0.01, incremento = 0.000001, valorVAN = 1
    let iter = 0, limite = 100000
    const flujosTIR = [-S, ...cuotas.map(c => -c)]

    while (Math.abs(valorVAN) > 0.0001 && iter < limite) {
      valorVAN = flujosTIR[0]
      for (let i = 1; i < flujosTIR.length; i++)
        valorVAN += flujosTIR[i] / Math.pow(1 + tasaAprox, i)
      tasaAprox += valorVAN > 0 ? incremento : -incremento
      iter++
    }

    // === 7. Calcular TCEA
    const TCEA = Math.pow(1 + tasaAprox, 12) - 1

    return NextResponse.json({
      resumen: {
        tipo_tasa: simulacion.tipo_tasa,
        capitalizacion: simulacion.capitalizacion,
        tasa_ingresada: simulacion.tasa_interes,
        TEM: r,
        monto_prestamo: simulacion.monto_prestamo,
        plazo_meses: n,
        cuota_base: CuotaBase,
        VAN,
        TIR: tasaAprox,
        TCEA
      },
      headers: ["Iter", "CuotaBase", "Interes", "Amort", "Saldo", "SegDes", "SegInm", "Porte", "Cuota", "Flujo"],
      data: Flujos
    })
  } catch (error) {
    console.error('❌ Error en GET /simulaciones:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
