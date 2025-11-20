/*
  Warnings:

  - You are about to alter the column `portes` on the `Simulacion` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(6,2)`.
  - You are about to alter the column `tem_seguro_desgravamen` on the `Simulacion` table. The data in that column could be lost. The data in that column will be cast from `Decimal(6,3)` to `Decimal(6,6)`.
  - You are about to alter the column `tasa_seguro_inmueble` on the `Simulacion` table. The data in that column could be lost. The data in that column will be cast from `Decimal(6,3)` to `Decimal(6,6)`.

*/
-- AlterTable
ALTER TABLE "Simulacion" ADD COLUMN     "gastosAdministrativos" DECIMAL(6,2),
ALTER COLUMN "portes" SET DATA TYPE DECIMAL(6,2),
ALTER COLUMN "tem_seguro_desgravamen" SET DATA TYPE DECIMAL(6,6),
ALTER COLUMN "tasa_seguro_inmueble" SET DATA TYPE DECIMAL(6,6);
