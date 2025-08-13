const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Post = sequelize.define(
  "Post",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [5, 255],
      },
    },
    content: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
      validate: {
        len: [10, 50000],
      },
    },
    excerpt: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    featuredImage: {
      type: DataTypes.STRING(255),
      defaultValue: null,
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "categories",
        key: "id",
      },
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "posts",
    timestamps: true,
    indexes: [
      {
        fields: ["authorId"],
      },
      {
        fields: ["categoryId"],
      },
      {
        fields: ["published"],
      },
      {
        fields: ["createdAt"],
      },
      {
        unique: true,
        fields: ["slug"],
      },
    ],
  },
)

module.exports = Post
