// websocket.module.ts
import { Module } from '@nestjs/common'
import { WsStartGateway } from './websocket.gateway'

@Module({
  providers: [WsStartGateway],
})
export class WebsocketModule {}
