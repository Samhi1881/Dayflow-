module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('employee_profiles', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      user_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      phone: { type: Sequelize.STRING(30) },
      address: { type: Sequelize.STRING(255) },
      job_title: { type: Sequelize.STRING(100) },
      department: { type: Sequelize.STRING(100) },
      photo_url: { type: Sequelize.STRING(500) },
      date_joined: { type: Sequelize.DATEONLY },
      salary: { type: Sequelize.DECIMAL(12, 2) },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('employee_profiles');
  },
};