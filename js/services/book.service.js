'use strict'
const STORAGE_KEY = 'books'

var gBooks
_createBooks()

function getBooks() {
    return gBooks
}

function removeBook(bookId) {
    const bookIdx = gBooks.findIndex(book => book.id === bookId)
    gBooks.splice(bookIdx, 1)
}

function updatePrice(bookId, price) {
    const book = gBooks.find(book => book.id === bookId)
    book.price = price
}


function addBook(title, price, imgUrl) {
    gBooks.push({ id: makeid(), title, price, imgUrl })
    
    _saveBooks()
}


function _createBooks() {
    gBooks = loadFromStorage(STORAGE_KEY)
    if (gBooks && gBooks.length > 0) return

    gBooks = [
        _createBook('Harry Potter and the half blood price', 160, null),
        _createBook('The Hobbit', 120, null),
        _createBook('The Martian', 80, null),
    ]
    _saveBooks()
}

function _createBook(title, price, imgUrl) {
    return {
        id: makeid(),
        title,
        price,
        imgUrl
    }
}

function _saveBooks() {
    saveToStorage(STORAGE_KEY, gBooks)
}