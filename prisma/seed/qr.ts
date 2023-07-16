import { PrismaClient } from '@prisma/client'
import { Random } from 'mockjs'
import { create } from '../helper'

export default async () => {
  // await create(1, async (prisma: PrismaClient) => {
  //   return prisma.qr.create({
  //     data: {
  //       key: Random.guid(),
  //       status: 'INIT',
  //       userId: 1,
  //     },
  //   })
  // })
}
