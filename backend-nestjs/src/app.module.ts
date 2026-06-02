import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentityModule } from './modules/identity/identity.module';
import { BillingModule } from './modules/billing/billing.module';
import { MatchModule } from './modules/match/match.module';
import { SearchReviewModule } from './modules/search-review/search-review.module';

@Module({
  imports: [IdentityModule, BillingModule, MatchModule, SearchReviewModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
