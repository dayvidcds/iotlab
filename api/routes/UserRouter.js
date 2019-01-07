const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const router = express.Router()

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())
router.use(cookieParser())

class UserRouter {
    constructor(userController) {
        this.controller = userController
        this.router = router
        this.initializeRoutes()
    }

    initializeRoutes() {
        router.post('/insert', (req, res) => {
            this.controller.insert(req.body.username, req.body.password).then((resp) => {
                const jwtSecret = 'SECRET'
                const token = jwt.sign(resp, jwtSecret, {
                    expiresIn: 1440
                })
                res.cookie('userCookie', {
                    token: token,
                    user: {
                        username: resp.user.username
                    }
                })
                res.json({
                    status: 'ok',
                    msg: 'Initialized section'
                })
            }).catch((resp) => {
                res.json(resp)
            })
        })

        router.post('/login', (req, res) => {
            this.controller.login(req.body.username, req.body.password).then((resp) => {
                const jwtSecret = 'SECRET'
                const token = jwt.sign(resp, jwtSecret, {
                    expiresIn: 1440
                })
                res.cookie('userCookie', {
                    token: token,
                    user: {
                        username: resp.user
                    }
                })
                res.json({
                    status: 'ok',
                    msg: 'Initialized section'
                })
            }).catch((resp) => {
                res.json(resp)
            })
        })

        router.use((req, res, next) => {
            try {
                const cookie = req.cookies.userCookie
                if (cookie !== undefined) {
                    const token = cookie.token
                    const jwtSecret = 'SECRET'
                    jwt.verify(token, jwtSecret, (err, decoded) => {
                        if (err) {
                            res.cookie('userCookie', {
                                token: null,
                                user: null
                            })
                            res.redirect('/login')
                        } else {
                            req.decoded = decoded
                            next()
                        }
                    })
                } else {
                    res.cookie('userCookie', {
                        token: null,
                        user: null
                    })
                    res.redirect('/login')
                }
            } catch (Error) {
                res.redirect('/login')
            }
        })

        router.get('/logout', (req, res) => {
            res.cookie('userCookie', {
                token: null,
                user: null
            })
            res.json({
                status: 'ok',
                msg: 'Log out success'
            })
        })

        router.get('/getInformation', (req, res) => {
            const username = req.cookies.userCookie.user.username
            console.log(username)
            this.controller.getInformation(username).then((resp) => {
                res.json(resp)
            }).catch((resp) => {
                res.json(resp)
            })
        })

    }
}

module.exports = UserRouter