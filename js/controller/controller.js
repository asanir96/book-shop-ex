'use strict'
var gFilterBy = ''
var gIsModalOpen
var gSuccessMsgTimeout
var gIsEditMode = false
var gCurrBookId = null
var gFilteredBooks
var gCurrSelectedRating = {
    rating: 0,
    locked: false
}
var gView = 'table'
var gQueryOptions = {
    page: { idx: 0, size: 4 },
    sortBy: { sortField: '', sortDir: null },
    filterBy: { title: '', minRating: null }
}

const STAR = '&#9733;'
const STAR_ADD_ICON = '&oplus;'

function onInit() {
    readQueryParams()
    renderBooks()
}

function renderBooks() {
    console.log('gQueryOptions.filterBy', gQueryOptions.filterBy)
    gFilteredBooks = getBooks(gQueryOptions)

    switch (gView) {
        case 'table':
            const elTableContainer = document.querySelector('.table-container')
            renderBookTable(elTableContainer)
            break;
        case 'grid':
            const elGridContainer = document.querySelector('.grid-view')
            renderGridBooks(elGridContainer)
            break;
        case 'list':
            const elListContainer = document.querySelector('.list-view')
            renderBookList(elListContainer)
            break;
    }

}

function renderBookTable(elDataContainer) {
    const elGridContainer = document.querySelector('.grid-view')

    elGridContainer.innerHTML = ''
    elGridContainer.style.display = 'none'

    const elListContainer = document.querySelector('.list-view')

    elListContainer.innerHTML = ''
    elListContainer.style.display = 'none'

    document.querySelector('.table-container').style.display = 'table-row-group'

    const elTbody = elDataContainer.querySelector('tbody')
    var tableStrHTML = gFilteredBooks.map(book => {
        return `
    <tr> 
        <td> ${getBookHeaderHTML(book)}</td>
        <td> ${book.price}</td>
        <td> ${getActionBtnsHTML(book)}</td>
    </tr>`}).join('')

    elTbody.innerHTML = tableStrHTML
    const elRatingChips = elDataContainer.querySelectorAll('.rating-chip')
    elRatingChips.forEach((elRatingChip, idx) => renderRatingChipStyle(elRatingChip, idx))
}

function renderGridBooks(elGridContainer) {
    const elTableContainer = document.querySelector('.table-container')
    const elTbody = elTableContainer.querySelector('tbody')

    elTbody.innerHTML = ''
    elTableContainer.style.display = 'none'

    const elListContainer = document.querySelector('.list-view')

    elListContainer.innerHTML = ''
    elListContainer.style.display = 'none'

    elGridContainer.style.display = 'grid'

    var tableStrHTML = ''
    elGridContainer.classList.add('grid-view')
    tableStrHTML += gFilteredBooks.map(book => {
        return `
    <div class="book-card">
        ${getBookHeaderHTML(book)}
        <img src="${book.imgUrl}" class="book-cover-img">
        <div class="book-price">Price: $${book.price} </div>
        ${getActionBtnsHTML(book)}
    </div>`}).join('')

    elGridContainer.innerHTML = tableStrHTML
    const elRatingChips = elGridContainer.querySelectorAll('.rating-chip')
    elRatingChips.forEach((elRatingChip, idx) => {
        renderRatingChipStyle(elRatingChip, idx)
        elRatingChip.style.margin = 0
    })
}

function renderBookList(elBooksContainer) {
    const elTableContainer = document.querySelector('.table-container')
    const elTbody = elTableContainer.querySelector('tbody')

    elTbody.innerHTML = ''
    elTableContainer.style.display = 'none'

    const elGridContainer = document.querySelector('.grid-view')

    elGridContainer.innerHTML = ''
    elGridContainer.style.display = 'none'

    elBooksContainer.style.display = 'flex'

    var tableStrHTML = gFilteredBooks.map(book => {
        return `
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
            <div class="book-edit"></div>
            ${getActionBtnsHTML(book)}
            </div>
            </div>
            </div>`
    }
    ).join('')

    elBooksContainer.innerHTML = tableStrHTML
    const elRatingChips = elBooksContainer.querySelectorAll('.rating-chip')
    elRatingChips.forEach((elRatingChip, idx) => {
        renderRatingChipStyle(elRatingChip, idx)
        elRatingChip.style.margin = 0
    }
    )

}

