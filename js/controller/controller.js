'use strict'
var gBooks

function onInit() {
    renderBooks()
}

function renderBooks() {
    gBooks = getBooks()
    console.log(gBooks)

    const elTable = document.querySelector('table')

    var tableStrHTML = `<table>
                        <tr>
                            <th>Title</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>`

    tableStrHTML += gBooks.map(book => {
        return `<tr>
        <td>${book.title}</td>
        <td>${book.price}</td>
            <td>
                <button class="read-btn">Read</button>
                <button class="update-btn" onclick = "onUpdateBook(${book.id})">Update</button>
                <button class="delete-btn" onclick = "onRemoveBook(${book.id})">Delete</button>

            </td>
        </tr>`
    }).join('')

    elTable.innerHTML = tableStrHTML
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