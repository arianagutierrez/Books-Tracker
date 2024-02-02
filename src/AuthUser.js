import { signInWithPopup, signOut } from 'firebase/auth'
import {auth, provider, zeroValuesOnTheRP } from './index'

const filterOptions = document.querySelector('.buttons-filter')

//to popup google Authentication window
export const userSignIn = async () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("You have signed in successfully!")
            const user = result.user
            return user
        }).catch((error) => {
            const errorCode = error.code
            console.log(errorCode)
            const errorMessage = error.message
            console.log(errorMessage)
        })
}

//to sign out the user
export const userSignOut = async () => {
    signOut(auth).then(() => {
        console.log("You have signed out successfully!")
        zeroValuesOnTheRP()
        filterOptions.style.display = 'none'
    }).catch((error) => {
        const errorCode = error.code
        console.log(errorCode)
        const errorMessage = error.message
        console.log(errorMessage)
    })
}