function onRemoveBook(bookId) {
    if (gIsEditMode) return

    removeBook(bookId)
    renderBooks()

    showSuccessMsg('Book was deleted successfully!')
}

function onOpenEditModal(bookId) {
    gIsModalOpen = true
    if (gView === 'list') {
        const elBookCards = document.querySelectorAll('.book-card')

        elBookCards.forEach(bookCard => {
            var currBookId = bookCard.id.substring(5)

            if (bookCard.id !== `book-${bookId}`) onCollapseCard(bookCard.querySelector('.collapse-card-icon'), currBookId, '.expand-card-icon')
        })
    }

    const elEditModal = document.querySelector('.book-edit-modal')
    const elBookEditHeader = elEditModal.querySelector('.book-edit-header')
    const elBookCover = elEditModal.querySelector('.book-cover')
    if (bookId) {
        fillBookEditInput(bookId, elEditModal)
        elEditModal.querySelector('.form-submit-btn.add').style.display = 'none'
        elEditModal.querySelector('.rate').style.display = 'block'
        elEditModal.querySelector('.form-submit-btn.update').style.display = 'flex'

    } else {
        elEditModal.querySelector('.form-submit-btn.update').style.display = 'none'
        elEditModal.querySelector('.rate').style.display = 'none'
        elEditModal.querySelector('.form-submit-btn.add').style.display = 'flex'

        elEditModal.querySelector('.title-input').value = ''
        elEditModal.querySelector('.price-input').value = ''
        elBookCover.innerHTML = `
        <label for="book-cover">Upload a book cover
            <svg xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                fill="currentColor"
                class="bi bi-upload" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z" />
            </svg>
        </label>
        <input type="file" id="book-cover" />`
        const elBookCoverInput = elBookEditHeader.querySelector('input')
        elBookCoverInput.style.opacity = 0

    }
    elEditModal.showModal()
}

function fillBookEditInput(bookId, elContainer) {
    const elEditForm = elContainer.querySelector('.book-edit-form')
    const elBookCover = elEditForm.querySelector('.book-cover')

    gCurrBookId = bookId
    const book = getBookById(bookId)
    elEditForm.querySelector('.title-input').value = book.title
    elEditForm.querySelector('.price-input').value = book.price
    elBookCover.innerHTML = `<img class="book-cover-img" src="${book.imgUrl}" alt=""></img>`
}

function onUpdateBook(bookId) {
    if (gIsEditMode) return

    const newBookPrice = +prompt(`Enter a new price for the book "${gBooks.find(book => book.id === bookId).title}"`)
    if (!newBookPrice) {
        alert('Invalid input')
        return
    }
    updateBook(bookId, 'price', newBookPrice)
    renderBooks()
    showSuccessMsg('Book was updated successfully!')

}

function onSubmitEditBook(elForm, ev) {

    const bookTitle = elForm.querySelector('.title-input').value
    const bookPrice = +elForm.querySelector('.price-input').value

    if (gCurrBookId) {
        updateBook(gCurrBookId, 'title', bookTitle)
        updateBook(gCurrBookId, 'price', bookPrice)

        if (gCurrSelectedRating.rating !== 0) updateBook(gCurrBookId, 'rating', gCurrSelectedRating.rating)
    } else {
        const bookCoverInput = document.querySelector('.book-cover input')
        addBook(bookTitle,
            bookPrice,
            bookCoverInput.files.length > 0 ? bookCoverInput.files[0].name : null)
    }

    gCurrBookId = null
    enableActions()
    showSuccessMsg('Book was added successfully!')
    renderBooks()
    gCurrSelectedRating = { rating: 0, locked: false }
    gIsModalOpen = false
}

function onCancelAddBook(modalSelector) {
    gIsModalOpen = false
    gCurrBookId = null
    document.querySelector(modalSelector).close()
    enableActions()
}

function onShowDetails(bookId) {
    if (gIsEditMode) return

    gCurrBookId = bookId

    const book = getBookById(gCurrBookId)
    const bookJSON = JSON.stringify(book)

    const elDetailsDialog = document.querySelector('.details-modal')
    const elDialogImg = elDetailsDialog.querySelector('img')
    elDialogImg.src = book.imgUrl

    const elDialogH2 = elDetailsDialog.querySelector('h2')
    const elDialogH3 = elDetailsDialog.querySelector('h3')

    elDialogH2.innerText = book.title
    elDialogH3.innerText = `Price: ${book.price} $`

    elDetailsDialog.showModal()
}

