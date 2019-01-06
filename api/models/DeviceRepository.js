const mongoose = require('mongoose')

class DeviceRepository {
    constructor(connection) {
        this.connection = connection
        this.schema = new mongoose.Schema({
            name: { type: String, required: true }, // Identificador
            device: { type: Number, required: true }, // Se é atuador ou sensor
            start_date: { type: Date, required: true }, // Data que começou a trabalhar
            token: { type: String, required: true }, // Segurança para o device
            topic: { type: String, required: true } // Rota MQTT
        })
        this.deviceModel = this.connection.model('Device', this.schema)
    }

    insert(device) {
        return new Promise((resolve, reject) => {
            const deviceRep = new this.deviceModel(device)
            deviceRep.save((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res)
            })
        })
    }

    findByTopic(topic) {
        return new Promise((resolve, reject) => {
            this.deviceModel.findOne({ topic: { $eq: topic } }, (err, res) => {
                if (err || res == null) {
                    reject(err)
                }
                resolve(res)
            })
        })
    }

    findByName(name) {
        return new Promise((resolve, reject) => {
            this.deviceModel.findOne({ name: { $eq: name } }, (err, res) => {
                if (err || res == null) {
                    reject(err)
                }
                resolve(res)
            })
        })
    }

    findTopics() {
        return new Promise((resolve, reject) => {
            this.deviceModel.aggregate([{ $group: { _id: { topic: '$topic' } } }], (err, res) => {
                if (err || res == null) {
                    reject(err)
                }
                resolve(res)
            })
        })
    }

    findByToken(token) {
        return new Promise((resolve, reject) => {
            this.deviceModel.findOne({ token: { $eq: token } }, (err, res) => {
                if (err || res == null) {
                    reject(err)
                }
                resolve(res)
            })
        })
    }

    findById(id) {
        return new Promise((resolve, reject) => {
            this.deviceModel.findOne({ _id: { $eq: id } }, (err, res) => {
                if (err || res == null) {
                    reject(err)
                }
                resolve(res)
            })
        })
    }
}

module.exports = DeviceRepository