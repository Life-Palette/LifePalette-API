import { PrismaClient } from '@prisma/client'
import { create } from '../helper'

export default async () => {
  const tagList = [
    '推荐',
    '旅行',
    '美食',
    // '穿搭',
    // '美妆',
    '影视',
    '音乐',
    // '游戏',
    // '学习',
    '动漫',
    '绘画',
    // '手工',
    // '萌宠',
    '摄影',
    '科技',
    '其他',
  ]
  await create(tagList.length, async (prisma: PrismaClient, index: number) => {
    return prisma.tag.create({
      data: {
        title: tagList[index - 1],
        cover: '1682824910862-8301076235.png',
        thumbnailPath: '1682824910862-8301076235_400x225.jpg',
      },
    })
  })
}
