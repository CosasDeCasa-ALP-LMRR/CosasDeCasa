import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { ProfesionalCardResponseDto } from '../../../identity/application/dtos/response/ProfesionalCard.response-dto';
import { SearchQueryDto } from '../dtos/SearchQuery.dto';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchProfessionals(query: SearchQueryDto): Promise<ProfesionalCardResponseDto[]> {
    const { q, category, minRating } = query;

    const filters: any = {
      estadoVerificacion: 'APROBADO',
      usuario: {
        activo: true,
        situacion_cuenta: 'ACTIVA',
      },
    };

    if (category) {
      filters.categoriaPrincipal = category;
    }

    if (minRating !== undefined && minRating > 0) {
      filters.promedioCalificacion = { gte: minRating };
    }

    let tagMatchIds: string[] = [];

    if (q) {
      try {
        // PostgreSQL: Convert array to string and search case-insensitively
        const result = await this.prisma.$queryRaw<{id: string}[]>`
          SELECT id FROM "Perfil" 
          WHERE array_to_string(etiquetas, ' ') ILIKE ${'%' + q + '%'}
        `;
        tagMatchIds = result.map((r) => r.id);
      } catch (e) {
        console.error('Error finding tags by substring:', e);
      }

      filters.OR = [
        { categoriaPrincipal: { contains: q, mode: 'insensitive' } },
        { municipio: { contains: q, mode: 'insensitive' } },
        { estadoRep: { contains: q, mode: 'insensitive' } },
        { usuario: { nombre: { contains: q, mode: 'insensitive' } } },
        ...(tagMatchIds.length > 0 ? [{ id: { in: tagMatchIds } }] : [])
      ];
    }

    const perfiles = await this.prisma.perfil.findMany({
      where: filters,
      select: {
        id: true,
        categoriaPrincipal: true,
        etiquetas: true,
        promedioCalificacion: true,
        aceptaUrgencias: true,
        municipio: true,
        estadoRep: true,
        usuario: {
          select: {
            nombre: true,
            fotoPerfil: true,
          },
        },
      },
      orderBy: {
        promedioCalificacion: 'desc',
      },
    });

    return perfiles.map(
      (p) =>
        new ProfesionalCardResponseDto({
          id: p.id,
          nombre: p.usuario.nombre,
          fotoPerfil: p.usuario.fotoPerfil ?? null,
          categoriaPrincipal: p.categoriaPrincipal,
          etiquetas: p.etiquetas,
          promedioCalificacion: p.promedioCalificacion,
          aceptaUrgencias: p.aceptaUrgencias,
          municipio: p.municipio,
          estadoRep: p.estadoRep,
        }),
    );
  }
}
