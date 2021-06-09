const { Model,DataTypes } = require('sequelize')
const sequelize = require('./database')
// class User extends Model  { }

class User extends Model {
    static classLevelMethod() {
        return 'foo';
    }
    instanceLevelMethod() {
        return 'bar';
    }
    getFullname() {
        return [this.firstname, this.lastname].join(' ');
    }
}

User.init({
    username: {
        type: DataTypes.STRING
    },
    userlevel: {
        type: DataTypes.INTEGER
    },
    name: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    attempts: {
        type: DataTypes.INTEGER
    },
    expiry: {
        type: DataTypes.INTEGER
    },
}, {
    sequelize,
    modelName: 'user',
    timestamps: false
})

module.exports = User;