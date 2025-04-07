const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if the user already exists
    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists. Please choose another one." });
    }

    // Add user to users array
    users.push({ username, password });

    return res.status(201).json({ message: "User registered successfully!" });
});

// Get the book list available in the shop
// Get book list using async/await
public_users.get('/async-books', async (req, res) => {
    try {
        const getBooks = () => {
            return new Promise((resolve, reject) => {
                if (books) {
                    resolve(books);
                } else {
                    reject({ message: "Books not found" });
                }
            });
        };

        const data = await getBooks();
        res.status(200).send(JSON.stringify(data, null, 4));
    } catch (error) {
        res.status(500).json(error);
    }
});


// Get book details based on ISBN
// Get book details by ISBN using async/await
public_users.get('/async-isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    const getBookByISBN = (isbn) => {
        return new Promise((resolve, reject) => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject({ message: "Book not found" });
            }
        });
    };

    try {
        const book = await getBookByISBN(isbn);
        res.status(200).json(book);
    } catch (error) {
        res.status(404).json(error);
    }
});

  
  
// Get book details based on author
// Get books by author using async/await
public_users.get('/async-author/:author', async (req, res) => {
    const author = req.params.author;

    const getBooksByAuthor = (author) => {
        return new Promise((resolve, reject) => {
            const matchingBooks = [];

            for (let isbn in books) {
                if (books[isbn].author === author) {
                    matchingBooks.push({ isbn, ...books[isbn] });
                }
            }

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject({ message: "No books found for the given author" });
            }
        });
    };

    try {
        const booksByAuthor = await getBooksByAuthor(author);
        res.status(200).json({ booksByAuthor });
    } catch (error) {
        res.status(404).json(error);
    }
});

  

// Get all books based on title
// Get books by title using async/await
public_users.get('/async-title/:title', async (req, res) => {
    const title = req.params.title;

    const getBooksByTitle = (title) => {
        return new Promise((resolve, reject) => {
            const matchingBooks = [];

            for (let isbn in books) {
                if (books[isbn].title === title) {
                    matchingBooks.push({ isbn, ...books[isbn] });
                }
            }

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject({ message: "No books found with the given title" });
            }
        });
    };

    try {
        const booksByTitle = await getBooksByTitle(title);
        res.status(200).json({ booksByTitle });
    } catch (error) {
        res.status(404).json(error);
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      res.status(200).json({ reviews: book.reviews });
    } else {
      res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
