import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth, onAuthStateChanged } from 'firebase/auth'
import { get, getDatabase, onValue, push, ref, remove, set, update } from 'firebase/database'
import { alertNoUser, alertUserNotConnected, closeModal, openModal } from './AlertsAndModal'
import { userSignIn, userSignOut } from './AuthUser'
import { firebaseConfig } from './firebaseConfig'

// Initialize Firebase
const app = initializeApp(firebaseConfig)

//to signIn/signOut user's Google account
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()

const signInBtn = document.querySelector('.signIn-btn')
const userProfile = document.querySelector('.user-profile')
const signOutBtn = document.querySelector('.signOut-btn')
const messageNoBooks = document.querySelector('.messageNoBooks')

messageNoBooks.style.display = 'none'
signOutBtn.style.display = 'none'
userProfile.style.display = 'none'

signInBtn.addEventListener('click', userSignIn)
signOutBtn.addEventListener('click', userSignOut)

//to start the DATABASE
export const db = getDatabase(app)

//modalAddBook and booksGrid
export const modalAddBook = document.querySelector('.modal-addBook')
const addBookForm = document.querySelector('#addBookForm')
export const errorFormMsg = document.querySelector('#errorModal-msg')
const booksGrid = document.querySelector('.books-grid')

alertUserNotConnected.style.display = 'none'
modalAddBook.style.display = 'none'
errorFormMsg.style.display = 'none'
booksGrid.style.display = 'none'

//to filter the books list
const filterBtns = document.querySelector('.buttons-filter')
const filterAllBooks = document.querySelector('.filter-all-books')
const filterBooksRead = document.querySelector('.filter-booksRead')
const filterBooksNotRead = document.querySelector('.filter-booksNotRead')

filterBtns.style.display = 'none'

// to create the reading progress info
const totalBooks = document.getElementById('total-books')
const booksRead = document.getElementById('books-read')
const pagesRead = document.getElementById('pages-read')
const booksUnread = document.getElementById('books-unread')

