'use strict';

const { Sequelize } = require('sequelize');
const { sequelize } = require('../services/db');
const { User } = require('./User');
const { Badge } = require('./Badge');

const UserBadge = sequelize.define(
  'user_badge',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    badge_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: Badge,
        key: 'id',
      },
    },
    awarded_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: 'user_badges',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'badge_id'],
      },
    ],
  },
);

UserBadge.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
User.hasMany(UserBadge, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

UserBadge.belongsTo(Badge, {
  foreignKey: 'badge_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Badge.hasMany(UserBadge, {
  foreignKey: 'badge_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

module.exports = {
  UserBadge,
};
