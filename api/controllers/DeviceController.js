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
                    const device = {
                        name: name,
                        topic: topic,
                        device: device,
                        token: 'ABCD', //Math.random().toString(36).substring(0, 16),
                        start_date: new Date()
                    }
                    this.repository.insert(device).then((resp) => {
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

}

module.exports = DeviceController