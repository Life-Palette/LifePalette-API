import { PrismaClient } from '@prisma/client'
import { hash } from 'argon2'
import { Random } from 'mockjs'
import { create } from '../helper'
const prisma = new PrismaClient()
export default async () => {
  await prisma.user.create({
    data: {
      mobile: process.env.MOBILE,
      name: 'IceyWu',
      password: await hash('123456'),
      avatar: `${process.env.URL}/assets/IceyWu.jpg`,
      role: 'admin',
    },
  })
  await create(10, async (prisma: PrismaClient) => {
    return prisma.user.create({
      data: {
        mobile: String(Random.integer(11111111111, 19999999999)),
        name: Random.cname(),
        password: await hash('123456'),
        avatar: `${process.env.URL}/assets/user/文件${Random.integer(1, 20)}.jpg`,
        github: Random.url(),
        role: 'user',
      },
    })
  })
}
