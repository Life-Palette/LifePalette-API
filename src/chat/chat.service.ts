import { Injectable } from '@nestjs/common'
import { CreateChatDto } from './dto/create-chat.dto'
import { UpdateChatDto } from './dto/update-chat.dto'
import { ChatRoom, ChatMessage } from '@prisma/client'
import { PrismaService } from './../prisma/prisma.service'
import { User } from '@prisma/client'
import { paginateT } from '@/helper'
@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}
  create(createChatDto: CreateChatDto) {
    return 'This action adds a new chat'
  }

  findAll() {
    return `This action returns all chat`
  }

  findOne(id: number) {
    console.log('🐠-----findOne-----')
    return `This action returns a #${id} chat`
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`
  }

  remove(id: number) {
    return `This action removes a #${id} chat`
  }
  async findMsgsByRoomId(user: User, roomId: number, page: number, size: number, sort: string) {
    const where = {}
    where['roomId'] = { equals: roomId }
    const sortWay = sort.split(',').find((item) => ['desc', 'asc'].includes(item)) || 'desc'
    const sortField = sort.split(',').find((item) => !['desc', 'asc'].includes(item)) || 'createdAt'
    const data = await this.prisma.chatMessage.findMany({
      skip: (page - 1) * size,
      take: size,
      orderBy: { [sortField]: sortWay },
      where,
    })
    // 处理userId,变为用户信息
    const dataTemp = data.map(async (item) => {
      const { userId } = item
      const userInfo = await this.prisma.user.findUnique({
        where: { id: +userId },
      })
      return { ...item, userInfo }
    })
    const result = await Promise.all(dataTemp)
    const total = await this.prisma.chatMessage.count({ where })
    return paginateT({
      page,
      data: result,
      size,
      total,
    })
  }
}
