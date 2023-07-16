import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { QrService } from './qr.service'
import { CreateQrDto } from './dto/create-qr.dto'
import { UpdateQrDto } from './dto/update-qr.dto'
import { AuthService } from './../auth/auth.service'

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}
  // 生成二维码
  @Get('generate')
  async generateQRKey() {
    return this.qrService.generateQRKey()
  }

  // 重新生成二维码
  @Get('regenerate/:key')
  async regenerateQRKey(@Param('key') key: string) {
    return this.qrService.regenerateQRKey(key)
  }

  // 检查二维码状态
  @Get('check/:key')
  async checkQRKeyStatus(@Param('key') key: string) {
    return this.qrService.checkQRKeyStatus(key)
  }

  // 二维码登录
  @Post('login')
  async login(@Body() body: { key: string; userId: number }) {
    return this.qrService.login(body)
  }

  // 改变二维码状态（用户扫码完二维码）
  @Post('changeSate')
  async changeSate(@Body() body: { key: string }) {
    return this.qrService.changeSate(body)
  }
}
