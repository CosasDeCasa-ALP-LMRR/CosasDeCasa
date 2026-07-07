import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { IdentityModule } from './modules/identity/identity.module';
import { BillingModule } from './modules/billing/billing.module';
import { MatchModule } from './modules/match/match.module';
import { SearchReviewModule } from './modules/search-review/search-review.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/winston.config';
import { AntiInjectionMiddleware } from './common/middlewares/anti-injection.middleware';

@Module({
  imports: [
    //RNF3
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    WinstonModule.forRoot(winstonConfig),
    EventEmitterModule.forRoot(),
    PrismaModule,
    IdentityModule,
    BillingModule,
    MatchModule,
    SearchReviewModule,
    MessagingModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AntiInjectionMiddleware).forRoutes('*');
  }
}
