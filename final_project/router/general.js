const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // 🔥 Check if both fields are provided
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    // 🔥 Check if username already exists
    const userExists = users.some(user => user.username === username);

    if (userExists) {
        return res.status(409).json({
            message: "User already exists"
        });
    }

    // 🔥 Register new user
    users.push({ username, password });

    return res.status(201).json({
        message: "User registered successfully"
    });
});

// Add this so Axios has a place to get the data from
public_users.get('/books', function (req, res) {
    res.send(JSON.stringify(books));
});
// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/books');

        return res.status(200).send(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        const response = await axios.get('http://localhost:5000/books');

        const books = response.data;

        const book = books[isbn];

        if (book) {
            return res.status(200).send(book);
        } else {
            return res.status(404).json({ message: "Book not found" });
        }

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching book data",
            error: error.message
        });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const authorName = req.params.author.toLowerCase();

    try {
        const response = await axios.get('http://localhost:5000/books');

        const books = response.data;
        let result = {};

        Object.keys(books).forEach((isbn) => {
            if (books[isbn].author.toLowerCase() === authorName) {
                result[isbn] = books[isbn];
            }
        });

        if (Object.keys(result).length > 0) {
            return res.status(200).send(result);
        } else {
            return res.status(404).json({ message: "No books found for this author" });
        }

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching books",
            error: error.message
        });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const titleName = req.params.title.toLowerCase();

    try {
        const response = await axios.get('http://localhost:5000/books');

        const books = response.data;
        let result = {};

        Object.keys(books).forEach((isbn) => {
            if (books[isbn].title.toLowerCase() === titleName) {
                result[isbn] = books[isbn];
            }
        });

        if (Object.keys(result).length > 0) {
            return res.status(200).send(result);
        } else {
            return res.status(404).json({ message: "No books found for this title" });
        }

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching books",
            error: error.message
        });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const book = books[isbn];

    if (book) {
        return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
