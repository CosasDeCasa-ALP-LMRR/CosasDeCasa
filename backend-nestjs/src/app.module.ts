import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { IdentityModule } from './modules/identity/identity.module';
import { BillingModule } from './modules/billing/billing.module';
import { MatchModule } from './modules/match/match.module';
import { SearchReviewModule } from './modules/search-review/search-review.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/winston.config';

@Module({
  imports: [
    //RNF3
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    WinstonModule.forRoot(winstonConfig),
    EventEmitterModule.forRoot(),
    PrismaModule,
    IdentityModule,
    BillingModule,
    MatchModule,
    SearchReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
