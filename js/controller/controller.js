'use strict'
var gFilterBy = ''
var gSuccessMsgTimeout
var gIsEditMode = false
var gCurrBook
var gFilteredBooks
var gRating
var gView = 'table'
var gQueryOptions = {
    page: { id: 0, size: 4 },
    sort: { id: 0, size: 4 },
    filterBy: { title: '', minRating: null }
}

const STAR = '&#9733;'
const STAR_ADD_ICON = '&oplus;'
function onInit() {
    renderBooks()
}

function renderBooks() {
    gFilteredBooks = getBooks(gQueryOptions)
    const elTableContainer = document.querySelector('.data-container')

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
}

function renderBookTable(elTableContainer) {
    elTableContainer.classList.remove('grid-view')
    elTableContainer.classList.remove('list-view')
    elTableContainer.classList.add('table-view')

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
                            ${getBookHeaderHTML(book)}
                        </td>`

        strHTML += `
                <td> 
                 ${book.price}
                </td>
                <td>
                    ${getActionBtnsHTML(book)}
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
                        ${getBookHeaderHTML(book)}
                        <img src="${book.imgUrl}" class="book-cover">
                                    <div class="book-price">Price: $${book.price} </div>

                        ${getActionBtnsHTML(book)}

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
        strHTML += `
<div class="book-card" id="book-${book.id}">
    <div class="card-header">
        <img class="card-icon expand-card-icon" src="img/caret-right-fill.svg" alt=""
            onclick="onExpandCard(this,'${book.id}','.collapse-card-icon')">
        <img class="card-icon collapse-card-icon" src="img/caret-down-fill.svg" alt=""
            onclick="onCollapseCard(this,'${book.id}','.expand-card-icon')">
        <h2>${book.title}</h2>
        <div class="rating-chip">${book.rating ? book.rating : ''} </div>
    </div>

    <div class="card-data">
        <div class="book-information">
            <img class="book-cover" src="${book.imgUrl}" alt="">
            <div class="book-price">Price: $${book.price} </div>
            <div class="rate">
                <div>
                    <span class="star star-1" onmouseover="onRatingHover('${book.id}',1)"
                        onclick="onLockRating()">&#9733;</span>
                    <span class="star star-2" onmouseover="onRatingHover('${book.id}',2)"
                        onclick="onLockRating()">&#9733;</span>
                    <span class="star star-3" onmouseover="onRatingHover('${book.id}',3)"
                        onclick="onLockRating()">&#9733;</span>
                    <span class="star star-4" onmouseover="onRatingHover('${book.id}',4)"
                        onclick="onLockRating()">&#9733;</span>
                    <span class="star star-5" onmouseover="onRatingHover('${book.id}',5)"
                        onclick="onLockRating()">&#9733;</span>
                </div>
                <button class="change-rating-btn"
                    onclick=" onRateChange()">Change Rating</button>
            </div>
        </div>
        ${getActionBtnsHTML(book)}

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

function onSetFilter() {
    const elTitle = document.querySelector('.filter-by-title')
    const elMinRating = document.querySelector('.filter-by-rating')

    gQueryOptions.filterBy = {
        title: elTitle.value,
        minRating: +elMinRating.value
    }

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
}

function onRateChange(changeDirection, rateNumContainerSlctr, ev) {
    // ev.preventDefault()

    // const elRatingNumContainer = document.querySelector(rateNumContainerSlctr)

    // var currRating = +elRatingNumContainer.textContent
    // if (currRating + changeDirection < 0 || currRating + changeDirection > 5) return

    // elRatingNumContainer.innerText = currRating + changeDirection

    updateBook(gCurrBook.id, 'rating', gRating)
    renderBooks()

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
    elRateChip.classList.add('star', 'selected')
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

function onExpandCard(elIcon, bookId, otherIconSlctr) {
    const elBookCards = document.querySelectorAll('.book-card')
    elBookCards.forEach(bookCard => {
        var currBookId = bookCard.id.substring(5)
        console.log('currBookId', currBookId)

        if (bookCard.id !== `book-${bookId}`) onCollapseCard(bookCard.querySelector('.collapse-card-icon'), currBookId, '.expand-card-icon')
    })
    gCurrBook = getBookById(bookId)

    elIcon.style.display = 'none'
    const elRateContainer = document.querySelector('.rate-container')
    const elBookCard = document.querySelector(`#book-${bookId}`)

    // elBookCard.querySelector('.rate').innerHTML = elRateContainer.innerHTML


    const elBookCardData = elBookCard.querySelector(`.card-data`)
    const elOtherIcon = elBookCard.querySelector(otherIconSlctr)
    elOtherIcon.style.display = 'inline'
    elBookCardData.classList.add('expanded')
}

function onCollapseCard(elIcon, bookId, otherIconSlctr) {
    elIcon.style.display = 'none'

    console.log('bookId', bookId)
    const elBookCard = document.querySelector(`#book-${bookId}`)
    console.log('elBookCard', elBookCard)

    const elOtherIcon = elBookCard.querySelector(otherIconSlctr)
    elOtherIcon.style.display = 'inline'

    const elBookCardData = elBookCard.querySelector(`.card-data`)
    elBookCardData.classList.remove('expanded')
}

