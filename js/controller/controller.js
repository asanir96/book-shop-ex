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
                <button class="update-btn">Update</button>
                <button class="delete-btn" onclick = "onRemoveBook(${book.id})">Delete</button>

            </td>
        </tr>`
    }).join('')

    elTable.innerHTML = tableStrHTML
}


function onRemoveBook(bookId){
    removeBook(bookId)
    renderBooks()
}