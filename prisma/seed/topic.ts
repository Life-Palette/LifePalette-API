import { PrismaClient } from '@prisma/client'
import { Random } from 'mockjs'
import { create } from '../helper'

export default async () => {
  await create(20, async (prisma: PrismaClient) => {
    return prisma.topic.create({
      data: {
        title: Random.ctitle(),
        content: Random.cparagraph(10, 30),
        userId: Random.integer(1, 10),
        TopicTag: {
          create: { tagId: Random.integer(1, 5) },
        },
        // cover: Random.image('200x100', Random.color(), Random.color(), Random.ctitle()),
        files: [
          {
            filePath: '1682824910862-8301076235.png',
            thumbnailPath: '1682824910862-8301076235_400x225.jpg',
          },
        ],
      },
    })
  })
}
