const { Model, DataTypes } = require('sequelize')
const sequelize = require('./database')
// class User extends Model  { }

class Recipies extends Model {
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

Recipies.init({
    recn: {
        type: DataTypes.STRING
    },
    pname: {
        type: DataTypes.STRING
    },
    tooldrg: {
        type: DataTypes.STRING
    },
    size: {
        type: DataTypes.STRING
    },
    thickness: {
        type: DataTypes.STRING
    },
    weight: {
        type: DataTypes.STRING
    },
    hardness: {
        type: DataTypes.STRING
    },
    depthL: {
        type: DataTypes.STRING
    },
    depthR: {
        type: DataTypes.STRING
    },
    forceL: {
        type: DataTypes.STRING
    },
    forceR: {
        type: DataTypes.STRING
    },
    preL: {
        type: DataTypes.STRING
    },
    preR: {
        type: DataTypes.STRING
    },
    mainL: {
        type: DataTypes.STRING
    },
    mainR: {
        type: DataTypes.STRING
    },
}, {
    sequelize,
    modelName: 'recipies',
    timestamps: false
})

module.exports = Recipies;