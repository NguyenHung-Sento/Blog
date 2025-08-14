const User = require("./User")
const Post = require("./Post")
const Comment = require("./Comment")
const Like = require("./Like")
const Category = require("./Category")
const Follow = require("./Follow")
const PasswordReset = require("./PasswordReset")
const RefreshToken = require("./RefreshToken")

// User associations
User.hasMany(Post, { foreignKey: "authorId", as: "posts" })
User.hasMany(Comment, { foreignKey: "authorId", as: "comments" })
User.hasMany(Like, { foreignKey: "userId", as: "likes" })
User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" })

// Follow associations
User.hasMany(Follow, { foreignKey: "followerId", as: "following" })
User.hasMany(Follow, { foreignKey: "followingId", as: "followers" })

// Post associations
Post.belongsTo(User, { foreignKey: "authorId", as: "author" })
Post.belongsTo(Category, { foreignKey: "categoryId", as: "category" })
Post.hasMany(Comment, { foreignKey: "postId", as: "comments" })
Post.hasMany(Like, { foreignKey: "postId", as: "likes" })

// Comment associations
Comment.belongsTo(User, { foreignKey: "authorId", as: "author" })
Comment.belongsTo(Post, { foreignKey: "postId", as: "post" })
Comment.belongsTo(Comment, { foreignKey: "parentId", as: "parent" })
Comment.hasMany(Comment, { foreignKey: "parentId", as: "replies" })

// Like associations
Like.belongsTo(User, { foreignKey: "userId", as: "user" })
Like.belongsTo(Post, { foreignKey: "postId", as: "post" })

// Category associations
Category.hasMany(Post, { foreignKey: "categoryId", as: "posts" })

// Follow associations
Follow.belongsTo(User, { foreignKey: "followerId", as: "follower" })
Follow.belongsTo(User, { foreignKey: "followingId", as: "following" })

// RefreshToken associations
RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" })

module.exports = {
  User,
  Post,
  Comment,
  Like,
  Category,
  Follow,
  PasswordReset,
  RefreshToken,
}
