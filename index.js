import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "goodreads",
    password: "8q98749",
    port: 5432,
});

db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


const getCoverUrl = (book) => {
    if (book.isbn) {
        return `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;
    } else if (book.oclc) {
        return `https://covers.openlibrary.org/b/oclc/${book.oclc}-M.jpg`;
    } else if (book.lccn) {
        return `https://covers.openlibrary.org/b/lccn/${book.lccn}-M.jpg`;
    } else if (book.olid) {
        return `https://covers.openlibrary.org/b/olid/${book.olid}-M.jpg`;
    } else if (book.id) {
            return `https://covers.openlibrary.org/b/olid/${book.id}-M.jpg`;    
    } else {
        return null;
    }
};

app.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM books");
    const books = result.rows;

    // Fetch cover URLs
    for (let book of books) {
        book.cover_url = getCoverUrl(book);
    }
    console.log(books);
    res.render("index.ejs", { books: books });
});

app.post("/submit", async (req, res) => {
    const { name, review, isbn, oclc, lccn, olid,id } = req.body;
    try {
        await db.query(
            "INSERT INTO books (title, review, isbn, oclc, lccn, olid, uid) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [name, review, isbn, oclc, lccn, olid, id]
        );
    } catch (err) {
        console.log(err);
    }
    res.redirect("/");
});

app.post("/delete", async (req, res) => {
    const delete_book = req.body.delete.toLowerCase();
    try {
        await db.query("DELETE FROM books WHERE LOWER(title) = $1", [delete_book]);
    } catch (err) {
        console.log(err);
    }
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
