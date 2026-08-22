const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('LeaveRequest', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  leaveType: { type: DataTypes.ENUM('paid', 'sick', 'unpaid'), allowNull: false, field: 'leave_type' },
  startDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'start_date' },
  endDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'end_date' },
  remarks: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), allowNull: false, defaultValue: 'pending' },
  adminComment: { type: DataTypes.TEXT, field: 'admin_comment' },
  reviewedBy: { type: DataTypes.INTEGER, field: 'reviewed_by' },
}, { tableName: 'leave_requests', underscored: true });