import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { CreateReviewDto } from '../dtos/CreateReview.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async createReview(
    clienteId: string,
    profesionalId: string,
    dto: CreateReviewDto,
  ) {
    const profesional = await this.prisma.usuario.findUnique({
      where: { id: profesionalId },
      include: { perfil: true },
    });

    if (!profesional || profesional.rol !== 'PROFESIONAL') {
      throw new NotFoundException('Profesional no encontrado');
    }

    if (!profesional.perfil) {
      throw new BadRequestException('El profesional no tiene un perfil activo');
    }

    if (clienteId === profesionalId) {
      throw new BadRequestException('No puedes dejarte una reseña a ti mismo');
    }

    const nuevaResena = await this.prisma.resena.create({
      data: {
        clienteId,
        profesionalId,
        calificacion: dto.calificacion,
        comentario: dto.comentario,
      },
    });

    const resenas = await this.prisma.resena.findMany({
      where: { profesionalId },
    });

    const suma = resenas.reduce((acc, curr) => acc + curr.calificacion, 0);
    const promedio = resenas.length > 0 ? suma / resenas.length : 0;

    await this.prisma.perfil.update({
      where: { usuarioId: profesionalId },
      data: { promedioCalificacion: promedio },
    });

    return nuevaResena;
  }

  async getReviewsByProfessional(profesionalId: string) {
    return this.prisma.resena.findMany({
      where: { profesionalId },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            fotoPerfil: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });
  }
}
