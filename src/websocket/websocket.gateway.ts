import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { createServer } from 'http'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { PrismaService } from './../prisma/prisma.service'
// import { WebsocketService } from './websocket.service'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  port: 3003,
  adapter: new IoAdapter(createServer()),
})
export class WsStartGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server
  private onlineCount = 0
  private rooms: any = []
  constructor(private prisma: PrismaService) {}

  afterInit(): void {
    this.broadcastOnlineCount()
  }

  handleConnection(client: Socket): void {
    console.log('🦄-----handleConnection-----', this.onlineCount, client.id)
    this.onlineCount += 1
    this.broadcastOnlineCount()
  }

  handleDisconnect(client: Socket): void {
    console.log('🦄-----链接断开-----', this.onlineCount)
  }

  private broadcastOnlineCount(): void {
    const message = JSON.stringify({ event: 'onlineCount', data: this.onlineCount })
    this.server.emit('message', message)
  }

  @SubscribeMessage('hello')
  hello(@MessageBody() data: any): any {
    return {
      event: 'hello',
      data: data,
      msg: 'rustfisher.com',
    }
  }

  @SubscribeMessage('hello2')
  hello2(@MessageBody() data: any, @ConnectedSocket() client: Socket): any {
    client.send(JSON.stringify({ event: 'tmp', data: '这里是个临时信息rustfisher.com' }))
    this.onlineCount++
    this.broadcastOnlineCount()
    return { event: 'hello2', data: data }
  }

  // @SubscribeMessage('chat')
  // handleChatMessage(@MessageBody() message: string, @ConnectedSocket() sender: Socket): void {
  //   const broadcastMessage = JSON.stringify({ event: 'message', data: message })
  //   this.server.emit('message', broadcastMessage)
  // }
  // 加入房间
  @SubscribeMessage('joinRoom')
  async joinRoom(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<void> {
    console.log('🍪-----joinRoom-----', data)
    const { roomId, userId } = data
    // 数据库聊天室初始化
    await this.initRoom(data)

    const roomIndex = this.rooms.findIndex((item) => item.roomId === roomId)
    // 获取用户信息
    const userInfo = await this.prisma.user.findUnique({
      where: { id: +userId },
    })
    const addClient = {
      userId,
      userInfo,
      client,
    }
    if (roomIndex === -1) {
      this.rooms.push({ roomId, clients: [addClient] })
    } else {
      const roomClients = this.rooms[roomIndex].clients
      const clientIndex = roomClients.findIndex((item) => item.userId === userId)
      if (clientIndex === -1) {
        this.rooms[roomIndex].clients.push(addClient)
      } else {
        const messageTemp = { event: 'tip', data: `Have joined the room ` }
        const msg = this.getBaseMsg(roomId, userId, messageTemp)
        client.send(msg)
        roomClients[clientIndex].client = client
        return
      }
    }

    const { name } = userInfo
    const message = { event: 'roomJoined', data: `${name} joined the room ` }

    const senMsg = this.getBaseMsg(roomId, userId, message)
    // console.log('🐳-----senMsg-----', senMsg)
    const roomClients = this.rooms.find((item) => item.roomId === roomId).clients
    roomClients.forEach((item) => {
      item.client.send(senMsg)
    })
  }

  // 离开房间
  @SubscribeMessage('leaveRoom')
  leaveRoom(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
    const { roomId, userId } = data
    const roomIndex = this.rooms.findIndex((item) => item.roomId === roomId)
    if (roomIndex === -1) return
    const roomClients = this.rooms[roomIndex].clients
    const clientIndex = roomClients.findIndex((item) => item.userId === userId)
    if (clientIndex === -1) return
    const leaveUser = roomClients[clientIndex].userInfo || {}
    const message = { event: 'roomLeft', data: `${leaveUser.name} left the room ` }
    const userInfo = this.getUerInfo(roomId, userId)
    roomClients.splice(clientIndex, 1)
    const totalNum = this.getTotalNum(roomId)
    const senMsg = JSON.stringify({
      userInfo,
      totalNum,
      message,
    })
    roomClients.forEach((item) => {
      item.client.send(senMsg)
    })
  }
  // 房间广播
  @SubscribeMessage('chat')
  async handleChatMessage(@MessageBody() payload: any, @ConnectedSocket() sender: Socket): Promise<void> {
    // console.log('🌈-----sender-----', sender)
    // console.log('🍪-----handleChatMessage-----', payload)
    const { roomId, userId } = payload
    // 聊天信息存储
    const chatData = await this.saveMessage(payload)
    // console.log('🐠-----chatData-----', chatData)
    const roomClients = this.rooms.find((item) => item.roomId === roomId)?.clients
    if (!roomClients) return
    const senMsg = this.getBaseMsg(roomId, userId, { event: 'message', data: chatData })
    roomClients.forEach((item) => {
      item.client.send(senMsg)
    })
  }
  // 获取用户信息
  private getUerInfo(roomId: number, userId: number) {
    const roomIndex = this.rooms.findIndex((item) => item.roomId === roomId)
    if (roomIndex === -1) return {}
    const roomClients = this.rooms[roomIndex].clients
    const clientIndex = roomClients.findIndex((item) => item.userId === userId)
    if (clientIndex === -1) return {}
    const gerUser = roomClients[clientIndex].userInfo || {}
    return gerUser
  }
  // 用户当前房间总人数
  private getTotalNum(roomId: number) {
    const roomIndex = this.rooms.findIndex((item) => item.roomId === roomId)
    if (roomIndex === -1) return 0
    const roomClients = this.rooms[roomIndex].clients
    return roomClients.length
  }
  // 获取基本信息
  private getBaseMsg(roomId: number, userId: number, message: any) {
    const userInfo = this.getUerInfo(roomId, userId)
    const totalNum = this.getTotalNum(roomId)
    const senMsg = {
      userInfo,
      totalNum,
      message,
    }
    return JSON.stringify(senMsg)
  }

  // 数据库聊天室初始化
  private async initRoom(data: any) {
    const { roomId, userId } = data
    // 获取聊天室信息
    const roomInfo = await this.prisma.chatRoom.findUnique({
      where: { id: +roomId },
    })
    console.log('🎉-----roomInfo-----', roomInfo)
    // 判断有没有这个聊天室
    if (roomInfo) {
    } else {
      await this.prisma.chatRoom.create({
        data: {
          id: +roomId,
          name: `聊天室${roomId}`,
          users: {
            connect: {
              id: +userId,
            },
          },
          messages: {
            create: {
              content: '欢迎来到聊天室',
              type: 'text',
              user: {
                connect: {
                  id: +userId,
                },
              },
            },
          },
        },
      })
    }
  }
  // 聊天信息存储
  private async saveMessage(data: any) {
    const { roomId, userId, message, type, file } = data
    const chatData = await this.prisma.chatMessage.create({
      data: {
        content: message,
        type,
        file,
        user: {
          connect: {
            id: +userId,
          },
        },
        room: {
          connect: {
            id: +roomId,
          },
        },
      },
    })
    const userInfo = await this.prisma.user.findUnique({
      where: { id: chatData.userId },
    })
    return { ...chatData, userInfo }
  }
}
