import { Module } from '@nestjs/common';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          //设置加密使用的 secret
          secret: config.get('app.token_access'),
          //过期时间
          signOptions: { expiresIn: '300d' },
        }
      },
    }),
  ],
  controllers: [QrController],
  providers: [QrService]
})
export class QrModule {}
