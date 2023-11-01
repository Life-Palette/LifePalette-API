import { PrismaClient } from '@prisma/client'
import { Random } from 'mockjs'
import { create } from '../helper'

export default async () => {
  await create(2, async (prisma: PrismaClient) => {
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
            file: 'http://nest-js.oss-accelerate.aliyuncs.com/nestDev/3f9da3cf99b0c84c30960323cd36d0f7.jpg',
            fileType: 'IMAGE',
            thumbnail:
              'http://nest-js.oss-accelerate.aliyuncs.com/nestDev/3f9da3cf99b0c84c30960323cd36d0f7.jpg?x-oss-process=image/resize,l_100',
          },
        ],
      },
    })
  })
}
