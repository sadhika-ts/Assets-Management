const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'staff', 'viewer'),
      defaultValue: 'staff',
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'users',
    timestamps: false,
    createdAt: 'created_at'
  });

  User.associate = (models) => {
    User.hasMany(models.Asset, { foreignKey: 'assigned_to', as: 'assignedAssets' });
    User.hasMany(models.AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
  };

  return User;
};
