import { Auth } from '@/auth/decorator/auth.decorator'
import { CurrentUser } from '@/auth/decorator/user.decorator'
import { Policy } from '@/casl/policy.decortor'
import { Body, Controller, DefaultValuePipe, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { User } from '@prisma/client'
import { CreateTopicDto } from './dto/create-topic.dto'
import { UpdateTopicDto } from './dto/update-topic.dto'
import { TopicService } from './topic.service'
import { Role } from '@/auth/enum'

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post()
  @Auth()
  create(@Body() createTopicDto: CreateTopicDto, @CurrentUser() user: User) {
    return this.topicService.create(createTopicDto, user)
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('size', new DefaultValuePipe(10)) size: number,
    @Query('sort', new DefaultValuePipe('createdAt,desc')) sort: string,

    @Query('title') title?: string,
    @Query('keywords') keywords?: string,
    @Query('tagId') tagId?: number,
  ) {
    return this.topicService.findAll(page, size, sort, title, tagId, keywords)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('userId') userId?: number) {
    return this.topicService.findOne(+id, userId)
  }

  @Patch(':id')
  @Policy({ action: 'update', type: 'Topic' })
  async update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto) {
    return this.topicService.update(+id, updateTopicDto)
  }

  // 批量删除
  @Delete('/batch')
  @Policy({ action: 'delete', type: 'Topic' })
  removeMany(@Body() ids: number[]) {
    return this.topicService.removeMany(ids)
  }
  // 删除单个
  @Delete(':id')
  @Policy({ action: 'delete', type: 'Topic' })
  remove(@Param('id') id: string) {
    return this.topicService.remove(+id)
  }
}
