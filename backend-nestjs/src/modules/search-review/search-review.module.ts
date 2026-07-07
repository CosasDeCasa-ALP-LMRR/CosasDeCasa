import { Module } from '@nestjs/common';
import { PerfilEventosListener } from './application/listeners/perfil-eventos.listener';
import { SearchService } from './application/services/search.service';
import { SearchController } from './presentation/controllers/search.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [PerfilEventosListener, SearchService],
})
export class SearchReviewModule {}
