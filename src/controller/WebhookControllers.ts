import {getRepository, getManager} from "typeorm";
import {NextFunction, Request, response, Response} from "express";
import {Event} from "../entity/Event";
import {User} from "../entity/User"
import {HttpError, JsonController, Get, Param, NotFoundError, InternalServerError, Post, BodyParam, Body, Header, Req, Res, Middleware} from 'routing-controllers'
import {OperationCanceledException} from "typescript";
import {IsNotEmpty, isNotEmpty, IsString, isString, MaxLength} from "class-validator";

import {WebhookEvent, MessageAPIResponseBase, TextMessage, Client} from '@line/bot-sdk'
import {eventNames} from "process";

const client = new Client({
    channelAccessToken: 'xuY+Bdfl62TcU0Bvtoi/FMMrQaZLzIjIFDPs4K0WXeK/fcnpTvYTr59No0MRxaI3WQWMrRtRtx5SUScEMP6l6/XQQjUGV6SnsXJ6/6OgJq9PPaGfnZS7uTTKN6Yi0eU3Cr6BIHI4EdDi/IYgvw1pEgdB04t89/1O/w1cDnyilFU=',
    channelSecret: '719db9afad629abe7858c8ad439498f3',
})

const textEventHandller = async (event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {

    // テキストのメッセージかつ、`wario¥n`で開始されるメッセージにのみ反応する
    if (event.type !== 'message' || event.message.type !== 'text') {
        return
    }

    const {replyToken} = event
    const {text} = event.message

    console.log(text)

    if (!text.startsWith('wario')) {
        return
    }

    const response: TextMessage = {
        type: 'text',
        text
    }

    // Reply to the user.
    await client.replyMessage(replyToken, response);
}

@JsonController() // リクエストとレスポンスがjson形式であることを保証する
export class WebhookController {

    // 疎通確認用ルーティング
    @Get('/webhook/')
    async getConnection () {

        return {
            status: 'success',
            message: 'Connected successfully!!'
        }
    }

    // メッセージ取得用ルーティング
    @Post('/webhook/')
    @Middleware({type: 'before'})
    async postMessage (
        @Req() request: Request,
        @Res() response: Response,
        @Body() body: any
    ): Promise<Response> {

        const events: WebhookEvent[] = request.body.events

        // Process all of the received events asynchronously.
        const results = await Promise.all(
            events.map(async (event: WebhookEvent) => {

                try {

                    await textEventHandller(event)

                } catch (err: unknown) {

                    if (err instanceof Error) {
                        console.log(err)
                    }

                    return response.status(500).json({
                        status: 'error'
                    })
                }
            })
        )

        return response.json({
            status: 'success',
            results
        })
    }
}
