import { Controller, Get, Post, Body, Patch, Param, Delete, DefaultValuePipe, Query } from '@nestjs/common'
import { TagService } from './tag.service'
import { CreateTagDto } from './dto/create-tag.dto'
import { UpdateTagDto } from './dto/update-tag.dto'

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto)
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('size', new DefaultValuePipe(10)) size: number,
    @Query('sort', new DefaultValuePipe('createdAt,desc')) sort: string,

    @Query('title') title?: string,
    // @Query('content') content?: string,
    @Query('tagId') tagId?: number,
  ) {
    return this.tagService.findAll(page, size, sort, title, tagId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(+id, updateTagDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagService.remove(+id)
  }
}