function onRatingHover(bookId, num) {
    document.querySelectorAll(`.star`).forEach(elStar => elStar.classList.remove('active', 'selected'))

    gRating = num
    for (var i = 1; i < 6; i++) {
        if (i > num) break

        if (bookId) var currElStar = document.querySelector(`#book-${bookId} .star-${i}`)
        else var currElStar = document.querySelector(`.star-${i}`)
        currElStar.classList.add('active')
    }
}

function onLockRating() {
    for (var i = 1; i <= gRating; i++) {

        var currElStar = document.querySelector(`.star-${i}`)
        currElStar.classList.add('selected')
    }
}

function getActionBtnsHTML(book) {
    return `     <div class="actions">
            <button class="read-btn" onclick="onShowDetails('${book.id}')">
<svg xmlns="http://www.w3.org/2000/svg"
     width="16"
     height="16"
     fill="currentColor"
     viewBox="0 0 32 32">
  <path d="M0 23.008v-17.984q0-1.024 0.48-1.888t1.28-1.44q1.024-0.672 2.24-0.672 0.736 0 1.472 0.256l10.016 4q0.064 0.032 0.512 0.32 0.448-0.288 0.512-0.32l10.016-4q0.736-0.256 1.472-0.256 1.248 0 2.24 0.672 0.832 0.576 1.312 1.44t0.448 1.888v17.984q0 1.248-0.672 2.24t-1.856 1.472l-9.984 4q-0.736 0.288-1.472 0.288-1.024 0-2.016-0.576-0.992 0.576-1.984 0.576-0.768 0-1.504-0.288l-9.984-4q-1.152-0.448-1.824-1.472t-0.704-2.24zM4 23.008l10.016 4v-17.984l-10.016-4v17.984zM6.016 21.824v-2.016l5.984 2.4v2.016zM6.016 17.824v-2.016l5.984 2.4v2.016zM6.016 13.824v-2.016l5.984 2.4v2.016zM6.016 9.824v-2.016l5.984 2.4v2.016zM18.016 27.008l9.984-4v-17.984l-9.984 4v17.984zM20 24.224v-2.016l6.016-2.4v2.016zM20 20.224v-2.016l6.016-2.4v2.016zM20 16.224v-2.016l6.016-2.4v2.016zM20 12.224v-2.016l6.016-2.4v2.016z"/>
</svg>         Read
            </button>
            <button class="update-btn" onclick="onUpdateBook('${book.id}')">
<svg xmlns="http://www.w3.org/2000/svg"
     width="16"
     height="16"
     fill="currentColor"
     viewBox="0 0 32 32">

  <path d="M0 26.016v-20q0-2.496 1.76-4.256t4.256-1.76h14.688l-4.032 4h-10.656q-0.832 0-1.44 0.608t-0.576 1.408v20q0 0.832 0.576 1.408t1.44 0.576h20q0.8 0 1.408-0.576t0.576-1.408v-10.688l4-4v14.688q0 2.496-1.76 4.224t-4.224 1.76h-20q-2.496 0-4.256-1.76t-1.76-4.224zM6.016 26.016l2.112-7.84 12.256-12.192 5.728 5.568-12.32 12.288zM22.112 4.256l3.072-3.072q1.152-1.184 2.816-1.184t2.816 1.184 1.184 2.816-1.184 2.848l-2.976 2.976z"/>
</svg>
            Update</button>
            <button class="delete-btn" onclick="onRemoveBook('${book.id}')">
<svg xmlns="http://www.w3.org/2000/svg"
     width="16"
     height="16"
     fill="currentColor"
     viewBox="0 0 32 32">

  <path d="M2.016 8q0 0.832 0.576 1.44t1.408 0.576v16q0 2.496 1.76 4.224t4.256 1.76h12q2.464 0 4.224-1.76t1.76-4.224v-16q0.832 0 1.408-0.576t0.608-1.44-0.608-1.408-1.408-0.576h-5.984q0-2.496-1.792-4.256t-4.224-1.76q-2.496 0-4.256 1.76t-1.728 4.256h-6.016q-0.832 0-1.408 0.576t-0.576 1.408zM8 26.016v-16h16v16q0 0.832-0.576 1.408t-1.408 0.576h-12q-0.832 0-1.44-0.576t-0.576-1.408zM12 23.008q0 0.416 0.288 0.704t0.704 0.288 0.704-0.288 0.32-0.704v-8q0-0.416-0.32-0.704t-0.704-0.288-0.704 0.288-0.288 0.704v8zM14.016 6.016q0-0.832 0.576-1.408t1.408-0.608 1.408 0.608 0.608 1.408h-4zM18.016 23.008q0 0.416 0.288 0.704t0.704 0.288 0.704-0.288 0.288-0.704v-8q0-0.416-0.288-0.704t-0.704-0.288-0.704 0.288-0.288 0.704v8z"/>

</svg>
            Delete</button>
            </div>`

}

function getBookHeaderHTML(book) {
    return `                            <div class="book-header">
                                 ${book.title}
                                <div class= "rating-chip">${book.rating ? book.rating : ''} </div>
                            </div>`
}