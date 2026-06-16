const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Asset = sequelize.define('Asset', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    asset_tag: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    asset_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('IT', 'Non-IT'),
      allowNull: false
    },
    sub_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    other_subtype_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    serial_no: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mac_address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'retired'),
      defaultValue: 'active',
      allowNull: false
    },
    purchase_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'purchases',
        key: 'id'
      }
    },
    assigned_to: {
      type: DataTypes.STRING,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'assets',
    timestamps: false,
    createdAt: 'created_at'
  });

  Asset.associate = (models) => {
    Asset.belongsTo(models.Purchase, { foreignKey: 'purchase_id', as: 'purchase' });
    Asset.hasOne(models.AssetDetail, { foreignKey: 'asset_id', as: 'detail' });
    Asset.hasMany(models.AuditLog, { foreignKey: 'asset_id', as: 'auditLogs' });
    Asset.hasMany(models.SoftwareLicense, { foreignKey: 'asset_id', as: 'licenses' });
    Asset.hasMany(models.Warranty, { foreignKey: 'asset_id', as: 'warranties' });
  };

  return Asset;
};
