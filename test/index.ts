import express from 'express'
import SimpleAuth, { util } from '../lib/index'

// Create an interface for you user
interface User {
    username: string
    hashedPassword: string
    userID: string
    name: string
}

// Showcase database
const users: User [] = [{
    hashedPassword: 'xx',
    name: 'xx',
    userID: '0.9480277774945098',
    username: 'xx'
}]

// Express app
const app = express()

// Simpleauth instance
const simpleauth = new SimpleAuth<User>({
    jsonwebtokenSecret: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    createUserViaLogin: (data) => {
        const ID =  String(Math.random())
        console.log(ID)
        users.push({
            username: data.username,
            hashedPassword: data.hashedPassword,
            userID: ID,
            name: data.name
        })
    },
    findUserViaLogin: (query) => users.find(u => u.username === query.username)
    ,
    findUserViaUserID: (query) => users.find(e => e.userID === query.userID)
})

// Sample login route, accepts the following query parameters: username, password
app.post('/login', simpleauth.handleLogin())

// Sample register route, accepts the following query parameters: email, username, name, password
app.post('/register', simpleauth.handleRegister({
    validation: {
        username: (username) => username.length >= 8,
        password: (password) => password.length >= 10
    },
}))

// Sample route for protected data, any data you have in your User will be written in res.locals
app.post('/protected', simpleauth.ensureAuthenticated({
    getLocals: (props) => ({ success: true, ...props.user })
}), (_req, res) => res.json(res.locals))

// Listen on port 5000
app.listen(5000, () => console.log('Server ready!'))
