const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if username is already registered
    return users.some(user => user.username === username);
}
  
const authenticatedUser = (username, password) => {
    // Check if both username and password match any registered user
    return users.some(user => user.username === username && user.password === password);
}
  
// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    // Check for missing fields
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    // Authenticate user
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid login credentials." });
    }
  
    // Generate JWT token
    const token = jwt.sign({ username }, 'access', { expiresIn: '1h' });
  
    // Save in session
    req.session.authorization = {
      token,
      username
    };
  
    return res.status(200).json({ message: "User successfully logged in!", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization?.username;
  
    if (!username) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
  
    if (!review) {
      return res.status(400).json({ message: "Review cannot be empty." });
    }
  
    let book = books[isbn];
  
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }
  
    // Add or update the review
    if (!book.reviews) {
      book.reviews = {};
    }
  
    book.reviews[username] = review;
  
    return res.status(200).json({ message: "Review added/updated successfully.", reviews: book.reviews });
});
  
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
  
    if (books[isbn]) {
      let book = books[isbn];
  
      if (book.reviews && book.reviews[username]) {
        delete book.reviews[username];
        return res.status(200).json({ message: "Review deleted successfully." });
      } else {
        return res.status(404).json({ message: "No review by this user for this book." });
      }
    } else {
      return res.status(404).json({ message: "Book not found." });
    }
});
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
