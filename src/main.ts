import { TransformInterceptor } from './transform-interceptor'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import ValidatePipe from './validate/validate.pipe'
import { SuccessResponseInterceptor } from './success-response.interceptor'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
// import * as fs from 'fs';
import { WsAdapter } from './websocket/ws.adapter'

async function bootstrap() {
  // 证书
  var fs = require('fs')
  // const httpsOptions = {
  //   key: fs.readFileSync('./src/test.wktest.cn.key'),
  //   cert: fs.readFileSync('./src/test.wktest.cn.pem'),
  // }
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // httpsOptions,
  })

  // 处理跨域
  app.enableCors({
    // origin: origins,
    origin: '*',

    credentials: true,

    // "allowedHeaders":['Authorization','content-type'],

    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',

    preflightContinue: false,

    optionsSuccessStatus: 204,
  })
  const options = new DocumentBuilder()
    .setTitle('nestjs-dev接口文档')
    .setDescription('By IceyWu')
    .setVersion('1.0.0')
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('/api-docs', app, document)
  app.useGlobalPipes(new ValidatePipe({ transform: true }))
  app.useGlobalInterceptors(new SuccessResponseInterceptor())
  app.setGlobalPrefix('api')
  app.useGlobalInterceptors(new TransformInterceptor())
  app.useStaticAssets('uploads', { prefix: '/uploads' })
  app.useStaticAssets('assets', { prefix: '/assets' })
  app.useWebSocketAdapter(new WsAdapter(app)) // 使用我们的适配器

  await app.listen(3001)
}

bootstrap()
