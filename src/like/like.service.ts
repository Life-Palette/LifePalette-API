import { Inject, Injectable } from '@nestjs/common'
import { CreateLikeDto } from './dto/create-like.dto'
import { UpdateLikeDto } from './dto/update-like.dto'
import { User } from '@prisma/client'
import { PrismaService } from './../prisma/prisma.service'
import { MessageService } from '@/message/message.service'

// @Module({
//   providers: [MessageService],
// })
@Injectable()
export class LikeService {
  @Inject()
  private readonly prisma: PrismaService
  private readonly messageService: MessageService
  create(createLikeDto: CreateLikeDto, user: User) {
    return this.prisma.like.create({
      data: { ...createLikeDto, userId: user.id },
    })
  }

  findAll(topicId: number) {
    return this.prisma.like.findMany({
      where: {
        ...(topicId ? { topicId } : {}),
      },
      include: {
        User: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  findOne(id: number) {
    return this.prisma.like.findUnique({ where: { id } })
  }

  update(id: number, updateLikeDto: UpdateLikeDto) {
    return `This action updates a #${id} like`
  }

  remove(createLikeDto: CreateLikeDto, user: User) {
    return this.prisma.like.deleteMany({
      where: {
        ...createLikeDto,
        userId: user.id,
      },
    })
  }
}
