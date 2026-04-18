'use strict'
const STORAGE_KEY = 'books'
const HARRY_POTTER_IMG_URL = 'img/Harry_Potter_and_the_Order_of_the_Phoenix.jpg'
const THE_HOBBIT_IMG_URL = 'img/download.jpeg'
const THE_MARTIAN_IMG_URL = 'img/810W+zAp2DL._AC_UF1000,1000_QL80_.jpg'
const PLACEHOLDER = 'img/book.svg'

var gBooks
_createBooks()

function getBooks(queryOptions) {
    var books = [...gBooks]
    books = _filterBooks(books, queryOptions.filterBy)
    books = _sortBooks(books, queryOptions.sortBy)
    return books
}

function _filterBooks(books, filterBy) {
    if (filterBy.title) {
        const lowerBookTitle = filterBy.title.trim().toLowerCase()
        if (lowerBookTitle) {
            books = books.filter(book => book.title.toLowerCase().includes(lowerBookTitle))
        }
    }

    if (filterBy.minRating) {
        books = books.filter(book => book.rating >= filterBy.minRating)
    }

    return books
}

function _sortBooks(books, sortBy) {
    console.log('sortBy',sortBy)
    if (sortBy.sortField === 'title') {
        books.sort((book1, book2) => book1.title.localeCompare(book2.title) * sortBy.sortDir)
    } else {
        books.sort((book1, book2) => (book1[sortBy.sortField] - book2[sortBy.sortField]) * sortBy.sortDir)
    }

    return books
}

function removeBook(bookId) {
    const bookIdx = gBooks.findIndex(book => book.id === bookId)
    gBooks.splice(bookIdx, 1)

    _saveBooks()
}

function updateBook(bookId, property, value) {
    const book = gBooks.find(book => book.id === bookId)
    value = isNaN(value) ? value : +value
    book[property] = value

    _saveBooks()
}


function addBook(title, price, imgUrl, rating) {
    gBooks.push(_createBook(title, price, imgUrl, rating))

    _saveBooks()
}

function getBookById(id) {
    return gBooks.find(book => book.id === id)
}

function _createBooks() {
    gBooks = loadFromStorage(STORAGE_KEY)
    if (gBooks && gBooks.length > 0) return

    gBooks = [
        _createBook('Harry Potter and the Order of Phoenix', 160, HARRY_POTTER_IMG_URL, 0),
        _createBook('The Hobbit', 120, THE_HOBBIT_IMG_URL, 3),
        _createBook('The Martian', 80, THE_MARTIAN_IMG_URL, 5),
    ]
    _saveBooks()
}

function _createBook(title, price, imgUrl, rating) {
    const book = {
        id: makeid(),
        title,
        price,
        rating: rating? rating:0
    }

    if (imgUrl) book.imgUrl = imgUrl
    else book.imgUrl = PLACEHOLDER
    return book
}

function _saveBooks() {
    saveToStorage(STORAGE_KEY, gBooks)
}