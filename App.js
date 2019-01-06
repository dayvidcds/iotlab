const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mqtt = require('mqtt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const DeviceRepository = require('./api/models/DeviceRepository')
const DeviceController = require('./api/controllers/DeviceController')
const DeviceRoute = require('./api/routes/DeviceRoute')

const DIR = path.join(__dirname, './app')

const io = require('socket.io').listen(5000)

let client = mqtt.connect('mqtt://localhost')

io.sockets.on('connection', function(socket) {
    // socket connection indicates what mqtt topic to subscribe to in data.topic
    socket.on('subscribe', function(data) {
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
        // when socket connection publishes a message, forward that message
        // the the mqtt broker
    socket.on('publish', function(data) {
        console.log('Publishing to ' + data.topic)
        client.publish(data.topic, data.payload)
    })
})

client.on('message', function(topic, payload, packet) {
    // message is Buffer
    console.log('MSG MQTT => ', payload.toString())
    io.sockets.emit('mqtt', { 'topic': topic.toString(), 'payload': payload.toString() })
})

const app = express()

const mongoConnection = require('./api/models/ConnectionDB').then((connection) => {

    const devRepo = new DeviceRepository(connection)
    const devControl = new DeviceController(devRepo)
    const devRouter = new DeviceRoute(devControl)

    app.use('/img', express.static(DIR + '/img'))

    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())

    app.use('/api/device', devRouter.router)

    app.get('/', (req, res) => {
        res.sendFile(DIR + '/index.html')
    })

    app.get('/device', (req, res) => {
        res.sendFile(DIR + '/device.html')
    })

    app.get('/findTopics', (req, res) => {
        devRepo.findTopics().then((resp) => {
            res.json({
                status: 'ok',
                msg: resp
            })
        }).catch((resp) => {
            res.json({
                status: 'error',
                msg: 'No items'
            })
        })
    })

    app.post('/getInformation', (req, res) => {
        if (req.body.id === '' || req.body.token === '') {
            return res.json({
                status: 'error',
                msg: 'Complete all fields'
            })
        }
        devRepo.findById(req.body.id).then((resp) => {
            if (resp.token === req.body.token) {
                let htmlCode = ''
                if (resp.device === 1) {
                    htmlCode = `
                    
                    <!-- Card -->
                    <div class="card">
                    
                      <!-- Card image -->
                      <img class="card-img-top" id="pImgLed" src="/img/ledApagado.png" alt="Card image cap">
                    
                      <!-- Card content -->
                      <div class="card-body">
                    
                        <!-- Title -->
                        <h5 class="card-title" >${'Device: ' + resp.name}</h5>
                        <span class="card-text" id="pDevice">${'Type: ' + 'Led'}</span><br>
                        <span class="card-text" id="pTitle">${'Status: ' + 'Off'}</span><br>
                        <span class="card-text" id="pTopic">${'Topic: ' + resp.topic}</span><br><br>
                        <a href="/device" class="btn btn-primary btn-sm">Update</a>
                        <a href="#" class="btn btn-secondary btn-sm">Source code for NODEMCU</a>
                    
                      </div>
                    
                    </div>
                    <!-- Card -->

                    `


                }
                if (resp.device === 2) {
                    htmlCode = `
                    <div class="card" style="width: 18rem;">
                        <div class="card-body">
                            <center>
                                <button type="submit" class="btn btn-primary" name="${resp.topic}" id="On" onclick="sendMsg(this)">On</button>
                                <button type="submit" class="btn btn-primary" name="${resp.topic}" id="Off" onclick="sendMsg(this)">Off</button>
                            </center>
                            <h5 class="card-title" id="pTitleBtn">${'Device: ' + resp.name}</h5>
                            <p class="card-text" id="pStartDateBtn">${'Start date: ' + resp.start_date}</p>
                            <p class="card-text" id="pDeviceBtn">${'Type: ' + 'Button'}</p>
                            <p class="card-text" id="pTopicBtn">${'topic: ' + resp.topic}</p>
                            <a href="/device" class="card-link">Update</a>
                        </div>
                    </div>
                    `
                }
                res.json({
                    status: 'ok',
                    msg: resp,
                    html: htmlCode
                })
            } else {
                res.json({
                    status: 'error',
                    msg: 'Token is not valid'
                })
            }
        }).catch((resp) => {
            res.json({
                status: 'error',
                msg: 'Id not found'
            })
        })
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

module.exports = app