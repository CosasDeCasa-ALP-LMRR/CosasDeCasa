import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

/**
 * @fileoverview Guard personalizado para prevenir vulnerabilidades BOLA (Broken Object Level Authorization).
 * Verifica en la capa de seguridad (antes del controlador) que el documento solicitado
 * realmente pertenezca al usuario autenticado. 
 * Esto abstrae la seguridad y evita errores humanos de olvido en los Casos de Uso.
 */
@Injectable()
export class DocumentoOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuarioId = request.user?.id;
    const documentoId = request.params?.documentoId;

    if (!usuarioId || !documentoId) {
      // Si no hay sesión o no se solicita un documento específico, no aplica.
      return false;
    }

    const perfil = await this.prisma.perfil.findUnique({
      where: { usuarioId },
      select: { id: true },
    });

    if (!perfil) {
      throw new ForbiddenException('No cuentas con un perfil activo.');
    }

    const documento = await this.prisma.documento.findUnique({
      where: { id: documentoId },
      select: { perfilId: true },
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${documentoId} no encontrado.`);
    }

    // PREVENCIÓN DE BOLA
    if (documento.perfilId !== perfil.id) {
      throw new ForbiddenException(
        '[BOLA Protection] Acceso denegado: El documento solicitado no te pertenece.',
      );
    }

    return true;
  }
}
