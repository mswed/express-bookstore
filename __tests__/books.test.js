process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

const bookA = {
    "isbn": "0691161518",
    "amazon_url": "http://a.co/eobPtX2",
    "author": "Matthew Lane",
    "language": "english",
    "pages": 264,
    "publisher": "Princeton University Press",
    "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
    "year": 2017
}

const bookB = {
    "isbn": "0691161554",
    "amazon_url": "http://a.co/eobPtX7",
    "author": "Moshe Swed",
    "language": "english",
    "pages": 6,
    "publisher": "Unknown",
    "title": "Maude and other foods",
    "year": 2020
}

const bookC = {
    "isbn": "0667861554",
    "amazon_url": "http://a.co/eobPtY7",
    "author": "Bob Boberton",
    "language": "french",
    "pages": 500,
    "publisher": "Sandwich publishing",
    "title": "Why the British Suck",
    "year": 1984
}

const bookD = {
    "isbn": "0667861554",
    "amazon_url": "http://a.co/eobPtY7",
    "language": "french",
    "pages": 500,
    "title": "Why the British Suck",
    "year": 1984
}

const bookE = {
    "isbn": 691161518,
    "amazon_url": "http://a.co/eobPtX2",
    "author": "Matthew Lane",
    "language": "english",
    "pages": "264",
    "publisher": "Princeton University Press",
    "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
    "year": 2017
}
beforeEach(async () => {
    await db.query(`DELETE
                    FROM books`);

    await db.query(`INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
                    VALUES ('${bookB.isbn}', '${bookB.amazon_url}', '${bookB.author}', '${bookB.language}',
                            ${bookB.pages},
                            '${bookB.publisher}', '${bookB.title}', ${bookB.year})`);
    await db.query(`INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
                    VALUES ('${bookC.isbn}', '${bookC.amazon_url}', '${bookC.author}', '${bookC.language}',
                            ${bookC.pages},
                            '${bookC.publisher}', '${bookC.title}', ${bookC.year})`);
})


describe('GET /', () => {
    test('Can get all books', async () => {
        const res = await request(app).get('/books')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
                books: [
                    {
                        isbn: '0691161554',
                        amazon_url: 'http://a.co/eobPtX7',
                        author: 'Moshe Swed',
                        language: 'english',
                        pages: 6,
                        publisher: 'Unknown',
                        title: 'Maude and other foods',
                        year: 2020
                    },
                    {
                        isbn: '0667861554',
                        amazon_url: 'http://a.co/eobPtY7',
                        author: 'Bob Boberton',
                        language: 'french',
                        pages: 500,
                        publisher: 'Sandwich publishing',
                        title: 'Why the British Suck',
                        year: 1984
                    }
                ]
            }
        )
    })
})

describe('GET /:id', () => {
    test('Can get book by isbn', async () => {
        const res = await request(app).get('/books/0691161554')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({
                book: bookB
            }
        )
    })
})

describe('POST /', () => {
    test('Can create a book', async () => {
        const res = await request(app).post('/books').send(bookA)
        expect(res.body).toEqual({book: bookA})
    })

    test('Errors out on creating duplicate', async () => {
        const res = await request(app).post('/books').send(bookB);
        expect(res.error.status).toBe(500);
        expect(res.body.error.code).toBe('23505')

    })

    test('Fails validation on missing values', async () => {
        try {
            console.log('Started missing values test')
            const res = await request(app).post('/books').send(bookD);
            expect(res.statusCode).toBe(400);
            expect(res.body.error.message).toEqual([
                'instance requires property "author"',
                'instance requires property "publisher"'
            ])

        } catch (e) {
            console.log(e)
        }
    })

    test('Fails validation on wrong data types', async () => {
        try {
            console.log('Started missing values test')
            const res = await request(app).post('/books').send(bookE);
            expect(res.statusCode).toBe(400);
            expect(res.body.error.message).toEqual([
                'instance.isbn is not of a type(s) string',
                'instance.pages is not of a type(s) integer'

            ])

        } catch (e) {
            console.log(e)
        }
    })

    describe('PUT /:id', () => {
        test('Can update a book', async () => {
            const res = await request(app).put('/books/0691161554').send({
                "isbn": "0691161554",
                "amazon_url": "http://dingo.com",
                "author": "Bob Boberts",
                "language": "latin",
                "pages": 17,
                "publisher": "Me",
                "title": "Something or another",
                "year": 2050
            })
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({
                book: {
                    "isbn": "0691161554",
                    "amazon_url": "http://dingo.com",
                    "author": "Bob Boberts",
                    "language": "latin",
                    "pages": 17,
                    "publisher": "Me",
                    "title": "Something or another",
                    "year": 2050
                }
            })
        })


        test('Fails validation on missing values', async () => {
            try {
                const res = await request(app).post('/books/0691161554').send(bookD);
                expect(res.statusCode).toBe(400);
                expect(res.body.error.message).toEqual([
                    'instance requires property "author"',
                    'instance requires property "publisher"'
                ])

            } catch (e) {
                console.log(e)
            }
        })

        test('Fails validation on wrong data types', async () => {
            try {
                console.log('Started missing values test')
                const res = await request(app).post('/books').send(bookE);
                expect(res.statusCode).toBe(400);
                expect(res.body.error.message).toEqual([
                    'instance.isbn is not of a type(s) string',
                    'instance.pages is not of a type(s) integer'

                ])

            } catch (e) {
                console.log(e)
            }
        })
    })
});

describe('DELETE /:id', () => {
    test('Can delete a book by isbn', async () => {
        const res = await request(app).delete('/books/0691161554')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({ message: "Book deleted" })
    })

    test('Errors out if book not found', async () => {
        const res = await request(app).delete('/books/2343')
        expect(res.statusCode).toBe(404)
    })
})

afterAll(async () => {
    try {
        await db.end();
    } catch (err) {
        console.error('Error closing the database connection:', err);
    }
});


// `23505`