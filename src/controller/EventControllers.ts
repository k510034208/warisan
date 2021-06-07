import {getRepository, getManager} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {Event} from "../entity/Event";
import {User} from "../entity/User"
import {JsonController, Get, Param, NotFoundError, InternalServerError, Post, BodyParam, Body} from 'routing-controllers'
import {OperationCanceledException} from "typescript";
import {IsNotEmpty, isNotEmpty, IsString, isString, MaxLength} from "class-validator";

class CreateEventPram {
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    eventName: string

    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    member: string
}

@JsonController() // リクエストとレスポンスがjson形式であることを保証する
export class EventController {

    // イベント情報取得のAPI
    @Get('/api/event/:id')

    // @Content-type('xxxx') => 任意でコンテントタイプを設定可能
    // @Redirect('https://xxxxx') => リダイレクトを設定可能
    // @HttpCode(xxx) => 任意のHTTPコードを設定可能
    // @Header('xxxx':'xxx') => 任意のHTTPヘッダを設定可能
    async getEventInformation (
        @Param('id') id: number
    ) {
        // @Param(paramerter) paramerter: format => URLパラメータのvalidation
        // @BodyParam(paramerter) paramerter: format => POSTパラメータのvalidation
        // @HeaderParam(paramerter) paramerter: format => ヘッダーパラメータのvalidation
        // @CoolieParam(paramerter) paramerter: format => Coolieパラメータのvalidation
        // @SessionParam(paramerter) paramerter: format => Sessionパラメータのvalidation

        // @BodyParam(required: true) paramerter: format => POSTパラメータの必須チェック

        const eventRepository = getRepository(Event)

        // 認証

        // イベント情報取得
        try {

            let event = await eventRepository.findOne({
                where: {
                    id: id
                },
                relations: ['users']
            })
            console.log(event)

            // レスポンス
            return {
                status: 'success',
                result: {
                    eventid: event.id,
                    eventName: event.eventName,
                    member: event.users
                }
            }

        } catch (err) {
            console.error(err)
            return {
                status: 'Error',
                result: {}
            }
            throw new InternalServerError('Sever Error')
        }
    }

    // POST
    @Post('/api/event')
    async createEvent (
        @Body() bodyParam: CreateEventPram,
    ) {

        console.log(`${bodyParam.eventName},${bodyParam.member}`)

        const eventRepository = getRepository(Event)

        // 認証

        let event = new Event(bodyParam.eventName, 1)
        let users = new User(bodyParam.member, event)

        let eventCreateRsult: Event | null
        let userCreateRsult: User | null

        // データ作成
        try {
            await getManager().transaction(async transactionalEntityManager => {
                eventCreateRsult = await transactionalEntityManager.save(event)
                userCreateRsult = await transactionalEntityManager.save(users)
            })

            if (eventCreateRsult != null && userCreateRsult != null) {

                return {
                    status: 'Success',
                    result: {
                        eventName: bodyParam.eventName,
                        member: bodyParam.member
                    }
                }
            } else {
                throw new OperationCanceledException()
            }

        } catch (err) {
            console.error(err)
            return {
                status: 'Error',
                result: {}
            }
        }
    }
}