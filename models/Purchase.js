const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Purchase = sequelize.define('Purchase', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    purchase_id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    vendor_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vendor_contact: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vendor_email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    billing_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    purchase_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'purchases',
    timestamps: false,
    createdAt: 'created_at'
  });

  Purchase.associate = (models) => {
    Purchase.hasMany(models.Asset, { foreignKey: 'purchase_id', as: 'assets' });
  };

  return Purchase;
};
