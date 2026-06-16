const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Warranty = sequelize.define('Warranty', {
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
    warranty_provider: {
      type: DataTypes.STRING,
      allowNull: true
    },
    warranty_type: {
      type: DataTypes.STRING, // e.g. Onsite, Carry-in, NBD, Parts Only
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    warranty_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contact_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.VIRTUAL,
      get() {
        if (!this.end_date) return 'unknown';
        const today = new Date();
        const end = new Date(this.end_date);
        const daysLeft = Math.ceil((end - today) / 86400000);
        if (daysLeft < 0) return 'expired';
        if (daysLeft <= 30) return 'expiring_soon';
        return 'active';
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'warranties',
    timestamps: false,
    createdAt: 'created_at'
  });

  Warranty.associate = (models) => {
    Warranty.belongsTo(models.Asset, { foreignKey: 'asset_id', as: 'asset' });
  };

  return Warranty;
};
