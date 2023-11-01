import { Injectable } from '@nestjs/common'
import { PrismaService } from './../prisma/prisma.service'
import { CreateMessageDto } from './dto/create-message.dto'
import { UpdateMessageDto } from './dto/update-message.dto'
import { UpdateMessageAllDto } from './dto/update-message-all.dto'
import { User } from '@prisma/client'
import { paginateT } from '@/helper'

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}
  // 白名单
  private readonly whiteList = ['system']
  async create(createMessageDto: CreateMessageDto, user: User) {
    const senderId = user.id
    const { receiverId, content, type, objId } = createMessageDto
    try {
      const typeWhiteList = this.whiteList
      const message = await this.prisma.message.create({
        data: {
          sender: { connect: { id: senderId } },
          content,
          type,
          ...(objId && { obj: +objId }),
          ...(!typeWhiteList.includes(type) && { receiver: { connect: { id: +receiverId } } }),
        },
      })
      return message
    } catch (error) {
      console.error('Error creating message:', error)
      throw error
    }
  }
  async findOneByInfo(
    user: User,
    page: number,
    size: number,
    sort: string,
    senderId?: number,
    type?: string,
    isRead?: boolean,
  ) {
    // console.log('🌳-----type-----', type)
    const where = {}
    // receiverId && (where['receiverId'] = { equals: +receiverId })
    if (type && this.whiteList.includes(type.toString())) {
    } else {
      where['receiverId'] = { equals: +user.id }
    }

    senderId && (where['senderId'] = { equals: +senderId })
    type && (where['type'] = { equals: type })
    isRead && (where['isRead'] = { equals: isRead })
    const sortWay = sort.split(',').find((item) => ['desc', 'asc'].includes(item)) || 'desc'
    const sortField = sort.split(',').find((item) => !['desc', 'asc'].includes(item)) || 'createdAt'
    const data = await this.prisma.message.findMany({
      skip: (page - 1) * size,
      take: size,
      orderBy: { [sortField]: sortWay },
      where,
    })
    const dataTemp = data.map(async (item) => {
      const { receiverId, senderId, objId, type } = item
      let sendUserInfo
      let receiveUserInfo
      let objInfo
      // 发送者信息
      if (senderId) {
        sendUserInfo = await this.prisma.user.findUnique({
          where: { id: senderId },
        })
      } else {
        sendUserInfo = null
      }
      // 接收者信息
      if (receiverId) {
        receiveUserInfo = await this.prisma.user.findUnique({
          where: { id: receiverId },
        })
      } else {
        receiveUserInfo = null
      }
      // obj信息
      if (objId) {
        let findUniqueObj: any
        switch (type) {
          case 'like':
            findUniqueObj = this.prisma.topic.findUnique
            break
          default:
        }

        if (findUniqueObj) {
          objInfo = await findUniqueObj({
            where: { id: objId },
          })
        }
      } else {
        objInfo = null
      }

      return {
        ...item,
        sendUserInfo,
        receiveUserInfo,
        objInfo,
      }
    })

    const total = await this.prisma.message.count({ where })
    const pagedata = await Promise.all(dataTemp)
    return paginateT({ page, data: pagedata, size: size, total })
  }

  async updateMessage(updateTopicDto: UpdateMessageDto) {
    const { id } = updateTopicDto
    return this.prisma.message.update({
      where: { id: +id },
      data: {
        isRead: true,
      },
    })
  }
  async updateAll(updateMessageAllDto: UpdateMessageAllDto, user: User) {
    const { type } = updateMessageAllDto
    const receiverId = +user.id
    const where = {}
    type && (where['type'] = { equals: type })
    receiverId && (where['receiverId'] = { equals: receiverId })
    return this.prisma.message.updateMany({
      where,
      data: {
        isRead: true,
      },
    })
  }
  // 根据id删除消息
  async deleteMessage(id: number) {
    try {
      return this.prisma.message.delete({
        where: { id: +id },
      })
    } catch (error) {
      console.error('Error creating message:', error)
      throw error
    }
  }
  // 删除用户的所有消息
  async deleteAllMessage(user: User) {
    const receiverId = +user.id
    return this.prisma.message.deleteMany({
      where: { receiverId },
    })
  }
  // 获取未读消息数量
  async getUnreadMessageCount(user: User) {
    const receiverId = +user.id
    const count = await this.prisma.message.count({
      where: { receiverId, isRead: false },
    })
    // 增加对应类型（type字段）的条数显示
    const typeCountData = await this.prisma.message.groupBy({
      by: ['type'],
      where: { isRead: false },
      _count: {
        type: true,
      },
    })
    // 转换为【type】:count的形式
    const typeCount = typeCountData.reduce((acc, cur) => {
      acc[cur.type] = cur._count.type
      return acc
    }, {})
    // console.log('🦄-----typeCount-----', typeCount)

    return {
      count,
      typeCount,
    }
  }
}
