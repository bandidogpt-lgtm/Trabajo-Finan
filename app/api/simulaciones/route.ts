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
      costos_iniciales, 
      gasto_admin, // 🆕 nuevo campo del body
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
    costos_iniciales = costos_iniciales ?? 0 // 🆕 default 0

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
    if (gasto_admin < 0)
      errores.push('El gasto administrativo debe ser mayor o igual a 0.')

    // 🆕 Nueva validación para costos iniciales
    if (costos_iniciales < 0 || costos_iniciales > 9999.99)
      errores.push('Los costos iniciales deben ser mayores o iguales a 0 y menores a 10,000.00.')

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
        costosIniciales: costos_iniciales,
        gastosAdministrativos: gasto_admin,
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
// === 1️⃣🅱️ PUT: Actualizar una simulación existente
// ============================================================
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const idParam = searchParams.get("id_simulacion")

    if (!idParam) {
      return NextResponse.json(
        { error: "Debe proporcionar el id_simulacion a actualizar." },
        { status: 400 }
      )
    }

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
      costos_iniciales,
      gasto_admin,
      usuario_id,
      clientes_id,
      inmueble_id
    } = body

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
    costos_iniciales = costos_iniciales ?? 0

    const errores: string[] = []

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
    if (gasto_admin < 0)
      errores.push('El gasto administrativo debe ser mayor o igual a 0.')
    if (costos_iniciales < 0 || costos_iniciales > 9999.99)
      errores.push('Los costos iniciales deben ser mayores o iguales a 0 y menores a 10,000.00.')

    if (!usuario_id || !clientes_id || !inmueble_id)
      errores.push('Debe incluir usuario_id, clientes_id e inmueble_id válidos.')

    if (errores.length > 0) {
      return NextResponse.json({ error: errores }, { status: 400 })
    }

    const simulacionActualizada = await db.simulacion.update({
      where: { id_simulacion: Number(idParam) },
      data: {
        tipo_moneda: tipo_moneda === 0 ? 'Soles' : 'Dólares',
        tipo_tasa: tipo_tasa === 0 ? 'Efectiva' : 'Nominal',
        tasa_interes,
        fecha_inicio,
        capitalizacion: String(capitalizacion),
        monto_prestamo,
        cuota_inicial,
        plazo_meses,
        plazo_tasa_interes,
        periodo_gracia: String(periodo_gracia),
        plazo_periodo_gracia,
        monto_bono_bbp,
        clasificacion_bono_bbp,
        tem_seguro_desgravamen,
        tasa_seguro_inmueble,
        portes,
        costosIniciales: costos_iniciales,
        gastosAdministrativos: gasto_admin,
        usuario_id,
        clientes_id,
        inmueble_id,
      },
    })

    return NextResponse.json({
      message: '✅ Simulación actualizada correctamente.',
      simulacion: simulacionActualizada,
    })
  } catch (error) {
    console.error('❌ Error en PUT /simulaciones:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}


// ============================================================
// === 2️⃣ GET: Calcular simulación (Método Francés + Gracia Real BCP)
// ============================================================
 export async function GET(req: Request) {

    
try {
// === Leer parámetros desde la URL ===
const { searchParams } = new URL(req.url)
const idParam = searchParams.get("id_simulacion") ?? searchParams.get("id")

console.log("🔍 ID recibido:", idParam)

let simulacion

if (idParam) {
  simulacion = await db.simulacion.findUnique({
    where: { id_simulacion: Number(idParam) },
    include: { cliente: true }
  })
} else {
  simulacion = await db.simulacion.findFirst({
    orderBy: { id_simulacion: "desc" },
    include: { cliente: true }
  })
}

if (!simulacion) {
  return NextResponse.json(
    { error: "No se encontró ninguna simulación." },
    { status: 404 }
  )
}

console.log("✔ Simulación cargada:", simulacion.id_simulacion)


    console.log(simulacion.cliente.cok)
    console.log(typeof simulacion.cliente.cok)

    // === Conversión de valores ===
    const tipoTasa = simulacion.tipo_tasa === 'Efectiva' ? 0 : 1
    const i = Number(simulacion.tasa_interes) / 100
    const p = simulacion.plazo_tasa_interes
    const c = Number(simulacion.capitalizacion)
    const PV = Number(simulacion.monto_prestamo)
    const CI = Number(simulacion.cuota_inicial) / 100
    const bbp = simulacion.monto_bono_bbp ? 1 : 0
    const mbbp = Number(simulacion.monto_bono_bbp) || 0
    const n = simulacion.plazo_meses

    const COK_TEA = simulacion.cliente.cok?.toNumber() ?? 0
    const COK_TEM = Math.pow(1 + COK_TEA, 1/12) - 1

    const TSD = Number(simulacion.tem_seguro_desgravamen) / 100
    const TSI = Number(simulacion.tasa_seguro_inmueble) / 100
    const Porte = Number(simulacion.portes) || 0
    const GADM = Number(simulacion.gastosAdministrativos) || 0
    const costosIniciales = Number(simulacion.costosIniciales) || 0
console.log(COK_TEA)
console.log(typeof COK_TEA)
    // === TEM del préstamo ===
function calcularTEM(
  TipoTasa: number,
  i: number,
  p: number,
  c: number
): number {
  if (TipoTasa === 0) {
    switch (p) {
      case 0: return (1 + i) ** 30 - 1
      case 1: return (1 + i) ** 2 - 1
      case 2: return i
      case 3: return (1 + i) ** 0.5 - 1
      case 4: return (1 + i) ** (1 / 3) - 1
      case 5: return (1 + i) ** 0.25 - 1
      case 6: return (1 + i) ** (1 / 6) - 1
      default: return (1 + i) ** (1 / 12) - 1
    }
  } else {
    const m =
      c === 0 ? 360 :
      c === 1 ? 24 :
      c === 2 ? 12 :
      c === 3 ? 6 :
      c === 4 ? 4 :
      c === 5 ? 3 :
      c === 6 ? 2 : 1

    const TEA = (1 + i / m) ** m - 1
    return (1 + TEA) ** (1 / 12) - 1
  }
}


    const r = calcularTEM(tipoTasa, i, p, c)

    // === Capital financiado ===
    const CI_monto = PV * CI //CI loe stoy guardando como porcentaje xd
    const BBP_aplicado = bbp ? mbbp : 0
    const S = PV - CI_monto - BBP_aplicado + costosIniciales

    // === Parámetros de gracia ===
    const g = Number(simulacion.periodo_gracia)
    const pg = Number(simulacion.plazo_periodo_gracia)

    // === Variables del cronograma ===
    let Saldo = S
    let CuotaBase = 0
    let debeRecalcularCuota = false

    const Flujos = []
    const cuotas = []

// === Bucle del cronograma mensual ===
    for (let k = 1; k <= n; k++) {
      let Interes = Saldo * r
      let SegDes = Number((-Saldo * TSD).toFixed(2))          // seguro desgravamen
      let SegInm = Number((-(PV * TSI) / 12).toFixed(2))      // seguro inmueble
      let PorteVal = Number((-Porte).toFixed(2))              // portes
      let GastoAdmin = Number((-GADM).toFixed(2))             // gasto admin
      let Amort = 0
      let Cuota = 0

      // === 1. PERIODO DE GRACIA ===
      if (k <= pg && g > 0) {

        if (g === 2) {
          // === Gracia Total ===
          // NO paga interés
          // NO paga amortización
          // SOLO paga seguros + portes
        CuotaBase = 0                // no se paga nada del préstamo
        Amort = 0                // no hay amortización
        Saldo = Saldo + Interes  // interés se capitaliza
          Cuota =(-SegDes) + (-SegInm) +(-PorteVal) +(-GastoAdmin)
        }


        if (g === 1) {
          // === Gracia Parcial ===
          Cuota = Interes + (-SegDes) + (-SegInm) +(-PorteVal) +(-GastoAdmin)
          Amort = 0
          Saldo = Saldo
        }

        if (k === pg) debeRecalcularCuota = true

        cuotas.push(Number(Cuota.toFixed(2)))
        Flujos.push([
          //k, Number(CuotaBase.toFixed(2)),
         // Number(Cuota.toFixed(2)),
          Number(-Interes.toFixed(2)),
          Number(-Amort.toFixed(2)),
          Number(SegDes.toFixed(2)),
          Number(SegInm.toFixed(2)),
          Number(PorteVal.toFixed(2)),

          Number(GastoAdmin.toFixed(2)),
          Number((-Cuota).toFixed(2)),

          Number(Saldo.toFixed(2)),
        ])

        continue
      }

      // === 2. RE-CÁLCULO DE CUOTA BASE AL TERMINAR GRACIA ===
      if (debeRecalcularCuota) {
        const tasa = r + TSD
        CuotaBase = (Saldo * tasa) / (1 - (1 + tasa) ** -(n - pg))
        debeRecalcularCuota = false
      }

      // Si no hubo gracia, usar método francés normal
      if (CuotaBase === 0) {
        const tasa = r + TSD
        CuotaBase = (Saldo * tasa) / (1 - (1 + tasa) ** -n)
      }

      // === 3. CUOTA NORMAL ===
      Amort = CuotaBase - Interes - (-SegDes)
      Cuota = Interes + Amort - SegDes - SegInm - PorteVal -GastoAdmin
      Saldo = Saldo - Amort

      cuotas.push(Number(Cuota.toFixed(2)))
      Flujos.push([
        //k,
       // Number(CuotaBase.toFixed(2)),
        //Number(Cuota.toFixed(2)),
        Number(-Interes.toFixed(2)),
        Number(-Amort.toFixed(2)),
        Number(SegDes.toFixed(2)),
        Number(SegInm.toFixed(2)),
        Number(PorteVal.toFixed(2)),

        Number(GastoAdmin.toFixed(2)),
        Number((-Cuota).toFixed(2)),

        Number(Saldo.toFixed(2)),
      ])
    }  


      // === 5. Calcular VAN y TIR
      let sumaCuotas = 0
      for (let i = 0; i < n; i++) {
        sumaCuotas += -cuotas[i] / Math.pow(1 + COK_TEM, i + 1)
      }

      const VAN = S + sumaCuotas

      // === TIR EXACTA (tu método original)
      const flujosTIR = [-S, ...cuotas]
      let tasaAprox = 0.01, incremento = 0.000001, valorVAN = 1, iter = 0, limite = 100000

      while (Math.abs(valorVAN) > 0.0001 && iter < limite) {
        valorVAN = 0
        for (let i = 0; i < flujosTIR.length; i++) {
          valorVAN += flujosTIR[i] / Math.pow(1 + tasaAprox, i)
        }
        tasaAprox += valorVAN > 0 ? incremento : -incremento
        iter++
      }

      // === TCEA (tu fórmula original)
      const TCEA = Math.pow(1 + tasaAprox, 12) - 1
let descripcionGracia = ""

if (g === 0) {
  descripcionGracia = "Sin periodo de gracia"
} else if (g === 1) {
  descripcionGracia = `Gracia parcial por ${pg} meses (solo paga intereses)`
} else if (g === 2) {
  descripcionGracia = `Gracia total por ${pg} meses (no paga nada)`
}
    return NextResponse.json({

      
      resumen: {
        tipo_tasa: simulacion.tipo_tasa,
        capitalizacion: simulacion.capitalizacion,
        tasa_ingresada: simulacion.tasa_interes,
        TEM: Number(r.toFixed(6)),
        saldo_financiar: PV-CI_monto,
        costos_iniciales: costosIniciales,
        monto_prestamo_total: S,
        cuota_base: Number(CuotaBase.toFixed(2)),
        plazo_meses: n,
        // 🟦 NUEVO: detalles de gracia
        periodo_gracia_tipo: g,
        periodo_gracia_meses: pg,
        periodo_gracia_descripcion: descripcionGracia,

       
        VAN: Number(VAN.toFixed(2)),
        TIR: Number((tasaAprox * 100).toFixed(2)) + "%",
        TCEA: Number((TCEA * 100).toFixed(2)) + "%"
      },
      headers: [/*"CuotaBase","Cuota",*/"Interes","Amort","Seg. Des.","Seg. Inm.","Porte","Gastos Admin","Flujo","Saldo Final"],
      data: Flujos
    })

  } catch (error) {
    console.error("❌ Error en GET /simulaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

