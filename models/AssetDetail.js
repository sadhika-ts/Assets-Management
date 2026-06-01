const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AssetDetail = sequelize.define('AssetDetail', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    asset_id: {
      type: DataTypes.UUID,
      unique: true,
      allowNull: false,
      references: {
        model: 'assets',
        key: 'id'
      }
    },
    os_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    os_version: {
      type: DataTypes.STRING,
      allowNull: true
    },
    product_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    os_activated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    processor_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cores: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ram_gb: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    disk_gb: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    disk_model: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ms_office: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    office_key: {
      type: DataTypes.STRING,
      allowNull: true
    },
    software_list: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    configuration: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    others: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'asset_details',
    timestamps: false,
    createdAt: 'created_at'
  });

  AssetDetail.associate = (models) => {
    AssetDetail.belongsTo(models.Asset, { foreignKey: 'asset_id', as: 'asset' });
  };

  return AssetDetail;
};
