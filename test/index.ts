import express from 'express'
import SimpleAuth from '../lib/index'

// Create an interface for you user
interface User {
    username: string
    hashedPassword: string
    userID: string
}

// Showcase database
const users: User [] = []

// Express app
const app = express()

// Simpleauth instance
const simpleauth = new SimpleAuth({
    jsonwebtokenSecret: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',

    // These functions are required, in production they should access your database asynchronusly

    createUserViaLogin: (data) => {
        users.push({
            username: data.username,
            hashedPassword: data.hashedPassword,
            userID: String(Math.random())
        })
    },
    findUserViaLogin: (resp) => {
        
        return users.find(u => u.username === resp.username)
    },
    findUserViaUserID: (resp) => {
        return users.find(e => e.userID === resp.userID)
    }
})

// Sample login route, accepts the following query parameters: username, password
app.post('/login', simpleauth.handleLogin)

// Sample register route, accepts the following query parameters: email, username, name, password
app.post('/register', simpleauth.handleRegister)

// Sample route for protected data, any data you have in your User will be written in res.locals
app.post('/protected', simpleauth.ensureAuthenticated, (_req, res) => res.json(res.locals))

// Listen on port 5000
app.listen(5000, () => console.log('Server ready!'))
