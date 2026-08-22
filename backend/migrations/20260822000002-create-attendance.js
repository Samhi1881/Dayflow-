module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendance', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      check_in: { type: Sequelize.DATE },
      check_out: { type: Sequelize.DATE },
      status: { type: Sequelize.ENUM('present', 'late', 'absent', 'half_day'), allowNull: false, defaultValue: 'present' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addConstraint('attendance', { fields: ['user_id', 'date'], type: 'unique', name: 'uq_attendance_user_date' });
    await queryInterface.addIndex('attendance', ['date'], { name: 'idx_attendance_date' });
    await queryInterface.addIndex('attendance', ['user_id', 'date'], { name: 'idx_attendance_user_date' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('attendance');
  },
};