function onSetFilter() {
    const elTitle = document.querySelector('.filter-by-title')
    const elMinRating = document.querySelector('.filter-by-rating')
    console.log('elMinRating', elMinRating.value)
    gQueryOptions.page = {
        idx: 0,
        size: 4
    }

    gQueryOptions.filterBy = {
        title: elTitle.value,
        minRating: +elMinRating.value
    }
    setQueryParams()
    renderQueryParams()
    renderBooks()
}

function onClearFilter() {
    clearFilter()
}

function clearFilter() {
    gQueryOptions.filterBy = {
        title: '',
        minRating: null
    }

    gQueryOptions.page.idx = 0
    setQueryParams()
    renderQueryParams()
    renderBooks()
    renderDefaultFilter()
}

function renderDefaultFilter() {
    const elTitle = document.querySelector('.filter-by-title')
    const elMinRating = document.querySelector('.filter-by-rating')
    elTitle.value = ''
    elMinRating.value = ''
}

function onSetSortBy(field) {
    const elSort = document.querySelector('.sort-by select')
    const elSortDirection = document.querySelector('input[name="sort-direction"]:checked')

    gQueryOptions.sortBy = {
        sortField: field ? field : elSort.value,
    }

    if (!elSortDirection || elSortDirection.value === 'ascend') gQueryOptions.sortBy.sortDir = 1
    else gQueryOptions.sortBy.sortDir = -1

    if (!elSortDirection) document.querySelector('.sort-ascend').checked = true

    gQueryOptions.page.idx = 0
    setQueryParams()
    renderQueryParams()
    renderBooks()
}

function onClearSortBy() {
    clearSortBy()
}

function clearSortBy() {
    if (!gQueryOptions.sortBy.sortField) return

    gQueryOptions.sortBy = {
        sortField: '',
        sortDir: null
    }

    gQueryOptions.page.idx = 0

    setQueryParams()
    renderQueryParams()
    renderBooks()
    renderDefaultSortBy()
}

