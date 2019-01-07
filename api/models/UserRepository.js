const mongoose = require('mongoose')

class UserRepository {
    constructor(connection) {
        this.connection = connection
        this.schema = new mongoose.Schema({
            username: { type: String, required: true }, // Identificador
            password: { type: String, required: true }
        })
        this.userModel = this.connection.model('User', this.schema)
    }

    insert(user) {
        return new Promise((resolve, reject) => {
            const userRep = new this.userModel(user)
            userRep.save((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res)
            })
        })
    }

    findByUsername(username) {
        return new Promise((resolve, reject) => {
            this.userModel.findOne({ username: { $eq: username } }, (err, res) => {
                if (err || res == null) {
                    reject(err)
                }
                resolve(res)
            })
        })
    }
}

module.exports = UserRepository