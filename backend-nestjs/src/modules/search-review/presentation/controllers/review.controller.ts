import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: { id: string; role?: string };
}
import { ReviewService } from '../../application/services/review.service';
import { CreateReviewDto } from '../../application/dtos/CreateReview.dto';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { Roles } from '../../../identity/presentation/guards/roles.decorator';

@Controller('search/review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':profesionalId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  async createReview(
    @Request() req: RequestWithUser,
    @Param('profesionalId') profesionalId: string,
    @Body() dto: CreateReviewDto,
  ) {
    const clienteId = req.user.id;
    return this.reviewService.createReview(clienteId, profesionalId, dto);
  }

  @Get(':profesionalId')
  async getReviewsByProfessional(
    @Param('profesionalId') profesionalId: string,
  ) {
    return this.reviewService.getReviewsByProfessional(profesionalId);
  }
}
