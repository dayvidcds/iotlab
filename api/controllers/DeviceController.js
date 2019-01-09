class DeviceController {
    constructor(deviceRepository) {
        this.repository = deviceRepository
    }

    insert(name, topic, device) {
        return new Promise((resolve, reject) => {
            if (name === '' || topic === '') {
                reject({
                    status: 'error',
                    msg: 'All fields must be filled'
                })
            } else {
                this.repository.findByName(name).then((resp) => {
                    reject({
                        status: 'error',
                        msg: 'Device already exists, insert a diferent name'
                    })
                }).catch((resp) => {
                    const objDevice = {
                        name: name,
                        topic: topic,
                        device: device,
                        token: 'ABCD', //Math.random().toString(36).substring(0, 16),
                        start_date: new Date(),
                        user_id: null,
                        is_public: true
                    }
                    this.repository.insert(objDevice).then((resp) => {
                        resolve({
                            status: 'ok',
                            msg: 'Insert successfully',
                            token: resp.token,
                            id: resp._id
                        })
                    }).catch((resp) => {
                        reject({
                            status: 'error',
                            msg: 'Error while trying to insert'
                        })
                    })
                })
            }
        })
    }

    insertForUser(name, topic, device, userId, ispublic) {
        return new Promise((resolve, reject) => {
            if (name === '' || topic === '') {
                reject({
                    status: 'error',
                    msg: 'All fields must be filled'
                })
            } else {
                this.repository.findByName(name).then((resp) => {
                    reject({
                        status: 'error',
                        msg: 'Device already exists, insert a diferent name'
                    })
                }).catch((resp) => {
                    const objDevice = {
                        name: name,
                        topic: topic,
                        device: device,
                        token: 'ABCD', //Math.random().toString(36).substring(0, 16),
                        start_date: new Date(),
                        user_id: userId,
                        is_public: ispublic
                    }
                    this.repository.insert(objDevice).then((resp) => {
                        resolve({
                            status: 'ok',
                            msg: 'Insert successfully',
                            token: resp.token,
                            id: resp._id
                        })
                    }).catch((resp) => {
                        reject({
                            status: 'error',
                            msg: 'Error while trying to insert'
                        })
                    })
                })
            }
        })
    }

    findByUserId(userId) {
        return new Promise((resolve, reject) => {
            this.repository.findByUserId(userId).then((resp) => {
                let htmlCode = ''
                console.log(resp)
                for (let i = 0; i < resp.length; i++) {
                    if (resp[i].device === 1) {
                        htmlCode += `
                    
                    <!-- Card -->
                    <div class="col-sm">
                    <div class="card" style="width: 250px;">
                    
                      <!-- Card image -->
                      <center><img class="card-img-top" id="pImgLed" src="/img/ledApagado.png" style="width:128px;" alt="Card image cap" ></center>
                    
                      <!-- Card content -->
                      <div class="card-body">
                    
                        <!-- Title -->
                        <h5 class="card-title" >${'Device: ' + resp[i].name}</h5>
                        <span class="card-text" id="pDevice">${'Type: ' + 'Led'}</span><br>
                        <span class="card-text" id="pTitle">${'Status: ' + 'Off'}</span><br>
                        <span class="card-text" id="pTopic">${'Topic: ' + resp[i].topic}</span><br><br>
                        <a href="/device" class="btn btn-primary btn-sm">Update</a>
                        <a href="#" class="btn btn-secondary btn-sm">NODEMCU code</a>
                    
                      </div>
                    
                    </div>
                    </div>
                    <!-- Card -->
    
                    `
                    }
                    if (resp[i].device === 2) {
                        htmlCode += `
                        <div class="col-sm">
                    <div class="card" style="width: 250px;">
                        <div class="card-body">
                            <center>
                                <button type="submit" class="btn btn-primary" name="${resp[i].topic}" id="On" onclick="sendMsg(this)">On</button>
                                <button type="submit" class="btn btn-primary" name="${resp[i].topic}" id="Off" onclick="sendMsg(this)">Off</button>
                            </center>
                            <br><br>
                            <h5 class="card-title" id="pTitleBtn">${'Device: ' + resp[i].name}</h5>
                            <span class="card-text" id="pDeviceBtn">${'Type: ' + 'Button'}</span><br>
                            <span class="card-text" id="pStatusBtn">${'Status: ' + '-'}</span><br>
                            <span class="card-text" id="pTopicBtn">${'Topic: ' + resp[i].topic}</span><br><br>
                            <a href="/device" class="btn btn-primary btn-sm">Update</a>
                            <a href="#" class="btn btn-secondary btn-sm">NODEMCU code</a>
                        </div>
                    </div>
                    </div>
                    `
                    }
                }
                resolve({
                    status: 'ok',
                    msg: resp,
                    html: htmlCode
                })
            }).catch((resp) => {
                reject({
                    status: 'error',
                    msg: 'Devices not found',
                    resp: resp
                })
            })
        })
    }

    findTopics() {
        return new Promise((resolve, reject) => {
            this.repository.findTopics().then((resp) => {
                resolve({
                    status: 'ok',
                    msg: resp
                })
            }).catch((resp) => {
                reject({
                    status: 'error',
                    msg: 'No items'
                })
            })
        })
    }

    getInformation(deviceId, deviceToken) {
        //console.log('CHEGOII')
        return new Promise((resolve, reject) => {
            if (deviceId === '' || deviceToken === '') {
                reject({
                    status: 'error',
                    msg: 'Complete all fields'
                })
            }
            this.repository.findById(deviceId).then((resp) => {
                if (resp.token === deviceToken) {
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
                    <br><br>
                    <h5 class="card-title" id="pTitleBtn">${'Device: ' + resp.name}</h5>
                    <span class="card-text" id="pDeviceBtn">${'Type: ' + 'Button'}</span><br>
                    <span class="card-text" id="pStatusBtn">${'Status: ' + '-'}</span><br>
                    <span class="card-text" id="pTopicBtn">${'Topic: ' + resp.topic}</span><br><br>
                    <a href="/device" class="btn btn-primary btn-sm">Update</a>
                    <a href="#" class="btn btn-secondary btn-sm">NODEMCU code</a>
                </div>
                    </div>
                    `
                    }
                    resolve({
                        status: 'ok',
                        msg: resp,
                        html: htmlCode
                    })
                } else {
                    reject({
                        status: 'error',
                        msg: 'Token is not valid'
                    })
                }
            }).catch((resp) => {
                console.log(resp)
                reject({
                    status: 'error',
                    msg: 'Id not found'
                })
            })
        })
    }

}

module.exports = DeviceController