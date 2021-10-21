import * as Sa from './index'

export interface SimpleAuthOptions {
    jsonwebtokenSecret: string
    findUserViaLogin: Sa.util.FindUserViaLogin
    findUserViaUserID: Sa.util.FindUserViaUserID
    createUserViaLogin: Sa.util.CreateUser
    loginOptions?: Sa.login.HandleLoginOptions
    registerOptions?: Sa.register.HandleRegisterOptions
    authenticationOptions?: Sa.authentication.EnsureAuthenticatedOptions
}

/**
 * @class
 * @description This class creates your SimpleAuth instance, it references middleware functions to handle the authentication proccess in you api
 */
export class SimpleAuth {

    public handleLogin: Sa.login.LoginMiddleware
    public handleRegister: Sa.register.RegisterMiddleware
    public ensureAuthenticated: Sa.authentication.AuthenticationMiddleware
    public options: SimpleAuthOptions

    constructor(options: SimpleAuthOptions) {

        this.options = options

        this.handleLogin = Sa.login.handleLogin(this, {
            findUser: options.findUserViaLogin,
        })

        this.handleRegister = Sa.register.handleRegister(this, {
            createUser: options.createUserViaLogin
        })

        this.ensureAuthenticated = Sa.authentication.ensureAuthenticated(this, {
            findUser: options.findUserViaUserID
        })

    }

    
}