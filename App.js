const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mqtt = require('mqtt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const DeviceRepository = require('./api/models/DeviceRepository')
const DeviceController = require('./api/controllers/DeviceController')
const DeviceRoute = require('./api/routes/DeviceRoute')

const UserRepository = require('./api/models/UserRepository')
const UserController = require('./api/controllers/UserController')
const UserRoute = require('./api/routes/UserRouter')

const DIR = path.join(__dirname, './app')

const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const mosca = require('mosca')

const settings = {
		port:1883
	};

const serverMosca = new mosca.Server(settings);

serverMosca.on('ready', function() {
    console.log("BROKER MQTT ready");
});


let client = mqtt.connect('mqtt://localhost', { port: 1883 })

io.on('connect', () => {
    console.log('Socket connected!');
})

io.on('error', () => {
    console.log('Socket ERROR!');
})

io.on('connection', (socket) => {
    socket.on('subscribe', (data) => {
        console.log('Subscribing to ' + data.topic)
        socket.join(data.topic)
        client.subscribe(data.topic, (err) => {
            if (!err) {
                console.log('Inscrito no topico => ', data.topic)
            } else {
                console.log('Erro ao tentar se inscrever no topico => ', data.topic)
            }
        })
    })
    socket.on('publish', (data) => {
        console.log('Publishing to ' + data.topic)
        //io.sockets.emit('mqtt', { 'topic': data.topic.toString(), 'payload': data.payload.toString() })
        client.publish(data.topic, data.payload)
    })
})

client.on('connect', function () {
    console.log('Conectado ao MQTT')
});

client.on('error', function(err){
    console.log("ERROR no MQTT => ", error)
    client.end()
});

client.on('message', (topic, payload, packet) => {
    console.log('MSG MQTT => ', payload.toString())
    io.emit('mqtt', { 'topic': topic.toString(), 'payload': payload.toString() })
});

client.on('offline', function() {
    console.log("MQTT offline");
});

client.on('reconnect', function() {
    console.log("MQTT reconnect");
});

const mongoConnection = require('./api/models/ConnectionDB').then((connection) => {

    const devRepo = new DeviceRepository(connection)
    const devControl = new DeviceController(devRepo)
    const devRoute = new DeviceRoute(devControl)

    const userRepo = new UserRepository(connection)
    const userControl = new UserController(userRepo)
    const userRoute = new UserRoute(userControl)

    app.use('/img', express.static(DIR + '/img'))

    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(cookieParser())

    app.use('/api/device', devRoute.router)
    app.use('/api/user', userRoute.router)

    app.get('/', (req, res) => {
        res.sendFile(DIR + '/index.html')
    })

    app.get('/device', (req, res) => {
        res.sendFile(DIR + '/device.html')
    })

    app.get('/login', (req, res) => {
        const cookie = req.cookies.userCookie
        if (cookie == undefined) {
            res.cookie('userCookie', {
                token: null,
                user: null
            })
            res.sendFile(DIR + '/user-login.html')
        } else if (cookie.token == null) {
            res.sendFile(DIR + '/user-login.html')
        } else {
            res.redirect('/dashboard')
        }
    })

    app.get('/signup', (req, res) => {
        res.sendFile(DIR + '/user-signup.html')
    })

    app.use((req, res, next) => {
        try {
            const cookie = req.cookies.userCookie
                //console.log(cookie)
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

    app.get('/dashboard', (req, res) => {
        res.sendFile(DIR + '/user-dash.html')
    })

    app.get('/findByTopic/:topic', (req, res) => {
        devRepo.findByTopic(req.params.topic).then((resp) => {
            res.json({
                status: 'ok',
                msg: resp
            })
        }).catch((resp) => {
            res.json({
                status: 'error',
                msg: resp
            })
        })
    })

    app.get('/findById/:id', (req, res) => {
        devRepo.findById(req.params.id).then((resp) => {
            res.json({
                status: 'ok',
                msg: resp
            })
        }).catch((resp) => {
            res.json({
                status: 'error',
                msg: resp
            })
        })
    })
}).catch((resp) => {
    console.log('ERROR >> Mongo connnection', resp)
})

module.exports = server;