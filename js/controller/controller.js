'use strict'
var gFilterBy = ''
var gSuccessMsgTimeout

function onInit() {
    renderBooks()
}

function renderBooks() {
    const books = getBooks(gFilterBy)
    console.log(gBooks)

    const elTBody = document.querySelector('tbody')

    var tableStrHTML = ''

    tableStrHTML += books.map(book => {
        return `<tr>
        <td>${book.title}</td>
        <td>${book.price}</td>
            <td>
                <button class="read-btn" onclick = "onShowDetails('${book.id}')">Read</button>
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

    showSuccessMsg('Book was deleted successfully!')
}

function onUpdateBook(bookId) {
    const newBookPrice = +prompt(`Enter a new price for the book "${gBooks.find(book => book.id === bookId).title}"`)
    if (!newBookPrice) {
        alert('Invalid input')
        return
    }
    updatePrice(bookId, newBookPrice)
    renderBooks()
    showSuccessMsg('Book was updated successfully!')

}

function onRevealInputRow(inputSlctr, apprvBtnSlctr, cnclBtnSlctr, elAddBtn) {
    elAddBtn.style.display = 'none'
    const elInputRow = document.querySelector(inputSlctr)
    const elApproveBtn = document.querySelector(apprvBtnSlctr)
    const elCancelBtn = document.querySelector(cnclBtnSlctr)

    elInputRow.style.display = 'table-row'

    elApproveBtn.style.display = 'inline'
    elCancelBtn.style.display = 'inline'
}


function onAddBook(titleInputSlctr, priceInputSlctr) {
    const inputPrice = +document.querySelector(priceInputSlctr).value
    const inputTitle = document.querySelector(titleInputSlctr).value

    if (!inputPrice || !inputTitle) {
        alert('All fields must be filled')
        return
    }
    const elAddBtn = document.querySelector('.add-btn')
    const elApproveBtn = document.querySelector('.add-approve-btn')
    const elCancelBtn = document.querySelector('.add-cancel-btn')

    elApproveBtn.style.display = 'none'
    elCancelBtn.style.display = 'none'
    elAddBtn.style.display = 'inline'

    addBook(inputTitle, inputPrice)
    showSuccessMsg('Book was added successfully!')
    renderBooks()
}

function onShowDetails(bookId) {
    const book = getBookById(bookId)
    const bookJSON = JSON.stringify(book)

    const elDialog = document.querySelector('dialog')
    const elDialogH2 = elDialog.querySelector('h2')
    const elDialogImg = elDialog.querySelector('img')
    const elDialogH3 = elDialog.querySelector('h3')

    elDialogImg.src = book.imgUrl
    elDialogH2.innerText = book.title
    elDialogH3.innerText = `Price: ${book.price}$`

    elDialog.showModal()
}

function onFilter(elInput) {
    gFilterBy = elInput.value

    renderBooks()
}

function showSuccessMsg(msg) {
    console.log(msg)
    clearTimeout(gSuccessMsgTimeout)

    const elSuccessMsg = document.querySelector('.success-message')

    elSuccessMsg.innerText = msg
    elSuccessMsg.style.display = 'block'

    gSuccessMsgTimeout = setTimeout((elSuccessMsg) => {
        elSuccessMsg.style.display = 'none'
    }, 2000, elSuccessMsg);
}