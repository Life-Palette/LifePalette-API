import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { LikeService } from './like.service'
import { CreateLikeDto } from './dto/create-like.dto'
import { UpdateLikeDto } from './dto/update-like.dto'
import { Auth } from '@/auth/decorator/auth.decorator'
import { CurrentUser } from '@/auth/decorator/user.decorator'
import { User } from '@prisma/client'

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  @Auth()
  create(@Body() createLikeDto: CreateLikeDto, @CurrentUser() user: User) {
    return this.likeService.create(createLikeDto, user)
  }

  @Get()
  findAll(@Query('topicId') topicId: number) {
    return this.likeService.findAll(topicId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.likeService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLikeDto: UpdateLikeDto) {
    return this.likeService.update(+id, updateLikeDto)
  }

  @Delete()
  @Auth()
  remove(@Body() createLikeDto: CreateLikeDto, @CurrentUser() user: User) {
    return this.likeService.remove(createLikeDto, user)
  }
}
