'use strict'
var gFilterBy = ''
var gSuccessMsgTimeout
var gIsEditMode = false
var gCurrBook
var gFilteredBooks

var gView = 'table'

const STAR = '&#9733;'
function onInit() {
    renderBooks()
}

function renderBooks() {
    gFilteredBooks = getBooks(gFilterBy)
    const elTableContainer = document.querySelector('.table-container')

    switch (gView) {
        case 'table':
            renderBookTable(elTableContainer)
            break;
        case 'grid':
            renderGridBooks(elTableContainer)
            break;
        case 'list':
            renderBookList(elTableContainer)
            break;
    }
    // if (gView === 'table') renderBookTable(elTableContainer)
    // else renderGridBooks(elTableContainer)
}

function renderBookTable(elTableContainer) {
    elTableContainer.classList.remove('grid-view')
    elTableContainer.classList.remove('list-view')

    var tableStrHTML = `            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>`

    tableStrHTML += gFilteredBooks.map(book => {
        var strHTML = ''
        strHTML += `<tr> 
                        <td> 
                            <div class="flex-wrapper">
                                 ${book.title}
                                <div class= "rating-chip">${book.rating ? book.rating : ''} </div>
                            </dv>
                        </td>`

        strHTML += `<td> <div class="flex-wrapper"> ${book.price}</dv></td>
                <td>
                    <div class="flex-wrapper">
                        <button class="read-btn" onclick="onShowDetails('${book.id}')">Read</button>
                        <button class="update-btn" onclick="onUpdateBook('${book.id}')">Update</button>
                        <button class="delete-btn" onclick="onRemoveBook('${book.id}')">Delete</button>
                    </dv>
                </td>
                </tr> `
        return strHTML
    }
    ).join('')

    tableStrHTML += `</table>
`

    elTableContainer.innerHTML = tableStrHTML
    const elRatingChips = elTableContainer.querySelectorAll('.rating-chip')
    elRatingChips.forEach((elRatingChip, idx) => renderRatingChipStyle(elRatingChip, idx))
}

function renderGridBooks(elTableContainer) {
    elTableContainer.classList.remove('table-view')
    elTableContainer.classList.remove('list-view')

    var tableStrHTML = ''
    elTableContainer.classList.add('grid-view')
    tableStrHTML += gFilteredBooks.map(book => {
        var strHTML = ''
        strHTML += `<div class="book-card">
                        <h2>${book.title}</h2>
                        <div class= "rating-chip">${book.rating ? book.rating : ''} </div>
                        <img class = "book-cover" src="${book.imgUrl}" alt="">
                        <button class="read-btn" onclick="onShowDetails('${book.id}')">Read</button>
                        <button class="update-btn" onclick="onUpdateBook('${book.id}')">Update</button>
                        <button class="delete-btn" onclick="onRemoveBook('${book.id}')">Delete</button>
                    </div>`
        return strHTML
    }
    ).join('')

    elTableContainer.innerHTML = tableStrHTML
    const elRatingChips = elTableContainer.querySelectorAll('.rating-chip')
    elRatingChips.forEach((elRatingChip, idx) => {
        renderRatingChipStyle(elRatingChip, idx)
        elRatingChip.style.margin = 0
    }
    )

}

function renderBookList(elTableContainer) {
    elTableContainer.classList.remove('table-view')
    elTableContainer.classList.remove('grid-view')

    var tableStrHTML = ''
    elTableContainer.classList.add('list-view')
    tableStrHTML += gFilteredBooks.map(book => {
        var strHTML = ''
        strHTML += `<div class="book-card" id="book-${book.id}">
                        <div class="card-header">
                            <img  class="card-icon expand-card-icon" src="img/arrow-right.svg" alt="" onclick="onExpandCard(this,'#book-${book.id}','.collapse-card-icon')">
                            <img  class="card-icon collapse-card-icon" src="img/arrow-return-right.svg" alt="" onclick="onCollapseCard(this,'#book-${book.id}','.expand-card-icon')">
                            <h2>${book.title}</h2>
                            <div class= "rating-chip">${book.rating ? book.rating : ''} </div>
                        </div>
                        
                        <div class="card-data">
                            <img class= "book-cover" src="${book.imgUrl}" alt="">
                            <button class="read-btn" onclick="onShowDetails('${book.id}')">Read</button>
                            <button class="update-btn" onclick="onUpdateBook('${book.id}')">Update</button>
                            <button class="delete-btn" onclick="onRemoveBook('${book.id}')">Delete</button>
                        </div>
                        
                    </div>`
        return strHTML
    }
    ).join('')

    elTableContainer.innerHTML = tableStrHTML
    const elRatingChips = elTableContainer.querySelectorAll('.rating-chip')
    elRatingChips.forEach((elRatingChip, idx) => {
        renderRatingChipStyle(elRatingChip, idx)
        elRatingChip.style.margin = 0
    }
    )

}