//checks the status of the user
onAuthStateChanged(auth, (user) => {
    if (user) {     
        //User's name and image profile
        userProfile.style.display = 'flex'
        signOutBtn.style.display = 'block'
        signInBtn.style.display = 'none'

        let imgData = document.querySelector('#user-img')
        let nameData = document.querySelector('#user-name')
        if (imgData !== null) {
            imgData.remove()
        }
        if (nameData !== null) {
            nameData.remove()
        }

        const userImg = document.createElement('img')
        userImg.id = 'user-img'
        userImg.src = user.photoURL
        userImg.alt = 'user-img'
        
        const userName = document.createElement('p')
        userName.id = 'user-name'
        const fullName = user.displayName
        const firstName = fullName.split(' ')[0]
        userName.innerHTML = firstName

        userProfile.appendChild(userImg)
        userProfile.appendChild(userName)
        
        //to create the DB
        const userID = user.uid
        const bookLists = ref(db, `BookLists/Users/${userID}/books`)
        
        openModal()
        closeModal()

        //to get DB ref of the current User
        const currentUser = auth.currentUser
        const currentUserID =  currentUser.uid            
        const booksListRef = ref(db, `BookLists/Users/${currentUserID}/books/`) //current User's book list in the DB

        //to get book values from the form
        addBookForm.addEventListener("submit", async function(e) {
            e.preventDefault()

            //Inputs Form Values
            const title = document.getElementById("title").value
            const author = document.getElementById("author").value
            const pages = parseInt(document.getElementById("pages").value)
            const isRead = document.getElementById("isRead").checked
            
            const booksSnapshot = await get(booksListRef)
            
            const titlesSet = new Set() //to store book titles 
            booksSnapshot.forEach((book) => {
                const bookData = book.val() //gets the book data from the snapshot
                titlesSet.add(bookData.title.toLowerCase()) //adds the title of the book to the set
            })

            const titlesArray = Array.from(titlesSet) //converts the titlesSet into an array
            
            if (titlesArray.includes(title.toLowerCase())) {
                errorFormMsg.style.display = 'block'
            } else {
                if (title && author && pages) { //check that the values in the new book are valid
                    addBookToDB(title, author, pages, isRead)
                    clearForm()
                    errorFormMsg.style.display = 'none'
                    modalAddBook.style.display = 'none'
                }
            }
        })
        
        //to add a book to the DB
        function addBookToDB(title, author, pages, isRead) {
            const newBook = push(booksListRef)

            set(newBook, {
                title: title,
                author: author,
                pages: pages,
                isRead: isRead,
                userID: currentUserID
            })
        }

        let currentFilter = undefined //No filter initially

        //to display the bookList that correspond to each user
        function displayBooks() {
            onValue(bookLists, (snapshot) => {
                //books Data from the DB
                const data = snapshot.val()
                
                //to control whether or not Data are present in the DB
                if (!data || Object.keys(data).length === 0) {
                    messageNoBooks.style.display = 'block'
                    filterBtns.style.display = 'none'
                    booksGrid.innerHTML = ''
                    booksGrid.style.display = 'none'
                    return
                } else {
                    filterBtns.style.display = 'flex'
                    booksGrid.style.display = 'grid'
                    messageNoBooks.style.display = 'none'
                }

                //to create a bookItem for each Data(book)
                booksGrid.innerHTML = ""
                const bookIds = Object.keys(data) //to tranform the bookIds into an object
        
                bookIds.forEach((bookId) => {
                    const book = data[bookId]
        
                    if (book.userID === userID) {
                        //only applies if there's a current filter
                        if (currentFilter === undefined || book.isRead === currentFilter) {
                            const bookItem = createBookItem(bookId, book);
                            booksGrid.appendChild(bookItem);
                        }
                    }  
                })
            })
        }

        function createBookItem(bookId, book) {
            const bookItem = document.createElement("div");
            bookItem.classList.add("book-card");
        
            const bTitle = document.createElement("p");
            bTitle.id = 'bTitle';
            bTitle.textContent = book.title;
        
            const bAuthor = document.createElement("p");
            bAuthor.id = 'bAuthor';
            bAuthor.textContent = book.author;
        
            const bPages = document.createElement("p");
            bPages.id = 'bPages';
            bPages.textContent = book.pages + " " + 'pages';
        
            const divBtnsCB = document.createElement("div");
            divBtnsCB.classList.add("buttons-cardBook");
        
            const isReadBtn = document.createElement("button");
            isReadBtn.id = 'isReadBtn';
            isReadBtn.textContent = book.isRead ? "Read" : "Not Read";
            isReadBtn.classList.add(book.isRead ? 'read' : 'not-read');
            isReadBtn.addEventListener("click", () => {
                updateReadStatus(bookId, !book.isRead);
            });
        
            const removeBtn = document.createElement("button");
            removeBtn.id = 'removeBook';
            removeBtn.textContent = "Remove";
            removeBtn.addEventListener("click", () => {
                removeBook(bookId);
            });
        
            divBtnsCB.appendChild(isReadBtn);
            divBtnsCB.appendChild(removeBtn);
        
            bookItem.appendChild(bTitle);
            bookItem.appendChild(bAuthor);
            bookItem.appendChild(bPages);
            bookItem.appendChild(divBtnsCB);
        
            return bookItem;
        }
        
        //update the read Status of the book
        function updateReadStatus(bookId, newStatus) {
            const bookRef = ref(db, `BookLists/Users/${currentUserID}/books/${bookId}`)
            update(bookRef, { isRead: newStatus })
            .then(() => {
                displayBooks()
            }).catch((error) => {
                console.error("Error updating isRead status:", error)
            });
        }

        //remove a book from the DB and booksGrid
        function removeBook(bookId) {
            const bookRef = ref(db, `BookLists/Users/${currentUserID}/books/${bookId}`)
            remove(bookRef)
            .then(() => {
                console.log("Book removed from database successfully!")
                displayBooks();
            }).catch((error) => {
                console.error("Error removing book from database:", error)
            });
        }

        filterAllBooks.addEventListener('click', () => {
            currentFilter = undefined; // No filter, display all books
            displayBooks();
        });
        filterBooksRead.addEventListener('click', () => {
            currentFilter = true; //display all books Read
            displayBooks();
        });
        filterBooksNotRead.addEventListener('click', () => {
            currentFilter = false; //display all books Not read
            displayBooks();
        });

        //to display/update the ReadingProgress of the current User
        function updateReadingProgress() {
            onValue(bookLists, (snapshot) => {
                const data = snapshot.val()

                // No books available
                if (!data || Object.keys(data).length === 0) {
                    zeroValuesOnTheRP()
                    return
                }

                let totalBooksCount = 0
                let booksReadCount = 0
                let pagesReadCount = 0
                let booksUnreadCount = 0

                const bookIds = Object.keys(data)
                bookIds.forEach((bookId) => {
                    const book = data[bookId] //to get the list of books in the DB

                    if (book.userID === userID) { //check whether the book belongs to the current user
                        totalBooksCount++ //total number of BOOKS is counted

                        if (book.isRead) {
                            booksReadCount++ //total number of books READ is counted
                            pagesReadCount += book.pages //total number of books PAGES is counted
                        } else {
                            booksUnreadCount++ //total number of books UNREAD is counted
                        }
                    }
                })

                // Update text content when it's changed
                totalBooks.textContent = totalBooksCount.toString()
                booksRead.textContent = booksReadCount.toString()
                pagesRead.textContent = pagesReadCount.toString()
                booksUnread.textContent = booksUnreadCount.toString()
            })
        }

        displayBooks()
        updateReadingProgress()
    } else {
        userProfile.style.display = 'none'
        signOutBtn.style.display = 'none'
        signInBtn.style.display = 'flex'
        
        alertNoUser()
        messageNoBooks.style.display = 'block'
        booksGrid.innerHTML = ''
        booksGrid.style.display = 'none'
    }
})

// to clear the Form
export function clearForm() {
    document.getElementById("title").value = ""
    document.getElementById("author").value = ""
    document.getElementById("pages").value = ""
    document.getElementById("isRead").checked = false
}

export function zeroValuesOnTheRP() {
    totalBooks.textContent = '0'
    booksRead.textContent = '0'
    pagesRead.textContent = '0'
    booksUnread.textContent = '0'
}

//To add the current year to the copyright
const currentYearElement = document.getElementById('currentYear')
const currentYear = new Date().getFullYear()
currentYearElement.textContent = currentYear