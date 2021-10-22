import * as Express from 'express'
import SimpleAuth from '.'

export interface ApiOnErrorProps {
    req: Express.Request
    res: Express.Response
}

export interface ViaLoginProps {
    username: string
}

export interface ViaUserID {
    userID: string | number
}

export interface UserTemplate {
    username: string
    hashedPassword: string
    userID: number | string
    roles?: string[]
    [key: string]: any
}

export interface RegisterApiResponse {
    hashedPassword: string
    username: string
    email?: string
    name?: string
}

export type FindUserViaLogin<User> = (data: ViaLoginProps) => Promise<undefined | User> | undefined | User
export type FindUserViaUserID<User> = (data: ViaUserID) => Promise<undefined | User> | undefined | User
export type CreateUser = (data: RegisterApiResponse) => Promise<void> | void

export type ApiErrorDescriptor = ((props: ApiOnErrorProps) => void) | ((props: ApiOnErrorProps) => string) | string
export type ApiErrorCallback = (req: Express.Request, res: Express.Response) => void
export type ApiErrorController = (simpleAuth: SimpleAuth) => ApiErrorCallback

export const validate = (cb: Function | undefined, val: string) => {
    if (cb === undefined) return true
    return cb(val)
}

export const throw400: ApiErrorController = (simpleAuth) => (req, res) => {
    const on400 = simpleAuth?.options?.errors?.on400 || (({req, res}) => res.sendStatus(400))

    if (typeof on400 === 'function') {
        const result = on400({ req, res })
        if (typeof result !== 'string') return
        res
            .status(400)
            .json({
                error: result
            })
    }

    res
        .status(400)
        .json({
            error: on400
        })
}

export const throw403: ApiErrorController = (simpleAuth) => (req, res) => {
    const on403 = simpleAuth?.options?.errors?.on403 || (({req, res}) => res.sendStatus(403))
        
    if (typeof on403 === 'function') {
        const result = on403({ req, res })
        if (typeof result !== 'string') return
        res
            .status(403)
            .json({
                error: result
            })
    }

    res
        .status(403)
        .json({
            error: on403
        })
}

export type SimpleAuthMiddleware<Options> = (options?: Options) => (req: Express.Request, res: Express.Response, next: Express.NextFunction) => void
export type SimpleAuthComponent<Options> = <User extends UserTemplate>(simpleAuth: SimpleAuth<User>) => SimpleAuthMiddleware<Options>