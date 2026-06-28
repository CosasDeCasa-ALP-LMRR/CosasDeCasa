import { Module } from '@nestjs/common';
import { PerfilEventosListener } from './application/listeners/perfil-eventos.listener';

@Module({
  providers: [PerfilEventosListener],
})
export class SearchReviewModule { }
