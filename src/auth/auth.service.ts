import { getFileurl, randomAvatar, randomName } from '@/helper'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { hash, verify } from 'argon2'
import { CodeService } from './../aliyun/code.service'
import { PrismaService } from './../prisma/prisma.service'
import { FindPasswordDto } from './dto/find-password.dto'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'

@Injectable()
export class AuthService {
  constructor(private codeService: CodeService, private prisma: PrismaService, private jwt: JwtService) {}
  async register(dto: RegisterDto) {
    //校验验证码
    await this.codeService.check(dto)
    const name = randomName()
    const avatar = randomAvatar()
    const user = await this.prisma.user.create({
      data: {
        mobile: dto.mobile,
        avatar,
        name,
        password: await hash(dto.password),
      },
    })

    return this.token(user)
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { mobile: dto.mobile },
    })

    if (!user) new HttpException({ mobile: '帐号不存在' }, HttpStatus.BAD_REQUEST)
    const isPasswordValid = await verify(user.password, dto.password)

    if (!isPasswordValid) return new HttpException({ password: '密码错误' }, HttpStatus.BAD_REQUEST)
    // return this.token(user)
    return {
      admin: user,
      token: await this.token(user),
    }
  }

  async findPassword(dto: FindPasswordDto) {
    await this.codeService.check(dto)

    const user = await this.prisma.user.update({
      where: { mobile: dto.mobile },
      data: { password: await hash(dto.password) },
    })

    if (!user) new HttpException({ mobile: '帐号不存在' }, HttpStatus.BAD_REQUEST)

    return this.token(user)
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

  // 刷新token
  async refreshToken(RefreshToken: RefreshTokenDto) {
    const { refreshToken } = RefreshToken
    const { id } = await this.jwt.verifyAsync(refreshToken)
    return this.token({ id })
  }

  async resetPassword(dto: ResetPasswordDto, user: User) {
    await this.codeService.check({ ...user, code: dto.code })
    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hash(dto.password),
      },
    })
  }

  // 更新当前用户信息
  async updateUserInfo(dto: User, user: User) {
    console.log('user', user)
    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...dto,
      },
    })
  }
}
