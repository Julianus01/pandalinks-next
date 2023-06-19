async function logPromiseError<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise
  } catch (error) {
    console.log(error)

    return Promise.reject('Error')
  }
}

export const ErrorUtils = {
  logPromiseError,
}
