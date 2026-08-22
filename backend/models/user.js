const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
  role: { type: DataTypes.ENUM('admin', 'employee'), allowNull: false, defaultValue: 'employee' },
}, { tableName: 'users', underscored: true });