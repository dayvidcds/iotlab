const bcrypt = require('bcrypt-nodejs')

class UserController {

    constructor(userRepository) {
        this.repository = userRepository
    }

    insert(username, password) {
        return new Promise((resolve, reject) => {
            if (password === '' || username === '') {
                return reject({
                    status: 'error',
                    msg: 'Complete all fields'
                })
            }
            if (password.length < 6) {
                return reject({
                    status: 'error',
                    msg: 'Password must contain at least 6 characters'
                })
            }
            this.repository.findByUsername(username).then((resp) => {
                reject({
                    status: 'error',
                    msg: 'User already exists'
                })
            }).catch((error) => {
                const salt = bcrypt.genSaltSync(10)
                const hash = bcrypt.hashSync(password, salt)
                this.repository.insert({
                    username: username,
                    password: hash
                }).then((resp) => {
                    resolve({
                        status: 'ok',
                        msg: 'User entered successfully',
                        user: resp
                    })
                }).catch((resp) => {
                    reject({
                        status: 'error',
                        msg: 'Intern error while trying to insert'
                    })
                })
            })
        })
    }

    login(username, password) {
        try {
            return new Promise((resolve, reject) => {
                if (username === '' || password === '') {
                    reject({
                        status: 'error',
                        msg: 'Email or password not entered!'
                    })
                }
                if (password.length < 6) {
                    reject({
                        status: 'error',
                        msg: 'Password must be at least 6 characters long!'
                    })
                }
                this.repository.findByUsername(username).then((resp) => {
                    const foi = bcrypt.compareSync(password, resp.password)
                    console.log(foi)
                    if (foi === true) {
                        resolve({
                            status: 'ok',
                            user: resp.username,
                            id: resp._id
                        })
                    } else {
                        reject({
                            status: 'error',
                            msg: 'Wrong password'
                        })
                    }
                }).catch((resp) => {
                    reject({
                        status: 'error',
                        msg: 'User not found'
                    })
                })
            })
        } catch (Error) {
            console.log(Error)
        }

    }

    getInformation(username) {
        return new Promise((resolve, reject) => {
            this.repository.findByUsername(username).then((resp) => {
                resolve({
                    status: 'ok',
                    user: resp
                })
            }).catch((resp) => {
                reject({
                    status: 'error',
                    msg: 'Not found user by username'
                })
            })
        })
    }

}

module.exports = UserController