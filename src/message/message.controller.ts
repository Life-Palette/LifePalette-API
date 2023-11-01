import { Controller, Get, Post, Body, Patch, Param, Delete, Query, DefaultValuePipe } from '@nestjs/common'
import { MessageService } from './message.service'
import { CreateMessageDto } from './dto/create-message.dto'
import { UpdateMessageDto } from './dto/update-message.dto'
import { UpdateMessageAllDto } from './dto/update-message-all.dto'
import { Auth } from '@/auth/decorator/auth.decorator'
import { CurrentUser } from '@/auth/decorator/user.decorator'
import { User } from '@prisma/client'

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @Auth()
  create(@Body() createMessageDto: CreateMessageDto, @CurrentUser() user: User) {
    return this.messageService.create(createMessageDto, user)
  }
  // 改变消息为已读
  @Post('/updateMessage')
  @Auth()
  updateMessage(@Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.updateMessage(updateMessageDto)
  }
  // 将所有未读消息改为已读
  @Post('/updateAll')
  @Auth()
  updateAll(@Body() updateMessageAllDto: UpdateMessageAllDto, @CurrentUser() user: User) {
    return this.messageService.updateAll(updateMessageAllDto, user)
  }

  @Get('/getOneByInfo')
  @Auth()
  findOneByInfo(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('size', new DefaultValuePipe(10)) size: number,
    @Query('sort', new DefaultValuePipe('createdAt,desc')) sort: string,
    // @Query('receiverId') receiverId?: number,
    @Query('senderId') senderId?: number,
    @Query('type') type?: string,
    @Query('isRead') isRead?: boolean,
  ) {
    return this.messageService.findOneByInfo(user, page, size, sort, senderId, type, isRead)
  }
  // 根据id删除消息
  @Delete(':id')
  @Auth()
  deleteMessage(@Param('id') id: number) {
    return this.messageService.deleteMessage(id)
  }

  // 删除用户的所有消息
  @Delete()
  @Auth()
  deleteAll(@CurrentUser() user: User) {
    return this.messageService.deleteAllMessage(user)
  }
  // 获取未读消息数量
  @Get('/getUnreadMessageCount')
  @Auth()
  getUnreadMessageCount(@CurrentUser() user: User) {
    return this.messageService.getUnreadMessageCount(user)
  }
}
