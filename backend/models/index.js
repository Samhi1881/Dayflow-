const sequelize = require('../config/database');
const User = require('./user')(sequelize);
const EmployeeProfile = require('./employeeProfile')(sequelize);
const Attendance = require('./attendance')(sequelize);
const LeaveRequest = require('./leaveRequest')(sequelize);

User.hasOne(EmployeeProfile, { foreignKey: 'userId', as: 'profile', onDelete: 'CASCADE' });
EmployeeProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Attendance, { foreignKey: 'userId', as: 'attendance' });
Attendance.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(LeaveRequest, { foreignKey: 'userId', as: 'leaveRequests' });
LeaveRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(LeaveRequest, { foreignKey: 'reviewedBy', as: 'reviewedLeaveRequests' });
LeaveRequest.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

module.exports = { sequelize, User, EmployeeProfile, Attendance, LeaveRequest };