function onRemoveBook(bookId) {
    if (gIsEditMode) return

    hideAddBookUI()
    removeBook(bookId)
    renderBooks()

    showSuccessMsg('Book was deleted successfully!')
}

function onUpdateBook(bookId) {
    if (gIsEditMode) return

    hideAddBookUI()
    const newBookPrice = +prompt(`Enter a new price for the book "${gBooks.find(book => book.id === bookId).title}"`)
    if (!newBookPrice) {
        alert('Invalid input')
        return
    }
    updateBook(bookId, 'price', newBookPrice)
    renderBooks()
    showSuccessMsg('Book was updated successfully!')

}

function onRevealInputRow(inputSlctr, apprvBtnSlctr, cnclBtnSlctr, elAddBtn) {
    // disableActions()

    elAddBtn.style.display = 'none'

    const elAddBookForm = document.querySelector('.add-book-form')
    elAddBookForm.showModal()
}

function onCancelAddBook() {
    hideAddBookUI()
    enableActions()
}

function onAddBook(elForm, ev) {
    console.log(elForm)
    const bookTitle = elForm.querySelector('.title-input').value
    const bookPrice = +elForm.querySelector('.price-input').value

    addBook(bookTitle, bookPrice)
    hideAddBookUI()
    enableActions()
    showSuccessMsg('Book was added successfully!')
    renderBooks()
}

