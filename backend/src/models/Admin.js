const { DataTypes } = require("sequelize");
const sequelize = require("../db"); // 동일한 sequelize 인스턴스 가져오기

const Admin = sequelize.define(
    "Admin",
    {
        id: {
            type: DataTypes.STRING(500),
            primaryKey: true,
        },
        password: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        department: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
    tableName: 'Admin',
    timestamps: false,
});

module.exports = Admin;
