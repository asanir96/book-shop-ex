'use strict'
var gFilterBy = ''
var gSuccessMsgTimeout
var gIsEditMode = false
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
    if (gIsEditMode) return

    cancelAddRow()
    removeBook(bookId)
    renderBooks()

    showSuccessMsg('Book was deleted successfully!')
}

function onUpdateBook(bookId) {
    if (gIsEditMode) return

    cancelAddRow()
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
    disableActions()

    elAddBtn.style.display = 'none'
    const elInputRow = document.querySelector(inputSlctr)
    const elApproveBtn = document.querySelector(apprvBtnSlctr)
    const elCancelBtn = document.querySelector(cnclBtnSlctr)

    elInputRow.style.display = 'table-row'

    elApproveBtn.style.display = 'inline'
    elCancelBtn.style.display = 'inline'
}

function onCancelAddBook() {
    cancelAddRow()
    enableActions()
}

function onAddBook(titleInputSlctr, priceInputSlctr) {
    const inputPrice = +document.querySelector(priceInputSlctr).value
    const inputTitle = document.querySelector(titleInputSlctr).value

    if (!inputPrice || !inputTitle) {
        gIsEditMode = false
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
    gIsEditMode = false
}

function onShowDetails(bookId) {
    if (gIsEditMode) return

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
    clearTimeout(gSuccessMsgTimeout)

    const elSuccessMsg = document.querySelector('.success-message')

    elSuccessMsg.innerText = msg
    elSuccessMsg.style.zIndex = 1
    elSuccessMsg.style.display = 'block'
    elSuccessMsg.style.opacity = '1.0'

    gSuccessMsgTimeout = setTimeout((elSuccessMsg) => {
        elSuccessMsg.style.opacity = '0.0'
    }, 2000, elSuccessMsg);
}

function cancelAddRow() {
    const elInputRow = document.querySelector('.input-row')
    const elAddBtn = document.querySelector('.add-btn')
    const elApproveBtn = document.querySelector('.add-approve-btn')
    const elCancelBtn = document.querySelector('.add-cancel-btn')

    elInputRow.style.display = 'none'

    elApproveBtn.style.display = 'none'
    elCancelBtn.style.display = 'none'
    elAddBtn.style.display = 'inline'
}

function disableActions() {
    gIsEditMode = true

    document.querySelectorAll('.read-btn').forEach(btn => btn.style.opacity = '0.4')
    document.querySelectorAll('.update-btn').forEach(btn => btn.style.opacity = '0.4')
    document.querySelectorAll('.delete-btn').forEach(btn => btn.style.opacity = '0.4')

    const elFilterInput = document.querySelector(".filter input")
    elFilterInput.disabled = true;
    elFilterInput.placeholder = 'Finish adding a row or cancel';
    elFilterInput.style.opacity = '0.4'
}

function enableActions() {
    gIsEditMode = false

    document.querySelectorAll('.read-btn').forEach(btn => btn.style.opacity = '1')
    document.querySelectorAll('.update-btn').forEach(btn => btn.style.opacity = '1')
    document.querySelectorAll('.delete-btn').forEach(btn => btn.style.opacity = '1')

    const elFilterInput = document.querySelector(".filter input")
elFilterInput.disabled = false;
    elFilterInput.placeholder = 'Filter by Book Title';
    elFilterInput.style.opacity = '1'

}