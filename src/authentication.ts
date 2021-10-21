import * as Express from 'express'
import { ApiOnErrorProps, FindUserViaUserID, LoginApiFoundUser } from './util'
import { verify } from 'jsonwebtoken'
import { SimpleAuth } from './SimpleAuth'

export interface EnsureAuthenticatedOptions {
    findUser: FindUserViaUserID
    errors?: {
        on400?: (props: ApiOnErrorProps) => void
        on403?: (props: ApiOnErrorProps) => void
    }
}

export type AuthenticationMiddleware = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => Promise<void | Express.Response<any, Record<string, any>>>

export const ensureAuthenticated = (SimpleAuth: SimpleAuth, options: EnsureAuthenticatedOptions) => async(req: Express.Request, res: Express.Response, next: Express.NextFunction) => {

    const throw403 = () => typeof options?.errors?.on403 == 'function' ? options.errors.on403({ next }) : res.sendStatus(403);

    try {

        const { authorization } = req.headers
        
        if (!authorization) return throw403()

        const decrypted = verify(authorization, SimpleAuth.options.jsonwebtokenSecret) as LoginApiFoundUser

        const user = await options.findUser({
            userID: decrypted.userID
        })

        if (user == undefined) 
            return throw403()

        delete user.hashedPassword

        res.locals = {
            jwtToken: decrypted,
            ...user
        }

        next()

    } catch(e) {
        return throw403()
    }
    
}