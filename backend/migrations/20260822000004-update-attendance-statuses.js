module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('attendance', 'status', { type: Sequelize.ENUM('present', 'absent', 'half_day', 'leave'), allowNull: false, defaultValue: 'present' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('attendance', 'status', { type: Sequelize.ENUM('present', 'late', 'absent', 'half_day'), allowNull: false, defaultValue: 'present' });
  },
};