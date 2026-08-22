module.exports = {
  async up(queryInterface) {
    const timestamp = new Date();
    await queryInterface.sequelize.query(`
      INSERT INTO employee_profiles (user_id, created_at, updated_at)
      SELECT users.id, :timestamp, :timestamp
      FROM users
      LEFT JOIN employee_profiles ON employee_profiles.user_id = users.id
      WHERE users.role = 'employee' AND employee_profiles.user_id IS NULL
    `, { replacements: { timestamp } });
  },

  async down() {},
};