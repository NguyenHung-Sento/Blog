const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const PasswordReset = sequelize.define(
  "PasswordReset",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "password_resets",
    timestamps: true,
    indexes: [
      {
        fields: ["email"],
      },
      {
        fields: ["token"],
      },
      {
        fields: ["expiresAt"],
      },
    ],
  },
)

module.exports = PasswordReset
