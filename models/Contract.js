const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Contract = sequelize.define('Contract', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    contract_id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    contract_name: {
      type: DataTypes.STRING,
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
      allowNull: true
    },
    vendor_phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vendor_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vendor_contact_person: {
      type: DataTypes.STRING,
      allowNull: true
    },
    active_from: {
      type: DataTypes.DATE,
      allowNull: false
    },
    active_till: {
      type: DataTypes.DATE,
      allowNull: false
    },
    contract_value: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'upcoming', 'expiring_soon'),
      defaultValue: 'upcoming',
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'contracts',
    timestamps: false,
    createdAt: 'created_at'
  });

  return Contract;
};
