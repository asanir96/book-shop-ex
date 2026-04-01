'use strict'

var gBooks = [
    {
        id: 1,
        title: 'Harry Potter and the Order of Phoenix',
        price: 120,
        imgUrl: 'lori-ipsi.jpg'
    },
    {
        id: 2,
        title: 'The Hobbit',
        price: 160,
        imgUrl: 'lori-ipsi.jpg'
    },
    {
        id: 3,
        title: 'The Martian',
        price: 80,
        imgUrl: 'lori-ipsi.jpg'
    }

]

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


function addBook() {

}