const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId/", async (request, response) => {
  let { bookId } = request.params;
  let getBook = `SELECT * FROM book 
    WHERE book_Id=${bookId};`;
  const book = await db.get(getBook);
  response.send(book);
});
//create book API
app.post("/books/", async (request, response) => {
  let bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;
  let dbResponse = await db.run(addBookQuery);
  const bookId = dbResponse.lastID;
  response.send({ bookId: bookId });
});
//update details of book
app.put("/books/:bookId/", async (request, response) => {
  let { bookId } = request.params;
  let bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  let updateBookQuery = `UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;
  let updatedBook = await db.run(updateBookQuery);
  response.send("book updated successfully");
});

//delete book API
app.delete("/books/:bookId/", async (request, response) => {
  let { bookId } = request.params;
  const deleteBookQuery = `
    DELETE FROM
        book
    WHERE
        book_id = ${bookId};`;
  let deleteBook = await db.run(deleteBookQuery);
  response.send("book deleted successfully");
});

//getting book of author
app.get("/authors/:authorId/books/", async (request, response) => {
  const { authorId } = request.params;
  let getBooks = `SELECT *
    FROM book
    WHERE 
    author_Id = ${authorId};`;
  let books = await db.all(getBooks);
  console.log(books);
  response.send(books);
});
