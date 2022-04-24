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

// Attachment URL: https://cdn.discordapp.com/attachments/012345678901234567/012345678901234567/entry
// URL Pointer:    765432109876543210.765432109876543210

export const DecodeURLPointer = (urlPtr: string): string => {
    return 'https://cdn.discordapp.com/attachments/' + urlPtr
        .split('')
        .reverse()
        .join('')
        .replaceAll('.', '/')
        + '/entry'
}

export const EncodeURLPointer = (link: string): string => {
    return link
        .replace('https://cdn.discordapp.com/attachments/', '')
        .replace('/entry', '')
        .replaceAll('/', '.')
        .split('')
        .reverse()
        .join('')
}