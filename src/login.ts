import * as Express from 'express'
import { compare } from 'bcrypt'
import { ApiOnErrorProps, FindUserViaLogin, validate } from './util'
import { sign } from 'jsonwebtoken'
import { SimpleAuth } from './SimpleAuth'

export interface HandleLoginOptions {
    bcrypt?: {
        rounds?: number
    },
    findUser: FindUserViaLogin
    validation?: {
        username?: (username: string) => boolean
        password?: (password: string) => boolean
    },
    errors?: {
        on400?: (props: ApiOnErrorProps) => void
        on403?: (props: ApiOnErrorProps) => void
    }
}

export type LoginMiddleware = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => Promise<void | Express.Response<any, Record<string, any>>>

export const handleLogin = (SimpleAuth: SimpleAuth, options: HandleLoginOptions) => async(req: Express.Request, res: Express.Response, next: Express.NextFunction) => {

    const throw403 = () => typeof options?.errors?.on403 == 'function' ? options.errors.on403({ next }) : res.sendStatus(403);
    const throw400 = () => typeof options?.errors?.on400 == 'function' ? options.errors.on400({ next }) : res.sendStatus(400);

    try {

        const { username: _username, password: _password } = req.query
        
        // Ensure string
        const username = String(_username)
        const password = String(_password)

        // Validate input (optional)
        if (!validate(options?.validation?.username, username) || !validate(options?.validation?.password, password)) 
            return throw400()
        
        const user = await options.findUser({
            username
        })

        const passwordCorrect = await compare(password, user?.hashedPassword || '')

        if (user == undefined || !passwordCorrect) 
            return throw403()

        const { userID, hashedPassword, roles, ...rest } = user    

        const jwt = sign({
            userID,
            roles,
            ...rest
        }, SimpleAuth.options.jsonwebtokenSecret)
        
        res
            .status(200)
            .json({
                token: jwt
            })

    } catch(e) {
        return throw403()
    }
}