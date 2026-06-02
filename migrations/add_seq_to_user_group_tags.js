const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add seq column to user_group_tags table
    await queryInterface.addColumn('user_group_tags', 'seq', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Sequence number for ordering group tags',
    });

    // Add index for better query performance when ordering by seq
    await queryInterface.addIndex('user_group_tags', {
      fields: ['department_id', 'seq'],
      name: 'idx_user_group_tags_department_seq'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index
    await queryInterface.removeIndex('user_group_tags', 'idx_user_group_tags_department_seq');
    
    // Remove seq column
    await queryInterface.removeColumn('user_group_tags', 'seq');
  }
};