function renderDefaultSortBy() {
    document.querySelector('.sort-by select').value = ''
    document.querySelector('input[name="sort-direction"]:checked').checked = false

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

function onConfirmSelectedRating() {
    const elBookCard = document.querySelector(`#book-${gCurrBookId}`)
    const elBookEditModal = document.querySelector(`.book-edit-modal`)
    if (gIsModalOpen) {
        elBookEditModal.querySelectorAll(`.star`).forEach(elStar => {
            elStar.querySelector('.bi-star-fill').style.opacity = '1'
        })

    } else {
        elBookCard.querySelectorAll(`.book-information .star`).forEach(elStar => {
            elStar.querySelector('.bi-star-fill').style.opacity = '1'
        })
    }

    gCurrSelectedRating.locked = true
}

function onRatingHandler(elRateActionBtn, plsBtnSlctr, minusBtnSlctr, rateNumsContainerSlctr, ev) {
    const elRatingNumContainer = document.querySelector('.rate-numbers-container')

    if (elRatingNumContainer.style.display !== 'none') onShowRatingBtn(elRateActionBtn, plsBtnSlctr, minusBtnSlctr, rateNumsContainerSlctr, ev)
    else confirmRating()
}

function onConfirmRating(rateNumsContainer, ev) {
    const elRateNumbsContainer = document.querySelector(rateNumsContainer)
    console.log(elRateNumbsContainer)
    updateBook(gCurrBookId, 'rating', elRateNumbsContainer.innerText)
    hideRatingAction('.rate-action-btn', '.rate-plus-btn', '.rate-minus-btn', '.rate-numbers-container')
    renderBooks()
}

function renderRatingChipStyle(elRateChip, idx) {
    const book = gFilteredBooks[idx]

    var strHTML = STAR.repeat(book.rating)


    elRateChip.innerHTML = strHTML
    if (book.rating > 0) elRateChip.classList.add('star', 'selected')
    else elRateChip.classList.remove('star', 'selected')
}

function onChangeView(selectedView) {
    if (gIsEditMode) return

    gQueryOptions.page.idx = 0
    if (selectedView === 'grid') gQueryOptions.page.size = 6
    else if (selectedView === 'table') gQueryOptions.page.size = 4

    gView = selectedView

    const elIcons = document.querySelectorAll('.icon')
    elIcons.forEach(elIcon => {
        console.log(elIcon.classList)
        if (!elIcon.classList.contains(`${selectedView}-icon`)) elIcon.classList.remove('active')
        else elIcon.classList.add('active')
    })

    clearSortBy()
    clearFilter()

    gQueryOptions.page = {
        idx: 0,
        size: 6
    }
    setQueryParams()
    renderQueryParams()
    renderBooks()
}

function onExpandCard(elIcon, bookId, otherIconSlctr) {
    gCurrSelectedRating = { rating: 0, locked: false }

    const elBookCards = document.querySelectorAll('.book-card')

    elBookCards.forEach(bookCard => {
        var currBookId = bookCard.id.substring(5)

        if (bookCard.id !== `book-${bookId}`) onCollapseCard(bookCard.querySelector('.collapse-card-icon'), currBookId, '.expand-card-icon')
    })
    gCurrBookId = bookId

    elIcon.style.display = 'none'
    const elBookCard = document.querySelector(`#book-${bookId}`)

    const elBookCardData = elBookCard.querySelector(`.card-data`)
    const elOtherIcon = elBookCard.querySelector(otherIconSlctr)

    const elUpdateBtn = elBookCard.querySelector('.update-btn')
    elUpdateBtn.style.display = 'none'


    const elBookEditModal = document.querySelector('.book-edit-modal')
    const elBookEditForm = elBookEditModal.querySelector('.book-edit-form')
    elBookEditForm.method = ''
    elBookCard.querySelector('.book-edit').innerHTML = elBookEditModal.innerHTML

    fillBookEditInput(gCurrBookId, elBookCard)
    elBookCard.querySelector('.form-submit-btn.add').style.display = 'none'
    elBookCard.querySelector('.form-submit-btn.update').style.display = 'flex'

    elOtherIcon.style.display = 'inline'
    elBookCardData.classList.add('expanded')

    document.querySelectorAll(`.book-information .star`).forEach(elStar => {
        elStar.querySelector('.bi-star-fill').style.display = 'none'
        elStar.querySelector('.bi-star').style.display = 'inline'
    }

    )
    elBookCard.querySelector('.rate').style.display = 'block'
    document.querySelector('.add-cancel-btn').style.display = 'none'

}

function onCollapseCard(elIcon, bookId, otherIconSlctr) {
    elIcon.style.display = 'none'

    const elBookCard = document.querySelector(`#book-${bookId}`)

    const elOtherIcon = elBookCard.querySelector(otherIconSlctr)
    elOtherIcon.style.display = 'inline'

    const elBookCardData = elBookCard.querySelector(`.card-data`)
    elBookCardData.classList.remove('expanded')
}

function onRatingHover(num) {
    if (gCurrSelectedRating.locked || !gCurrBookId) return

    const elBookEditModal = document.querySelector(`.book-edit-modal`)
    const elBookInformation = document.querySelector(`#book-${gCurrBookId} .book-information`)

    if (gIsModalOpen) {
        clearRatingSelection(elBookEditModal)
    } else {
        clearRatingSelection(elBookInformation)
    }

    gCurrSelectedRating.rating = num
    for (var i = 1; i < 6; i++) {
        if (i > num) break

        if (gIsModalOpen) var currElStar = elBookEditModal.querySelector(`.star-${i}`)
        else var currElStar = document.querySelector(`#book-${gCurrBookId} .star-${i}`)

        currElStar.querySelector(`.bi.bi-star-fill`).style.display = 'inline'
        currElStar.querySelector(`.bi.bi-star`).style.display = 'none'
    }
}

function onLockRating() {
    for (var i = 1; i <= gCurrSelectedRating; i++) {

        var currElStar = document.querySelector(`.star-${i}`)
        currElStar.classList.add('selected')
    }
}

function clearRatingSelection(elContainer) {
    elContainer.querySelectorAll(`.star`).forEach(elStar => {
        elStar.querySelector(`.bi.bi-star`).style.display = 'inline'
        elStar.querySelector(`.bi.bi-star-fill`).style.display = 'none'
    }
    )
}

function getActionBtnsHTML(book) {
    return `     
<div class="actions">
    <button class="read-btn" onclick="onShowDetails('${book.id}')">
        <svg xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 32 32">
            <path d="M0 23.008v-17.984q0-1.024 0.48-1.888t1.28-1.44q1.024-0.672
                2.24-0.672 0.736 0 1.472 0.256l10.016 4q0.064 0.032 0.512 0.32 0.448-0.288
                0.512-0.32l10.016-4q0.736-0.256 1.472-0.256 1.248 0 2.24 0.672 0.832 0.576 
                1.312 1.44t0.448 1.888v17.984q0 1.248-0.672 2.24t-1.856 1.472l-9.984 4q-0.736
                0.288-1.472 0.288-1.024 0-2.016-0.576-0.992 0.576-1.984 0.576-0.768 
                0-1.504-0.288l-9.984-4q-1.152-0.448-1.824-1.472t-0.704-2.24zM4 23.008l10.016 
                4v-17.984l-10.016-4v17.984zM6.016 21.824v-2.016l5.984 2.4v2.016zM6.016 17.824v-2.016l5.984
                2.4v2.016zM6.016 13.824v-2.016l5.984 2.4v2.016zM6.016 9.824v-2.016l5.984 2.4v2.016zM18.016 
                27.008l9.984-4v-17.984l-9.984 4v17.984zM20 24.224v-2.016l6.016-2.4v2.016zM20 
                20.224v-2.016l6.016-2.4v2.016zM20 16.224v-2.016l6.016-2.4v2.016zM20 12.224v-2.016l6.016-2.4v2.016z"/>
        </svg>
        Read
    </button>
    
    <button class="update-btn" onclick="onOpenEditModal('${book.id}')">
        <svg xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            fill="currentColor" 
            class="bi bi-pencil-square" 
            viewBox="0 0 16 16">
            
            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75
                2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 
                0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
        </svg>
        Update
    </button>
    
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

function readQueryParams() {
    const queryParams = new URLSearchParams(window.location.search)

    if (queryParams.get('title')) {
        const title = queryParams.get('title')
        gQueryOptions.filterBy.title = title
    }
    if (queryParams.get('minRating')) {
        const minRating = queryParams.get('minRating')
        gQueryOptions.filterBy.minRating = minRating
    }
    if (queryParams.get('sortField')) {
        const sortField = queryParams.get('sortField')
        const sortDir = queryParams.get('sortDir')

        gQueryOptions.sortBy = {
            sortField,
            sortDir
        }
    }
    renderQueryParams()
}

function renderQueryParams() {
    document.querySelector('.filter-by-title').value = gQueryOptions.filterBy.title
    document.querySelector('.filter-by-rating').value = gQueryOptions.filterBy.minRating

    if (gQueryOptions.sortBy.sortField) {
        document.querySelector('.sort-by select').value = gQueryOptions.sortBy.sortField
        document.querySelector(`input.sort-${gQueryOptions.sortBy.sortDir === 1 ? 'ascend' : 'descend'}`).checked = true
    }

    document.querySelector('.pagination-state').innerText = gQueryOptions.page.idx + 1

}

function setQueryParams() {
    const queryParams = new URLSearchParams()

    if (gQueryOptions.filterBy.title) {
        queryParams.set('title', gQueryOptions.filterBy.title)
    }

    if (gQueryOptions.sortBy.sortField) {
        queryParams.set('sortField', gQueryOptions.sortBy.sortField)
        queryParams.set('sortDir', gQueryOptions.sortBy.sortDir)
    }

    if (gQueryOptions.filterBy.minRating) {
        queryParams.set('minRating', gQueryOptions.filterBy.minRating)
    }

    queryParams.set('page', gQueryOptions.page.idx + 1)

    const newUrl =
        window.location.protocol + "//" +
        window.location.host +
        window.location.pathname + '?' + queryParams.toString()

    window.history.pushState({ path: newUrl }, '', newUrl)
}

function onNextPage() {
    gQueryOptions.page.idx++

    if (gQueryOptions.page.idx > getLastPage(gQueryOptions)) {
        gQueryOptions.page.idx = 0
    }

    setQueryParams()
    renderQueryParams()
    renderBooks()
}

function onPrevPage() {
    gQueryOptions.page.idx--

    if (gQueryOptions.page.idx < 0) {
        gQueryOptions.page.idx = getLastPage(gQueryOptions)
    }

    setQueryParams()
    renderQueryParams()
    renderBooks()
}