function onShowDetails(bookId) {
    if (gIsEditMode) return

    gCurrBook = getBookById(bookId)
    const bookJSON = JSON.stringify(gCurrBook)

    const elDetailsDialog = document.querySelector('.details-modal')
    const elDialogImg = elDetailsDialog.querySelector('img')
    elDialogImg.src = gCurrBook.imgUrl

    const elDialogH2 = elDetailsDialog.querySelector('h2')
    const elDialogH3 = elDetailsDialog.querySelector('h3')

    elDialogH2.innerText = gCurrBook.title
    elDialogH3.innerText = `Price: ${gCurrBook.price} $`

    elDetailsDialog.showModal()
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

function hideAddBookUI() {
    const elAddBookForm = document.querySelector('.add-book-form')
    const elAddBtn = document.querySelector('.add-btn')

    elAddBookForm.querySelector('.title-input').value = ''
    elAddBookForm.querySelector('.price-input').value = ''

    elAddBookForm.close()
    elAddBtn.style.display = 'initial'
}

function disableActions() {
    gIsEditMode = true

    document.querySelectorAll('.read-btn').forEach(btn => btn.classList.add('disabled'))
    document.querySelectorAll('.update-btn').forEach(btn => btn.classList.add('disabled'))
    document.querySelectorAll('.delete-btn').forEach(btn => btn.classList.add('disabled'))

    const elFilterInput = document.querySelector(".filter input")
    elFilterInput.disabled = true;
    elFilterInput.placeholder = 'Finish adding a row or cancel';
    elFilterInput.style.opacity = '0.4'
}

function enableActions() {
    gIsEditMode = false

    document.querySelectorAll('.read-btn').forEach(btn => btn.classList.remove('disabled'))
    document.querySelectorAll('.update-btn').forEach(btn => btn.classList.remove('disabled'))
    document.querySelectorAll('.delete-btn').forEach(btn => btn.classList.remove('disabled'))

    const elFilterInput = document.querySelector(".filter input")
    elFilterInput.disabled = false;
    elFilterInput.placeholder = 'Filter by Book Title';
    elFilterInput.style.opacity = '1'

}

function onShowRatingBtn(elRateActionBtn, plsBtnSlctr, minusBtnSlctr, rateNumsContainerSlctr, ev) {
    ev.preventDefault()
    elRateActionBtn.innerText = 'Confirm Rating'
    elRateActionBtn.setAttribute('onclick', `onConfirmRating('.rate-numbers-container', event)`)

    const elPlsBtn = document.querySelector(plsBtnSlctr)
    const elMinusBtn = document.querySelector(minusBtnSlctr)
    const elRatingNumContainer = document.querySelector(rateNumsContainerSlctr)

    elRatingNumContainer.style.display = 'block'
    elPlsBtn.style.display = 'flex'
    elMinusBtn.style.display = 'flex'
}

function hideRatingAction(rateActionBtnSlctr, plsBtnSlctr, minusBtnSlctr, rateNumsContainerSlctr, ev) {
    gCurrBook = null

    const elRateActionBtn = document.querySelector(rateActionBtnSlctr)
    const elPlsBtn = document.querySelector(plsBtnSlctr)
    const elMinusBtn = document.querySelector(minusBtnSlctr)
    const elRatingNumContainer = document.querySelector(rateNumsContainerSlctr)

    elRateActionBtn.setAttribute('onclick', `onShowRatingBtn(this, '.rate-plus-btn', '.rate-minus-btn', '.rate-numbers-container', event)`)
    elRateActionBtn.innerText = 'Rate this book'
    elRateActionBtn.style.display = 'block'

    elRatingNumContainer.innerText = 0
    elRatingNumContainer.style.display = 'none'
    elPlsBtn.style.display = 'none'
    elMinusBtn.style.display = 'none'
}

function onRateChange(changeDirection, rateNumContainerSlctr, ev) {
    ev.preventDefault()
    const elRatingNumContainer = document.querySelector(rateNumContainerSlctr)

    var currRating = +elRatingNumContainer.textContent
    if (currRating + changeDirection < 0 || currRating + changeDirection > 5) return

    elRatingNumContainer.innerText = currRating + changeDirection

}

function onRatingHandler(elRateActionBtn, plsBtnSlctr, minusBtnSlctr, rateNumsContainerSlctr, ev) {
    const elRatingNumContainer = document.querySelector('.rate-numbers-container')

    if (elRatingNumContainer.style.display !== 'none') onShowRatingBtn(elRateActionBtn, plsBtnSlctr, minusBtnSlctr, rateNumsContainerSlctr, ev)
    else confirmRating()
}

function onConfirmRating(rateNumsContainer, ev) {

    const elRateNumbsContainer = document.querySelector(rateNumsContainer)
    updateBook(gCurrBook.id, 'rating', elRateNumbsContainer.innerText)
    hideRatingAction('.rate-action-btn', '.rate-plus-btn', '.rate-minus-btn', '.rate-numbers-container')
    renderBooks()
}

function renderRatingChipStyle(elRateChip, idx) {
    const book = gFilteredBooks[idx]

    var strHTML = STAR.repeat(book.rating)


    elRateChip.innerHTML = strHTML

    if (book.rating <= 5 && book.rating > 3) {
        elRateChip.classList.add('high-rating-chip')
    } else if (book.rating <= 3 && book.rating > 1) {
        elRateChip.classList.add('medium-rating-chip')
    } else if (book.rating === 1) {
        elRateChip.classList.add('low-rating-chip')

    }
}

function onChangeView(selectedView) {
    if (gIsEditMode) return

    gView = selectedView
    // elIcon.classList.add('active')
    const elIcons = document.querySelectorAll('.icon')
    elIcons.forEach(elIcon => {
        console.log(elIcon.classList)
        if (!elIcon.classList.contains(`${selectedView}-icon`)) elIcon.classList.remove('active')
        else elIcon.classList.add('active')
    })

    console.log('elIcons', elIcons)
    // const elOtherIcon = document.querySelector(`.${otherView}-icon`)
    // elOtherIcon.classList.remove('active')
    renderBooks()
}

function onExpandCard(elIcon, bookIdSlctr, otherIconSlctr) {
    elIcon.style.display = 'none'
    
    const elBookCard = document.querySelector(bookIdSlctr)
    const elBookCardData = elBookCard.querySelector(`.card-data`)
    const elOtherIcon = elBookCard.querySelector(otherIconSlctr)
    elOtherIcon.style.display = 'inline'
    elBookCardData.classList.add('expanded')
}

function onCollapseCard(elIcon, bookIdSlctr, otherIconSlctr) {
    elIcon.style.display = 'none'
    
    const elBookCard = document.querySelector(bookIdSlctr)
    const elBookCardData = elBookCard.querySelector(`.card-data`)
    const elOtherIcon = elBookCard.querySelector(otherIconSlctr)
    elOtherIcon.style.display = 'inline'
    elBookCardData.classList.remove('expanded')
}