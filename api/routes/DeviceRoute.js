const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const router = express.Router()

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())
router.use(cookieParser())

class DeviceRoute {
    constructor(deviceController) {
        this.controller = deviceController
        this.router = router
        this.initializeRoutes()
    }

    initializeRoutes() {

        router.post('/insert', (req, res) => {
            this.controller.insert(req.body.name, req.body.topic, req.body.device).then((resp) => {
                res.json(resp)
            }).catch((resp) => {
                res.json(resp)
            })
        })

        router.post('/insertForUser', (req, res) => {
            const userId = req.cookies.userCookie.user.id
            this.controller.insertForUser(req.body.name, req.body.topic, req.body.device, userId).then((resp) => {
                res.json(resp)
            }).catch((resp) => {
                res.json(resp)
            })
        })

        router.get('/findTopics', (req, res) => {
            this.controller.findTopics().then((resp) => {
                res.json(resp)
            }).catch((resp) => {
                res.json(resp)
            })
        })

        router.post('/getInformation', (req, res) => {
            this.controller.getInformation(req.body.id, req.body.token).then((resp) => {
                res.json(resp)
            }).catch((resp) => {
                res.json(resp)
            })
        })
    }
}

module.exports = DeviceRoute