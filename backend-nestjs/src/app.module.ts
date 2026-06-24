import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { IdentityModule } from './modules/identity/identity.module';
import { BillingModule } from './modules/billing/billing.module';
import { MatchModule } from './modules/match/match.module';
import { SearchReviewModule } from './modules/search-review/search-review.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PrismaModule,
    IdentityModule,
    BillingModule,
    MatchModule,
    SearchReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
