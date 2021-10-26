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
    setF: {
        type: DataTypes.STRING
    },
    LHSrejnH: {
        type: DataTypes.STRING
    },
    LHSrejnL: {
        type: DataTypes.STRING
    },
    LHSawcH: {
        type: DataTypes.STRING
    },
    LHSawcL: {
        type: DataTypes.STRING
    },
    RHSrejnH: {
        type: DataTypes.STRING
    },
    RHSrejnL: {
        type: DataTypes.STRING
    },
    RHSawcH: {
        type: DataTypes.STRING
    },
    RHSawcL: {
        type: DataTypes.STRING
    },
    rejnON: {
        type: DataTypes.STRING
    },
    awcON: {
        type: DataTypes.STRING
    },
}, {
    sequelize,
    modelName: 'recipies',
    timestamps: false
})

module.exports = Recipies;