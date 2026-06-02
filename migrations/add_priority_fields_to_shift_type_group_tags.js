const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add priority_level column
    await queryInterface.addColumn('shift_type_group_tags', 'priority_level', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Priority level for shift assignment (1 = highest, higher number = lower priority)',
    });

    // Add is_primary_group column
    await queryInterface.addColumn('shift_type_group_tags', 'is_primary_group', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this group is the primary group for this shift type',
    });

    // Add index for better query performance
    await queryInterface.addIndex('shift_type_group_tags', {
      fields: ['shift_type_id', 'priority_level'],
      name: 'idx_shift_type_priority'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index
    await queryInterface.removeIndex('shift_type_group_tags', 'idx_shift_type_priority');
    
    // Remove columns
    await queryInterface.removeColumn('shift_type_group_tags', 'is_primary_group');
    await queryInterface.removeColumn('shift_type_group_tags', 'priority_level');
  }
};
