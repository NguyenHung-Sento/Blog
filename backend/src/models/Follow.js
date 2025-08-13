const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Follow = sequelize.define(
  "Follow",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "follows",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["followerId", "followingId"],
      },
      {
        fields: ["followerId"],
      },
      {
        fields: ["followingId"],
      },
    ],
  },
)

module.exports = Follow
