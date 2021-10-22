import * as Express from 'express'
import { UserTemplate, SimpleAuthComponent, SimpleAuthMiddleware } from './util'
import { verify } from 'jsonwebtoken'
import SimpleAuth from './SimpleAuth'

export interface EnsureAuthenticatedGetLocalsProps<User extends UserTemplate> {
    user: User
}

export interface EnsureAuthenticatedOptions<User extends UserTemplate> {
    getLocals?: (props: EnsureAuthenticatedGetLocalsProps<User>) => object
}

export type TokenAuthenticationMiddleware<User extends UserTemplate> = SimpleAuthMiddleware<EnsureAuthenticatedOptions<User>>

export const ensureAuthenticated: SimpleAuthComponent<any> = <User extends UserTemplate>(simpleAuth: SimpleAuth<User>) => (options) => async(req, res, next) => {

    try {

        const { authorization } = req.headers
        
        if (!authorization) return simpleAuth.throw403(req, res)

        const decrypted = verify(authorization, simpleAuth.options.jsonwebtokenSecret) as User

        const user = await simpleAuth.options.findUserViaUserID({
            userID: decrypted.userID
        })

        if (user == undefined) 
            return simpleAuth.throw403(req, res)

        delete user.hashedPassword

        const locals = simpleAuth?.options?.authenticationOptions?.getLocals({ user }) || {
            jwtToken: decrypted,
            ...user
        }

        res.locals = locals

        next()

    } catch(e) {
        return simpleAuth.throw403(req, res)
    }
    
}


export interface EnsurehasRoleOptions {
    role: ((roles: string[]) => boolean) | string[] | string
}

export type RoleAuthenticationMiddleware = SimpleAuthMiddleware<EnsurehasRoleOptions>

export const ensureHasRole: SimpleAuthComponent<EnsurehasRoleOptions> = <User extends UserTemplate>(simpleAuth: SimpleAuth<User>) => (options) => async(req, res, next) => {

    const checkResult = (result: Boolean) => {
        if (!result) return simpleAuth.throw403(req, res)
        return next()
    }

    try {

        const { authorization } = req.headers
        
        if (!authorization) return simpleAuth.throw403(req, res)

        const decrypted = verify(authorization, simpleAuth.options.jsonwebtokenSecret) as UserTemplate

        const user = await simpleAuth.options.findUserViaUserID({
            userID: decrypted.userID
        })

        if (user == undefined) 
            return simpleAuth.throw403(req, res)

        const role = options?.role

        if (!role)
            return simpleAuth.throw403(req, res)

        if (typeof role === 'function') return checkResult(role(user.roles))

        if (typeof role === 'string') return checkResult(user.roles.includes(role))

        return checkResult(role.some(x => user.roles.includes(x)))

    } catch(e) {
        return simpleAuth.throw403(req, res)
    }
    
}