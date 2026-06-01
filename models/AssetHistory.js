module.exports = (sequelize, DataTypes) => {
  const AssetHistory = sequelize.define('AssetHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    assetId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'assets',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.ENUM('created', 'updated', 'assigned', 'unassigned', 'repaired', 'deactivated'),
      allowNull: false
    },
    previousValue: {
      type: DataTypes.JSON,
      allowNull: true
    },
    newValue: {
      type: DataTypes.JSON,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'asset_history',
    timestamps: false
  });

  AssetHistory.associate = (models) => {
    AssetHistory.belongsTo(models.Asset, { foreignKey: 'assetId' });
    AssetHistory.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return AssetHistory;
};
