import * as SimpleAuth from './index'

export interface SimpleAuthOptions<User extends SimpleAuth.util.UserTemplate> {
    jsonwebtokenSecret: string
    findUserViaLogin: SimpleAuth.util.FindUserViaLogin<User>
    findUserViaUserID: SimpleAuth.util.FindUserViaUserID<User>
    createUserViaLogin: SimpleAuth.util.CreateUser
    loginOptions?: SimpleAuth.login.HandleLoginOptions
    registerOptions?: SimpleAuth.register.HandleRegisterOptions
    authenticationOptions?: SimpleAuth.authentication.EnsureAuthenticatedOptions<User>

    errors?: {
        on400?: SimpleAuth.util.ApiErrorDescriptor
        on403?: SimpleAuth.util.ApiErrorDescriptor
    }
}

/**
 * @class
 * @description This class creates your SimpleAuth instance, it references middleware functions to handle the authentication proccess in you api
 */
export default class <User extends SimpleAuth.util.UserTemplate = any>{

    public handleLogin: SimpleAuth.login.LoginMiddleware
    public handleRegister: SimpleAuth.register.RegisterMiddleware
    public ensureAuthenticated: SimpleAuth.authentication.TokenAuthenticationMiddleware<User>
    public ensureHasRole: SimpleAuth.authentication.RoleAuthenticationMiddleware
    public options: SimpleAuthOptions<User>

    public throw400: SimpleAuth.util.ApiErrorCallback
    public throw403: SimpleAuth.util.ApiErrorCallback

    constructor(options: SimpleAuthOptions<User>) {

        this.options = options

        this.handleLogin = SimpleAuth.login.handleLogin<User>(this)
        this.handleRegister = SimpleAuth.register.handleRegister(this)
        this.ensureAuthenticated = SimpleAuth.authentication.ensureAuthenticated<User>(this)
        this.ensureHasRole = SimpleAuth.authentication.ensureHasRole<User>(this)

        this.throw400 = SimpleAuth.util.throw400(this)
        this.throw403 = SimpleAuth.util.throw403(this)

    }

        
}