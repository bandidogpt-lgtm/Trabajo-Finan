/*
  Warnings:

  - You are about to drop the `Nota` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Nota";

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "dni" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "duenio_propiedad" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "ingreso_mensual" DECIMAL(65,30) NOT NULL,
    "estado_civil" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);
