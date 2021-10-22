import { hash } from 'bcrypt'
import SimpleAuth from '.'
import { SimpleAuthComponent, validate, SimpleAuthMiddleware, UserTemplate } from './util'

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
    validation?: {
        username?: (username: string) => boolean
        name?: (name: string) => boolean
        password?: (password: string) => boolean
    }
}

export type RegisterMiddleware = SimpleAuthMiddleware<HandleRegisterOptions>

export const handleRegister: SimpleAuthComponent<HandleRegisterOptions> = <User extends UserTemplate>(simpleAuth: SimpleAuth<User>) => (options) => async(req, res, next) => {

    try {

        const { username: _username, name: _name, email: _email, password: _password } = req.query
        
        // Ensure string
        const username = String(_username)
        const name = _name == undefined ? '' : String(_name)
        const email = _email == undefined ? '' : String(_email)
        const password = String(_password)

        // Validate input (optional)
        if (!validate(options?.validation?.name, name) || !validate(options?.validation?.username, username) || !validate(options?.validation?.password, password)) 
            return simpleAuth.throw400(req, res)

        await simpleAuth.options.createUserViaLogin({
            name,
            hashedPassword: await hash(password, options?.bcrypt?.rounds ?? 10),
            username,
            email,
        })

        res.sendStatus(200)

    } catch(e) {
        return simpleAuth.throw400(req, res)
    }
    
}