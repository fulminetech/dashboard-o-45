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
    shape: {
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
    rpm: {
        type: DataTypes.STRING
    },
    ff_lhs_rpm: {
        type: DataTypes.STRING
    },
    ff_rhs_rpm: {
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
    awctol: {
        type: DataTypes.STRING
    },
    RHSrejnH: {
        type: DataTypes.STRING
    },
    RHSrejnL: {
        type: DataTypes.STRING
    },
    MonorejnH: {
        type: DataTypes.STRING
    },
    MonorejnL: {
        type: DataTypes.STRING
    },
    rejnON: {
        type: DataTypes.STRING
    },
    awcON: {
        type: DataTypes.STRING
    },
    hydp: {
        type: DataTypes.STRING
    },
}, {
    sequelize,
    modelName: 'recipies',
    timestamps: false
})

module.exports = Recipies;