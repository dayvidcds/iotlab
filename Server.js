const app = require('./App')
const port = process.env.PORT || 80

const server = app.listen(port, (err, res) => {
    let error = ''
    const host = server.address().address
    if (err) {
        console.log('Server Connection ERROR')
        error = err
        return
    }
    console.log('Server Connection SUCESS Started on: http://' + host + ':' + port)
    if (error !== '') {
        throw new Error(error)
    }
})

module.exports = server;