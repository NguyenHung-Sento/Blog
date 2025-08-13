const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1000],
      },
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "posts",
        key: "id",
      },
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "comments",
        key: "id",
      },
    },
  },
  {
    tableName: "comments",
    timestamps: true,
    indexes: [
      {
        fields: ["postId"],
      },
      {
        fields: ["authorId"],
      },
      {
        fields: ["parentId"],
      },
    ],
  },
)

module.exports = Comment
