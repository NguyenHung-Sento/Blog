const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 100],
      },
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: "#3B82F6",
      validate: {
        is: /^#[0-9A-F]{6}$/i,
      },
    },
  },
  {
    tableName: "categories",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["slug"],
      },
      {
        fields: ["name"],
      },
    ],
  },
)

module.exports = Category
