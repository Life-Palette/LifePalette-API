import { CacheModule, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as redisStore from 'cache-manager-redis-store'
import { AliyunModule } from './aliyun/aliyun.module'
import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'
import { CaslModule } from './casl/casl.module'
import { CommentModule } from './comment/comment.module'
import configs from './config/index'
import { LessonModule } from './lesson/lesson.module'
import { PrismaModule } from './prisma/prisma.module'
import { SystemModule } from './system/system.module'
import { TagModule } from './tag/tag.module'
import { TopicModule } from './topic/topic.module'
import { UploadModule } from './upload/upload.module'
import { VideoModule } from './video/video.module'
import { UserModule } from './user/user.module'
import { QrModule } from './qr/qr.module'
import { AliossModule } from './alioss/alioss.module'
import { LikeModule } from './like/like.module'
import { MessageModule } from './message/message.module'
import { WsStartGateway } from './websocket/websocket.gateway' //
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    AliyunModule,
    ConfigModule.forRoot({ load: configs, isGlobal: true }),
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    LessonModule,
    SystemModule,
    TagModule,
    TopicModule,
    CaslModule,
    VideoModule,
    CommentModule,

    UploadModule,

    UserModule,

    QrModule,

    AliossModule,

    LikeModule,

    MessageModule,

    ChatModule,
    // WsStartGateway,
  ],
  controllers: [AppController],
  providers: [WsStartGateway],
})
export class AppModule {}
