import * as Express from 'express'
import { hash } from 'bcrypt'
import { ApiOnErrorProps, validate } from './util'
import { SimpleAuth } from './SimpleAuth'

export interface RegisterApiResponse {
    hashedPassword: string
    username: string
    email?: string
    name?: string
}

export interface HandleRegisterOptions {
    bcrypt?: {
        rounds?: number
    },
    createUser: (data: RegisterApiResponse) => Promise<void> | void
    validation?: {
        username?: (username: string) => boolean
        name?: (name: string) => boolean
        password?: (password: string) => boolean
    },
    errors?: {
        on400?: (props: ApiOnErrorProps) => void
    }
}

export type RegisterMiddleware = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => Promise<void | Express.Response<any, Record<string, any>>>

export const handleRegister = (SimpleAuth: SimpleAuth, options: HandleRegisterOptions) => async(req: Express.Request, res: Express.Response, next: Express.NextFunction) => {

    const throw400 = () => typeof options?.errors?.on400 == 'function' ? options.errors.on400({ next }) : res.sendStatus(400);

    try {

        const { username: _username, name: _name, email: _email, password: _password } = req.query
        
        // Ensure string
        const username = String(_username)
        const name = _name == undefined ? '' : String(_name)
        const email = _email == undefined ? '' : String(_email)
        const password = String(_password)

        // Validate input (optional)
        if (!validate(options?.validation?.name, name) || !validate(options?.validation?.username, username) || !validate(options?.validation?.password, password)) 
            return throw400()

        await options.createUser({
            name,
            hashedPassword: await hash(password, options?.bcrypt?.rounds ?? 10),
            username,
            email
        })

        res.sendStatus(200)

    } catch(e) {
        return throw400()
    }
    
}