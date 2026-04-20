'use strict'
var gFilterBy = ''
var gSuccessMsgTimeout
var gIsEditMode = false
var gCurrBookId = null
var gFilteredBooks
var gRating
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
            const elTableContainer = document.querySelector('.table-view')
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
    document.querySelector('.table-view').style.display = 'table-row-group'
    document.querySelector('.list-view').style.display = 'none'
    document.querySelector('.grid-view').style.display = 'none'

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

function renderGridBooks(elTableContainer) {
    document.querySelector('.table-view').style.display = 'none'
    document.querySelector('.list-view').style.display = 'none'
    
    elTableContainer.style.display = 'grid'
    
    var tableStrHTML = ''
    elTableContainer.classList.add('grid-view')
    tableStrHTML += gFilteredBooks.map(book => {
        return `
        <div class="book-card">
        ${getBookHeaderHTML(book)}
        <img src="${book.imgUrl}" class="book-cover">
        <div class="book-price">Price: $${book.price} </div>
        ${getActionBtnsHTML(book)}
        </div>`}).join('')
        
        elTableContainer.innerHTML = tableStrHTML
        const elRatingChips = elTableContainer.querySelectorAll('.rating-chip')
        elRatingChips.forEach((elRatingChip, idx) => {
            renderRatingChipStyle(elRatingChip, idx)
            elRatingChip.style.margin = 0
        }
    )
    
}

function renderBookList(elTableContainer) {
    document.querySelector('.table-view').style.display = 'none'
    document.querySelector('.grid-view').style.display = 'none'
    elTableContainer.style.display = 'flex'

    var tableStrHTML = gFilteredBooks.map(book => {
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

function onOpenEditModal(bookId) {
    const elEditModal = document.querySelector('.book-edit-modal')
    const elBookCover = elEditModal.querySelector('.book-cover')

    if (bookId) {
        gCurrBookId = bookId
        const book = getBookById(bookId)
        elEditModal.querySelector('.title-input').value = book.title
        elEditModal.querySelector('.price-input').value = book.price
        elBookCover.innerHTML = `<img class="book-cover" src="${book.imgUrl}" alt=""></img>`
    } else {
        elBookCover.innerHTML = `
        <label for="book-cover">
        <svg class="upload-cover-icon" xmlns="http://www.w3.org/2000/svg"  fill="currentColor" class="bi bi-upload"
        viewBox="0 0 16 16">
        <path
        d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
        <path
        d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z" />
        </svg>
        Upload a book cover image 
        </label>
        <input type="file" id="book-cover" />
        `

        const elBookCoverInput = elBookCover.querySelector('input')
        elBookCoverInput.style.opacity = 0

    }
    elEditModal.showModal()
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

function onAddBook(elForm, ev) {
    console.log(elForm)
    const bookTitle = elForm.querySelector('.title-input').value
    const bookPrice = +elForm.querySelector('.price-input').value

    if (gCurrBookId) {
        updateBook(gCurrBookId, 'title', bookTitle)
        updateBook(gCurrBookId, 'price', bookPrice)
    } else {
        addBook(bookTitle, bookPrice)
        const bookCoverURL = document.querySelector('.book-cover input').files[0].name
        console.log('bookCoverURL', bookCoverURL)
    }

    gCurrBookId = null
    hideAddBookUI()
    enableActions()
    showSuccessMsg('Book was added successfully!')
    renderBooks()
}

function onCancelAddBook() {
    gCurrBookId = null
    hideAddBookUI()
    enableActions()
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

function hideAddBookUI() {
    const elAddBookForm = document.querySelector('.book-edit-modal')
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
    const elBookCards = document.querySelectorAll('.book-card')
    elBookCards.forEach(bookCard => {
        var currBookId = bookCard.id.substring(5)
        console.log('currBookId', currBookId)

        if (bookCard.id !== `book-${bookId}`) onCollapseCard(bookCard.querySelector('.collapse-card-icon'), currBookId, '.expand-card-icon')
    })
    gCurrBookId = bookId
    const book = getBookById(gCurrBookId)

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
            <button class="update-btn" onclick="onOpenEditModal('${book.id}')">
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