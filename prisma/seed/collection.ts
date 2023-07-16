import { PrismaClient } from '@prisma/client'
// import { Random } from 'mockjs'
import { create } from '../helper'

export default async () => {
  await create(1, (prisma: PrismaClient) => {
    return prisma.collection.create({
      data: {
        userId: 1,
        topicId: 1,
      },
    })
  })
}
