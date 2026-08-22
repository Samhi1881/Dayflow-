const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  checkIn: { type: DataTypes.DATE, field: 'check_in' },
  checkOut: { type: DataTypes.DATE, field: 'check_out' },
  status: { type: DataTypes.ENUM('present', 'absent', 'half_day', 'leave'), allowNull: false, defaultValue: 'present' },
}, {
  tableName: 'attendance',
  underscored: true,
  indexes: [
    { unique: true, fields: ['user_id', 'date'] },
    { fields: ['date'] },
    { fields: ['user_id', 'date'] },
  ],
});