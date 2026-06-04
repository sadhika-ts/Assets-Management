'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Add column to assets table
      await queryInterface.addColumn(
        'assets',
        'other_subtype_description',
        {
          type: Sequelize.TEXT,
          allowNull: true
        },
        { transaction }
      );

      // Add columns to asset_details table
      await queryInterface.addColumn(
        'asset_details',
        'other_applications_installed',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'asset_details',
        'other_applications_description',
        {
          type: Sequelize.TEXT,
          allowNull: true
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove columns from assets table
      await queryInterface.removeColumn('assets', 'other_subtype_description', { transaction });

      // Remove columns from asset_details table
      await queryInterface.removeColumn('asset_details', 'other_applications_installed', { transaction });
      await queryInterface.removeColumn('asset_details', 'other_applications_description', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
