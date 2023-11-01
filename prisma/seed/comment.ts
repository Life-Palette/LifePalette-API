import { PrismaClient } from '@prisma/client'
import { Random } from 'mockjs'
import { create } from '../helper'

export default async () => {
  await create(2, (prisma: PrismaClient) => {
    return prisma.comment.create({
      data: {
        content: Random.cparagraph(10, 30),
        userId: Random.integer(1, 10),
        topicId: Random.integer(1, 2),
      },
    })
  })

  await create(2, (prisma: PrismaClient) => {
    return prisma.comment.create({
      data: {
        content: Random.cparagraph(10, 30),
        userId: Random.integer(1, 10),
        videoId: Random.integer(1, 2),
      },
    })
  })
}
