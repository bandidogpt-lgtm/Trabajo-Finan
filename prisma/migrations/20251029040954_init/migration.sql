/*
  Warnings:

  - You are about to alter the column `dni` on the `Cliente` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(8)`.
  - You are about to alter the column `apellidos` on the `Cliente` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `email` on the `Cliente` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `direccion` on the `Cliente` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `ingreso_mensual` on the `Cliente` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,3)`.
  - You are about to alter the column `estado_civil` on the `Cliente` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `telefono` on the `Cliente` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(9)`.

*/
-- AlterTable
ALTER TABLE "Cliente" ALTER COLUMN "dni" SET DATA TYPE VARCHAR(8),
ALTER COLUMN "apellidos" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "direccion" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "ingreso_mensual" SET DATA TYPE DECIMAL(12,3),
ALTER COLUMN "estado_civil" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "telefono" SET DATA TYPE VARCHAR(9);

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
    "clave" VARCHAR(50) NOT NULL,
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
    "tem_seguro_desgravamen" DECIMAL(6,3),
    "tasa_seguro_inmueble" DECIMAL(6,3),
    "usuario_id" INTEGER NOT NULL,
    "clientes_id" INTEGER NOT NULL,
    "inmueble_id" INTEGER NOT NULL,

    CONSTRAINT "Simulacion_pkey" PRIMARY KEY ("id_simulacion")
);

-- AddForeignKey
ALTER TABLE "Simulacion" ADD CONSTRAINT "Simulacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulacion" ADD CONSTRAINT "Simulacion_clientes_id_fkey" FOREIGN KEY ("clientes_id") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulacion" ADD CONSTRAINT "Simulacion_inmueble_id_fkey" FOREIGN KEY ("inmueble_id") REFERENCES "Inmueble"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
