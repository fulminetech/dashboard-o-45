const { Model, DataTypes } = require('sequelize')
const sequelize = require('./database')
// class User extends Model  { }

class Permissions extends Model {
    // static classLevelMethod() {
    //     return 'foo';
    // }
    // instanceLevelMethod() {
    //     return 'bar';
    // }
    // getFullname() {
    //     return [this.firstname, this.lastname].join(' ');
    // }
}

Permissions.init({
    dashboard: {
        type: DataTypes.BOOLEAN
    },
    overview: {
        type: DataTypes.BOOLEAN
    },
    graphlhs: {
        type: DataTypes.BOOLEAN
    },
    graphrhs: {
        type: DataTypes.BOOLEAN
    },
    history: {
        type: DataTypes.BOOLEAN
    },
    dido: {
        type: DataTypes.BOOLEAN
    },
    alarm: {
        type: DataTypes.BOOLEAN
    },
    reports: {
        type: DataTypes.BOOLEAN
    },
    settings: {
        type: DataTypes.BOOLEAN
    },
    maintainence: {
        type: DataTypes.BOOLEAN
    },
    usersettings: {
        type: DataTypes.BOOLEAN
    },
    recipiesettings: {
        type: DataTypes.BOOLEAN
    },
}, {
    sequelize,
    modelName: 'permissions',
    timestamps: false
})

module.exports = Permissions;