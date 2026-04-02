'use strict'
const STORAGE_KEY = 'books'
const HARRY_POTTER_IMG_URL = 'img/Harry_Potter_and_the_Order_of_the_Phoenix.jpg'
const THE_HOBBIT_IMG_URL = 'img/download.jpeg'
const THE_MARTIAN_IMG_URL = 'img/810W+zAp2DL._AC_UF1000,1000_QL80_.jpg'

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

function getBookById(id) {
    return gBooks.find(book => book.id === id)
}

function _createBooks() {
    gBooks = loadFromStorage(STORAGE_KEY)
    if (gBooks && gBooks.length > 0) return

    gBooks = [
        _createBook('Harry Potter and the Order of Phoenix', 160, HARRY_POTTER_IMG_URL),
        _createBook('The Hobbit', 120, THE_HOBBIT_IMG_URL),
        _createBook('The Martian', 80, THE_MARTIAN_IMG_URL),
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