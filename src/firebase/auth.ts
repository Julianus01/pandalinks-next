import firebase_app from './firebaseConfig'
import { AuthError, GoogleAuthProvider, getAuth, signInWithPopup, signOut } from 'firebase/auth'

const auth = getAuth(firebase_app)

enum FirebaseAuthErrorCode {
  emailAlreadyExists = 'auth/email-already-exists',
  userNotFound = 'auth/user-not-found',
  wrongPassword = 'auth/wrong-password',
  emailAlreadyInUse = 'auth/email-already-in-use',
}

function authErrorMessage(errorCode: FirebaseAuthErrorCode) {
  switch (errorCode) {
    case FirebaseAuthErrorCode.emailAlreadyExists:
      return `An account with this email already exists`

    case FirebaseAuthErrorCode.userNotFound:
      return `An account with this email address doesn't exist`

    case FirebaseAuthErrorCode.wrongPassword:
      return `Your email or password is incorrect`

    case FirebaseAuthErrorCode.emailAlreadyInUse:
      return `An account with this email already exists`

    default:
      return 'Internal server error'
  }
}

export async function loginWithGoogleCredential() {
  try {
    const provider = new GoogleAuthProvider()

    const userCredential = await signInWithPopup(auth, provider)
    return userCredential
  } catch (err) {
    const error: AuthError = err as AuthError
    authErrorMessage(error.code as FirebaseAuthErrorCode)
    throw new Error(authErrorMessage(error.code as FirebaseAuthErrorCode))
  }
}

export async function logout() {
  try {
    await signOut(auth)
  } catch (err) {
    const error: AuthError = err as AuthError
    throw new Error(authErrorMessage(error.code as FirebaseAuthErrorCode))
  }
}
