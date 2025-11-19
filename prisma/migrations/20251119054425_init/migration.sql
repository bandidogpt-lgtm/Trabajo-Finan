-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "dni" VARCHAR(8) NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "duenio_propiedad" INTEGER NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "direccion" VARCHAR(150) NOT NULL,
    "ingreso_mensual" DECIMAL(12,3) NOT NULL,
    "estado_civil" VARCHAR(20) NOT NULL,
    "telefono" VARCHAR(9) NOT NULL,
    "cok" DECIMAL(6,3),

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inmueble" (
    "id" SERIAL NOT NULL,
    "nombre_proyecto" VARCHAR(100) NOT NULL,
    "precio_venta" DECIMAL(12,3) NOT NULL,
    "nro_cuartos" INTEGER NOT NULL,
    "area_m2" DECIMAL(6,2) NOT NULL,
    "ubicacion" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "tipo" VARCHAR(100) NOT NULL,
    "imagen_referencial" VARCHAR(500),

    CONSTRAINT "Inmueble_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "apellido" VARCHAR(50) NOT NULL,
    "clave" VARCHAR(150) NOT NULL,
    "correo" VARCHAR(50) NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "rol" VARCHAR(50) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Simulacion" (
    "id_simulacion" SERIAL NOT NULL,
    "tipo_moneda" VARCHAR(20) NOT NULL,
    "tipo_tasa" VARCHAR(20) NOT NULL,
    "tasa_interes" DECIMAL(6,3) NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "capitalizacion" VARCHAR(20),
    "monto_prestamo" DECIMAL(12,2) NOT NULL,
    "cuota_inicial" DECIMAL(10,2) NOT NULL,
    "cuota_mensual" DECIMAL(6,2) NOT NULL,
    "periodo_gracia" VARCHAR(20),
    "plazo_tasa_interes" INTEGER NOT NULL,
    "plazo_meses" INTEGER NOT NULL,
    "plazo_periodo_gracia" INTEGER NOT NULL,
    "monto_bono_bbp" DECIMAL(6,2),
    "clasificacion_bono_bbp" INTEGER,
    "portes" INTEGER,
    "costosIniciales" DECIMAL(6,2),
    "tem_seguro_desgravamen" DECIMAL(6,3),
    "tasa_seguro_inmueble" DECIMAL(6,3),
    "usuario_id" INTEGER NOT NULL,
    "clientes_id" INTEGER NOT NULL,
    "inmueble_id" INTEGER NOT NULL,

    CONSTRAINT "Simulacion_pkey" PRIMARY KEY ("id_simulacion")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_dni_key" ON "Cliente"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- AddForeignKey
ALTER TABLE "Simulacion" ADD CONSTRAINT "Simulacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulacion" ADD CONSTRAINT "Simulacion_clientes_id_fkey" FOREIGN KEY ("clientes_id") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulacion" ADD CONSTRAINT "Simulacion_inmueble_id_fkey" FOREIGN KEY ("inmueble_id") REFERENCES "Inmueble"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
