import { clearForm, errorFormMsg, modalAddBook } from "./index"

const addBookBtn = document.querySelector('#addBook-btn')
export const alertUserNotConnected = document.querySelector('.alert-addBtn')
const closeAlertAB = document.querySelector('.close-alertMsg')
const cancelBtnForm = document.querySelector('.cancel-btn')

//alert AddBtn when user needs to connect to create a books list
export function alertNoUser() {
    addBookBtn.addEventListener('click', () => {
        alertUserNotConnected.style.display = 'flex'
        modalAddBook.style.display = 'none'
        
        closeAlertAB.addEventListener('click', () => {
            alertUserNotConnected.style.display = 'none'
        })
    })
}

export function openModal() {
    addBookBtn.addEventListener('click', () => {
        alertUserNotConnected.style.display = 'none'
        modalAddBook.style.display = 'flex'
    })
}

export function closeModal() {
    cancelBtnForm.addEventListener('click', (e) => {
        e.preventDefault()
        clearForm()
        errorFormMsg.style.display = 'none'
        modalAddBook.style.display = 'none'
    })
}