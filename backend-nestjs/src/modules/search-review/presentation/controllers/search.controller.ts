import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from '../../application/services/search.service';
import { SearchQueryDto } from '../../application/dtos/SearchQuery.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('profesionales')
  async searchProfessionals(@Query() query: SearchQueryDto) {
    return await this.searchService.searchProfessionals(query);
  }
}
