import * as Express from 'express'

export interface ApiOnErrorProps {
    next: Express.NextFunction
}

export interface ViaLoginProps {
    username: string
}

export interface ViaUserID {
    userID: string | number
}

export interface LoginApiFoundUser {
    username: string
    hashedPassword: string
    userID: number | string
    roles?: any
    [key: string]: any
}

export interface RegisterApiResponse {
    hashedPassword: string
    username: string
    email?: string
    name?: string
}

export type FindUserViaLogin = (data: ViaLoginProps) => Promise<undefined | LoginApiFoundUser> | undefined | LoginApiFoundUser
export type FindUserViaUserID = (data: ViaUserID) => Promise<undefined | LoginApiFoundUser> | undefined | LoginApiFoundUser
export type CreateUser = (data: RegisterApiResponse) => Promise<void> | void

export const validate = (cb: Function | undefined, val: string) => {
    if (cb === undefined) return true
    return cb(val)
}