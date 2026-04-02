'use strict'
var gBooks

function onInit() {
    renderBooks()
}

function renderBooks() {
    const books = getBooks()
    console.log(gBooks)

    const elTBody = document.querySelector('tbody')

    var tableStrHTML = ''

    tableStrHTML += books.map(book => {
        return `<tr>
        <td>${book.title}</td>
        <td>${book.price}</td>
            <td>
                <button class="read-btn">Read</button>
                <button class="update-btn" onclick = "onUpdateBook('${book.id}')">Update</button>
                <button class="delete-btn" onclick = "onRemoveBook('${book.id}')">Delete</button>

            </td>
        </tr>`
    }).join('')

    tableStrHTML += ` <tr class="input-row">           
            <td> <input class="title-input" type="text"></td>
            <td><input class="price-input" type="number"></td>
            <td></td> </tr>`

    elTBody.innerHTML = tableStrHTML
}


function onRemoveBook(bookId) {
    removeBook(bookId)
    renderBooks()
}

function onUpdateBook(bookId) {
    const newBookPrice = +prompt(`Enter a new price for the book "${gBooks.find(book => book.id === bookId).title}"`)
    if (!newBookPrice) {
        alert('Invalid input')
        return
    }
    updatePrice(bookId, newBookPrice)
    renderBooks()
}   