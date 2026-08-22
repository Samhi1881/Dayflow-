const {
  Attendance,
  EmployeeProfile,
  LeaveRequest,
  User,
} = require('../models');

describe('database models', () => {
  test('defines the required tables and attendance uniqueness', () => {
    expect(User.getTableName()).toBe('users');
    expect(EmployeeProfile.getTableName()).toBe('employee_profiles');
    expect(Attendance.getTableName()).toBe('attendance');
    expect(LeaveRequest.getTableName()).toBe('leave_requests');
    expect(Attendance.options.indexes).toEqual(expect.arrayContaining([
      expect.objectContaining({ unique: true, fields: ['user_id', 'date'] }),
    ]));
  });
});