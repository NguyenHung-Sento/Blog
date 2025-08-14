-- Create database
CREATE DATABASE IF NOT EXISTS personal_blog 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE personal_blog;

-- =============================================
-- Users Table
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(100) NOT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_active (isActive),
  INDEX idx_created (createdAt)
);

-- =============================================
-- Categories Table
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_slug (slug),
  INDEX idx_name (name)
);

-- =============================================
-- Posts Table
-- =============================================
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  excerpt VARCHAR(500) DEFAULT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  featuredImage VARCHAR(255) DEFAULT NULL,
  published BOOLEAN DEFAULT FALSE,
  publishedAt DATETIME DEFAULT NULL,
  authorId INT NOT NULL,
  categoryId INT DEFAULT NULL,
  viewCount INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
  
  INDEX idx_author (authorId),
  INDEX idx_category (categoryId),
  INDEX idx_published (published),
  INDEX idx_created (createdAt),
  INDEX idx_slug (slug),
  INDEX idx_published_date (publishedAt),
  FULLTEXT idx_search (title, content, excerpt)
);

-- =============================================
-- Comments Table
-- =============================================
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  postId INT NOT NULL,
  authorId INT NOT NULL,
  parentId INT DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parentId) REFERENCES comments(id) ON DELETE CASCADE,
  
  INDEX idx_post (postId),
  INDEX idx_author (authorId),
  INDEX idx_parent (parentId),
  INDEX idx_created (createdAt)
);

-- =============================================
-- Likes Table
-- =============================================
CREATE TABLE IF NOT EXISTS likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  postId INT NOT NULL,
  userId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_like (postId, userId),
  INDEX idx_post (postId),
  INDEX idx_user (userId)
);

-- =============================================
-- Follows Table
-- =============================================
CREATE TABLE IF NOT EXISTS follows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  followerId INT NOT NULL,
  followingId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (followerId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (followingId) REFERENCES users(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_follow (followerId, followingId),
  INDEX idx_follower (followerId),
  INDEX idx_following (followingId)
);

-- =============================================
-- Refresh Tokens Table
-- =============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(500) NOT NULL UNIQUE,
  userId INT NOT NULL,
  expiresAt DATETIME NOT NULL,
  isRevoked BOOLEAN DEFAULT FALSE,
  deviceInfo VARCHAR(255) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_token (token),
  INDEX idx_user (userId),
  INDEX idx_expires (expiresAt),
  INDEX idx_revoked (isRevoked)
);

-- =============================================
-- Password Resets Table
-- =============================================
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expiresAt DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_token (token),
  INDEX idx_expires (expiresAt),
  INDEX idx_used (used)
);
