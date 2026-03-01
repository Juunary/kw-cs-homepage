const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // 동일한 sequelize 인스턴스 가져오기

const Questions = sequelize.define('Questions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    admin_id: {
        type: DataTypes.STRING,
        allowNull: true, // NULL 허용 설정
    },
    nickname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    question: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    answer: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    isDeleted: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'Questions',
    timestamps: false,
});

module.exports = Questions;