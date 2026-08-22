const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('EmployeeProfile', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: 'user_id' },
  phone: { type: DataTypes.STRING(30) },
  address: { type: DataTypes.STRING(255) },
  jobTitle: { type: DataTypes.STRING(100), field: 'job_title' },
  department: { type: DataTypes.STRING(100) },
  photoUrl: { type: DataTypes.STRING(500), field: 'photo_url' },
  dateJoined: { type: DataTypes.DATEONLY, field: 'date_joined' },
  salary: { type: DataTypes.DECIMAL(12, 2) },
}, { tableName: 'employee_profiles', underscored: true });