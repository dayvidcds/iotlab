const mongoose = require('mongoose')

let mongoConn = null

mongoose.Promise = global.Promise;

(() => {
    let error = ''
    const url = 'mongodb://dayvidcds:dayvidupe12344223@ds249824.mlab.com:49824/iotlab' //'mongodb://localhost:27017/iotlab' //
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