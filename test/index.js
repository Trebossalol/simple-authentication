"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var index_1 = __importDefault(require("../lib/index"));
// Showcase database
var users = [{
        hashedPassword: 'xx',
        name: 'xx',
        userID: '0.9480277774945098',
        username: 'xx'
    }];
// Express app
var app = express_1.default();
// Simpleauth instance
var simpleauth = new index_1.default({
    jsonwebtokenSecret: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    // These functions are required, in production they should access your database asynchronusly
    createUserViaLogin: function (data) {
        var ID = String(Math.random());
        console.log(ID);
        users.push({
            username: data.username,
            hashedPassword: data.hashedPassword,
            userID: ID,
            name: data.name
        });
    },
    findUserViaLogin: function (resp) { return users.find(function (u) { return u.username === resp.username; }); },
    findUserViaUserID: function (resp) { return users.find(function (e) { return e.userID === resp.userID; }); }
});
simpleauth.handleRegister;
// Sample login route, accepts the following query parameters: username, password
app.post('/login', simpleauth.handleLogin());
// Sample register route, accepts the following query parameters: email, username, name, password
app.post('/register', simpleauth.handleRegister({
    validation: {
        username: function (username) { return username.length >= 8; },
        password: function (password) { return password.length >= 10; }
    },
}));
// Sample route for protected data, any data you have in your User will be written in res.locals
app.post('/protected', simpleauth.ensureAuthenticated({
    getLocals: function (props) { return (__assign({ success: true }, props.user)); }
}), function (_req, res) { return res.json(res.locals); });
// Listen on port 5000
app.listen(5000, function () { return console.log('Server ready!'); });
