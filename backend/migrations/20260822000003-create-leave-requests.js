module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('leave_requests', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      leave_type: { type: Sequelize.ENUM('paid', 'sick', 'unpaid'), allowNull: false },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      remarks: { type: Sequelize.TEXT },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected'), allowNull: false, defaultValue: 'pending' },
      admin_comment: { type: Sequelize.TEXT },
      reviewed_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('leave_requests', ['user_id', 'status'], { name: 'idx_leave_requests_user_status' });
    await queryInterface.addIndex('leave_requests', ['status'], { name: 'idx_leave_requests_status' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('leave_requests');
  },
};