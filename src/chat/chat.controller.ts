import { Controller, Get, Post, Body, Patch, Param, Delete, Query, DefaultValuePipe } from '@nestjs/common'
import { ChatService } from './chat.service'
import { CreateChatDto } from './dto/create-chat.dto'
import { UpdateChatDto } from './dto/update-chat.dto'
import { Auth } from '@/auth/decorator/auth.decorator'
import { User } from '@prisma/client'
import { CurrentUser } from '@/auth/decorator/user.decorator'

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto)
  }

  @Get()
  findAll() {
    return this.chatService.findAll()
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.chatService.findOne(+id)
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(+id, updateChatDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(+id)
  }
  @Get('/getMsgsByRoomId')
  @Auth()
  findMsgsByRoomId(
    @CurrentUser() user: User,
    @Query('roomId') roomId: number,
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('size', new DefaultValuePipe(10)) size: number,
    @Query('sort', new DefaultValuePipe('createdAt,desc')) sort: string,
  ) {
    return this.chatService.findMsgsByRoomId(user, roomId, page, size, sort)
  }
}
