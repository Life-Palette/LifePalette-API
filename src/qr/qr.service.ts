import { Injectable } from '@nestjs/common'
import { CreateQrDto } from './dto/create-qr.dto'
import { UpdateQrDto } from './dto/update-qr.dto'
import { PrismaService } from './../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { CodeService } from './../aliyun/code.service'

@Injectable()
export class QrService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
  // 存储timeouts
  timeout = {}
  // 删除对应key的timeout
  async deleteTimeout(key: string) {
    clearTimeout(this.timeout[key])
    // 属性删除
    delete this.timeout[key]
  }
  // 增加timeout
  async addTimeout(key: string, time: number) {
    this.timeout[key] = setTimeout(async () => {
      await this.prisma.qr.delete({
        where: { key },
      })
    }, time)
  }
  // 生成二维码登录的key
  async generateQRKey() {
    const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const qrCode = await this.prisma.qr.create({
      data: {
        key,
        status: 'pending',
      },
    })

    this.addTimeout(key, 30 * 1000)
    return qrCode
  }

  // 重新生成二维码登录的key
  async regenerateQRKey(key: string) {
    const qrCode = await this.prisma.qr.findUnique({
      where: { key },
    })
    if (qrCode) {
      await this.prisma.qr.delete({
        where: { key },
      })
      this.deleteTimeout(key)
    }
    return this.generateQRKey()
  }

  // 检查二维码登录的key状态
  async checkQRKeyStatus(key: string) {
    const qrCode = await this.prisma.qr.findUnique({
      where: { key },
    })
    if (!qrCode) {
      return {
        code: 800,
        status: 'timeout',
        message: '二维码已失效',
      }
    }
    const { status, userId } = qrCode
    if (status === 'success') {
      // 获取用户信息
      const user = await this.prisma.user.findUnique({
        where: { id: +userId },
      })
      return {
        data: {
          code: 200,
          status,
          message: '登录成功',
          data: {
            token: await this.token(user),
            user,
          },
        },
      }
    }
    return qrCode
  }
  async token({ id }) {
    return {
      access_token: await this.jwt.signAsync({
        id,
      }),
      refresh_token: await this.jwt.signAsync(
        {
          id,
        },
        {
          expiresIn: '7d',
        },
      ),
      // 过期时间
      expires_in: 7 * 24 * 60 * 60,
    }
  }

  // 二维码登录
  async login(body: { key: string; userId: number }) {
    const { key, userId } = body
    const qrCode = await this.prisma.qr.findUnique({
      where: { key },
    })
    if (!qrCode) {
      return {
        code: 404,
        status: 'timeout',
        message: '二维码已失效',
      }
    }
    if (qrCode.status === 'confirm' || qrCode.status === 'pending') {
      // 获取用户信息
      const user = await this.prisma.user.findUnique({
        where: { id: +userId },
      })
      await this.prisma.qr.update({
        where: { key },
        data: {
          status: 'success',
          userId: +userId,
        },
      })
      return {
        code: 200,
        message: '登录成功',
        data: {
          token: await this.token(user),
          user,
        },
      }
    }
    return {
      code: 400,
      message: '登录失败',
    }
  }

  // 改变二维码状态（用户扫码完二维码）
  async changeSate(body: { key: string }) {
    const status = 'confirm'
    const { key } = body
    const qrCode = await this.prisma.qr.findUnique({
      where: { key },
    })
    if (!qrCode) {
      return {
        code: 404,
        status: 'timeout',
        message: '二维码已失效',
      }
    }
    if (qrCode.status === 'pending') {
      await this.prisma.qr.update({
        where: { key },
        data: {
          status,
        },
      })
      return {
        code: 200,
        message: '状态修改成功',
      }
    }
    return {
      code: 400,
      message: '状态修改失败',
    }
  }
}
