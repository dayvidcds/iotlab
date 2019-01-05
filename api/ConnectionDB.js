const mongoose = require('mongoose')

let mongoConn = null

mongoose.Promise = global.Promise;

(() => {
    let error = ''
    const url = 'mongodb://localhost:27017/OrientTool'
    mongoConn = mongoose.connect(url, (err) => {
        if (err) {
            error = err
        }
    })
    if (error !== '') {
        throw Error('erro no db')
    }
    console.log('Conectado ao DB!')
})()

module.exports = mongoConn