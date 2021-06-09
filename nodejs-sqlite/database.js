const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('test-db', 'user', 'pass', {
    dialect: 'sqlite',
    host: './cwc.sqlite3'
})

module.exports = sequelize;