-- DropForeignKey
ALTER TABLE "Documento" DROP CONSTRAINT "Documento_perfilId_fkey";

-- AlterTable
ALTER TABLE "Perfil" ADD COLUMN     "diasYHorarios" JSONB;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;
