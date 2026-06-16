const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SoftwareLicense = sequelize.define('SoftwareLicense', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    asset_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'assets', key: 'id' }
    },
    license_key: {
      type: DataTypes.STRING,
      allowNull: true
    },
    license_vendor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    license_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'software_licenses',
    timestamps: false,
    createdAt: 'created_at'
  });

  SoftwareLicense.associate = (models) => {
    SoftwareLicense.belongsTo(models.Asset, { foreignKey: 'asset_id', as: 'asset' });
  };

  return SoftwareLicense;
};
