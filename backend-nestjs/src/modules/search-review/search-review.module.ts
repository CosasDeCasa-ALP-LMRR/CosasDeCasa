import { Module } from '@nestjs/common';
import { PerfilEventosListener } from './application/listeners/perfil-eventos.listener';
import { SearchService } from './application/services/search.service';
import { SearchController } from './presentation/controllers/search.controller';
import { ReviewService } from './application/services/review.service';
import { ReviewController } from './presentation/controllers/review.controller';
import { PrismaModule } from '../../database/prisma.module';
import { IdentityModule } from '../identity/identity.module';
import { JwtAuthGuard } from '../identity/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/presentation/guards/roles.guard';

@Module({
  imports: [PrismaModule, IdentityModule],
  controllers: [SearchController, ReviewController],
  providers: [PerfilEventosListener, SearchService, ReviewService, JwtAuthGuard, RolesGuard],
})
export class SearchReviewModule {}

