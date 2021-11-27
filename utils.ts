/**
 * Sleep for a bit
 * @param ms Number of milliseconds to wait
 * @returns after $ms
 */
 export const Wait = (ms: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}