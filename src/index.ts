import "reflect-metadata";
import { createConnection } from "typeorm";
import { createExpressServer } from 'routing-controllers'
import { UserController } from "./controller/UserController";
import { EventController } from './controller/EventControllers'
import { WebhookController } from './controller/WebhookControllers'
import { middleware, MiddlewareConfig } from "@line/bot-sdk";

const middlewareConfig: MiddlewareConfig = {
  channelAccessToken: 'xuY+Bdfl62TcU0Bvtoi/FMMrQaZLzIjIFDPs4K0WXeK/fcnpTvYTr59No0MRxaI3WQWMrRtRtx5SUScEMP6l6/XQQjUGV6SnsXJ6/6OgJq9PPaGfnZS7uTTKN6Yi0eU3Cr6BIHI4EdDi/IYgvw1pEgdB04t89/1O/w1cDnyilFU=',
  channelSecret: '719db9afad629abe7858c8ad439498f3',
}

createConnection().then( async connection => {

  // create express app
  const app = createExpressServer( {
    controllers: [
      EventController,
      WebhookController,
      UserController
    ],
    middlewares: [
      middleware( middlewareConfig )
    ]
  } )

  // start express server
  let port = parseInt( process.env.PORT || '3000' );
  app.listen( port );

  console.log( `Express server has started. Port:` + port );

} ).catch( error => console.log( error ) );