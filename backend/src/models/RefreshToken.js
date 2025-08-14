const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deviceInfo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "refresh_tokens",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["token"],
      },
      {
        fields: ["userId"],
      },
      {
        fields: ["expiresAt"],
      },
    ],
  },
)

module.exports = RefreshToken
