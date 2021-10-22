import { compare } from 'bcrypt'
import { SimpleAuthMiddleware, SimpleAuthComponent, UserTemplate } from './util'
import { sign } from 'jsonwebtoken'
import SimpleAuth from '.'

export interface HandleLoginOptions {
    bcrypt?: {
        rounds?: number
    }
}

export type LoginMiddleware = SimpleAuthMiddleware<HandleLoginOptions>

export const handleLogin: SimpleAuthComponent<HandleLoginOptions> = <User extends UserTemplate>(simpleAuth: SimpleAuth<User>) => (options) => async(req, res, next) => {

    try {

        const { username: _username, password: _password } = req.query
        
        // Ensure string
        const username = String(_username)
        const password = String(_password)
        
        const user = await simpleAuth.options.findUserViaLogin({
            username
        })

        const passwordCorrect = await compare(password, user?.hashedPassword || '')

        if (user == undefined || !passwordCorrect) 
            return simpleAuth.throw403(req, res)

        const { userID, hashedPassword, roles, ...rest } = user    

        const jwt = sign({
            userID,
            roles,
            ...rest
        }, simpleAuth.options.jsonwebtokenSecret)
        
        res
            .status(200)
            .json({
                token: jwt
            })

    } catch(e) {
        return simpleAuth.throw403(req, res)
    }
}