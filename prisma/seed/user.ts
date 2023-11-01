import { PrismaClient } from '@prisma/client'
import { hash } from 'argon2'
import { Random } from 'mockjs'
import { create } from '../helper'
const prisma = new PrismaClient()
export default async () => {
  // me
  await prisma.user.create({
    data: {
      mobile: process.env.MOBILE,
      name: 'IceyWu',
      password: await hash('123456'),
      avatar: `https://test.wktest.cn:3001/assets/IceyWu.jpg`,
      role: 'admin',
    },
  })
  // snn
  await prisma.user.create({
    data: {
      mobile: "18339871526",
      name: 'suan',
      password: await hash('123456'),
      avatar: `https://test.wktest.cn:3001/assets/default/girl.png`,
      role: 'user',
    },
  })
  // wy
  await prisma.user.create({
    data: {
      mobile: "19961411402",
      name: '用户_29359a90784b2308',
      password: await hash('123456'),
      avatar: `https://test.wktest.cn:3001/assets/default/girl.png`,
      role: 'user',
    },
  })
  // my2
  await prisma.user.create({
    data: {
      mobile: "18584906615",
      name: 'suqi',
      password: await hash('123456'),
      avatar: `https://test.wktest.cn:3001/assets/default/girl.png`,
      role: 'user',
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
