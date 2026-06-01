const sequelize = require('../config/db');

const User = require('./User');
const Asset = require('./Asset');
const AssetDetail = require('./AssetDetail');
const Purchase = require('./Purchase');
const Contract = require('./Contract');
const AuditLog = require('./AuditLog');

const models = {
  User: User(sequelize),
  Asset: Asset(sequelize),
  AssetDetail: AssetDetail(sequelize),
  Purchase: Purchase(sequelize),
  Contract: Contract(sequelize),
  AuditLog: AuditLog(sequelize)
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = require('sequelize');

module.exports = models;
