-- CreateEnum
CREATE TYPE "SituacionCuenta" AS ENUM ('ACTIVA', 'PENDIENTE_REVISION', 'ANONIMIZADA', 'RECHAZADA_OCULTA');

-- CreateEnum
CREATE TYPE "EstadoSolicitudCancelacion" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "situacion_cuenta" "SituacionCuenta" NOT NULL DEFAULT 'ACTIVA';

-- CreateTable
CREATE TABLE "SolicitudCancelacion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "justificacion" TEXT NOT NULL,
    "auditorId" TEXT,
    "estado" "EstadoSolicitudCancelacion" NOT NULL DEFAULT 'PENDIENTE',
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaResolucion" TIMESTAMP(3),

    CONSTRAINT "SolicitudCancelacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SolicitudCancelacion" ADD CONSTRAINT "SolicitudCancelacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudCancelacion" ADD CONSTRAINT "SolicitudCancelacion_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
