const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { QueryTypes } = require('sequelize');

const now = new Date();
const seedPassword = process.env.SEED_PASSWORD || crypto.randomBytes(24).toString('hex');
const passwordHash = bcrypt.hashSync(seedPassword, 10);

const employees = [
  { name: 'Aisha Khan', email: 'aisha.khan@example.com', department: 'Engineering', jobTitle: 'Software Engineer', salary: '72000.00' },
  { name: 'Daniel Lee', email: 'daniel.lee@example.com', department: 'Finance', jobTitle: 'Financial Analyst', salary: '68000.00' },
  { name: 'Meera Patel', email: 'meera.patel@example.com', department: 'People Operations', jobTitle: 'HR Specialist', salary: '61000.00' },
  { name: 'Noah Williams', email: 'noah.williams@example.com', department: 'Sales', jobTitle: 'Account Executive', salary: '65000.00' },
  { name: 'Sofia Garcia', email: 'sofia.garcia@example.com', department: 'Design', jobTitle: 'Product Designer', salary: '70000.00' },
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('users', [
      { name: 'Morgan Brooks', email: 'admin@example.com', password_hash: passwordHash, role: 'admin', created_at: now, updated_at: now },
      ...employees.map(({ name, email }) => ({ name, email, password_hash: passwordHash, role: 'employee', created_at: now, updated_at: now })),
    ], { returning: true });

    const userRows = await queryInterface.sequelize.query('SELECT id, email FROM users WHERE email IN (:emails)', {
      replacements: { emails: ['admin@example.com', ...employees.map(({ email }) => email)] },
      type: QueryTypes.SELECT,
    });
    const byEmail = Object.fromEntries(userRows.map((user) => [user.email, user.id]));

    await queryInterface.bulkInsert('employee_profiles', employees.map((employee, index) => ({
      user_id: byEmail[employee.email],
      phone: `+1-555-010${index + 1}`,
      address: `${index + 1} Dayflow Avenue`,
      job_title: employee.jobTitle,
      department: employee.department,
      date_joined: `202${index + 1}-0${(index % 8) + 1}-15`,
      salary: employee.salary,
      created_at: now,
      updated_at: now,
    })), { returning: true });

    const attendanceRows = [];
    for (const employee of employees) {
      const userId = byEmail[employee.email];
      for (let offset = 1; offset <= 3; offset += 1) {
        const date = new Date(now);
        date.setDate(date.getDate() - offset);
        const dateValue = date.toISOString().slice(0, 10);
        attendanceRows.push({ user_id: userId, date: dateValue, check_in: `${dateValue} 09:00:00`, check_out: `${dateValue} 17:30:00`, status: 'present', created_at: now, updated_at: now });
      }
    }
    await queryInterface.bulkInsert('attendance', attendanceRows);

    await queryInterface.bulkInsert('leave_requests', [
      { user_id: byEmail[employees[0].email], leave_type: 'paid', start_date: '2026-09-10', end_date: '2026-09-12', remarks: 'Family event', status: 'pending', created_at: now, updated_at: now },
      { user_id: byEmail[employees[1].email], leave_type: 'sick', start_date: '2026-08-18', end_date: '2026-08-19', remarks: 'Medical appointment', status: 'approved', admin_comment: 'Approved by HR', reviewed_by: byEmail['admin@example.com'], created_at: now, updated_at: now },
      { user_id: byEmail[employees[2].email], leave_type: 'unpaid', start_date: '2026-10-01', end_date: '2026-10-02', remarks: 'Personal leave', status: 'rejected', admin_comment: 'Please choose an available date', reviewed_by: byEmail['admin@example.com'], created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('leave_requests', null, {});
    await queryInterface.bulkDelete('attendance', null, {});
    await queryInterface.bulkDelete('employee_profiles', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};