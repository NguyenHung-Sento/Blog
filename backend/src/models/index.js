const User = require("./User")
const Post = require("./Post")
const Comment = require("./Comment")
const Like = require("./Like")
const Category = require("./Category")
const Follow = require("./Follow")

// Define associations
User.hasMany(Post, { foreignKey: "authorId", as: "posts", onDelete: "CASCADE" })
Post.belongsTo(User, { foreignKey: "authorId", as: "author" })

Category.hasMany(Post, { foreignKey: "categoryId", as: "posts", onDelete: "SET NULL" })
Post.belongsTo(Category, { foreignKey: "categoryId", as: "category" })

User.hasMany(Comment, { foreignKey: "authorId", as: "comments", onDelete: "CASCADE" })
Comment.belongsTo(User, { foreignKey: "authorId", as: "author" })

Post.hasMany(Comment, { foreignKey: "postId", as: "comments", onDelete: "CASCADE" })
Comment.belongsTo(Post, { foreignKey: "postId", as: "post" })

Comment.hasMany(Comment, { foreignKey: "parentId", as: "replies", onDelete: "CASCADE" })
Comment.belongsTo(Comment, { foreignKey: "parentId", as: "parent" })

User.hasMany(Like, { foreignKey: "userId", as: "likes", onDelete: "CASCADE" })
Like.belongsTo(User, { foreignKey: "userId", as: "user" })

Post.hasMany(Like, { foreignKey: "postId", as: "likes", onDelete: "CASCADE" })
Like.belongsTo(Post, { foreignKey: "postId", as: "post" })

// Follow associations
User.hasMany(Follow, { foreignKey: "followerId", as: "following", onDelete: "CASCADE" })
User.hasMany(Follow, { foreignKey: "followingId", as: "followers", onDelete: "CASCADE" })

Follow.belongsTo(User, { foreignKey: "followerId", as: "follower" })
Follow.belongsTo(User, { foreignKey: "followingId", as: "following" })

module.exports = {
  User,
  Post,
  Comment,
  Like,
  Category,
  Follow,
}
