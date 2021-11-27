import express from 'express'
import fetch from 'node-fetch'
import { IFile } from './types'
import { DownloadAllPieces } from './download.js'
const app = express()

/**
 * Error handler
 * @param {number} code HTTP error code
 * @param {string} msg Error message
 * @param {express.Response} res Response object
 */
const error = (code, msg, res) => {
    res.statusCode = code
    res.send({
        'error': msg || 'Unknown error'
    })
    res.end()
}

app.get('/dl/:ptr', async (req, res) => {
    if (!req.params.ptr)
        return error(400, 'Missing file pointer', res)

    const ptr = ('x.' + req.params.ptr).split('').map(x => x === '.' ? '/' : x).reverse().join('')
    const link = 'https://cdn.discordapp.com/attachments/' + ptr

    // can't use response.json() directly (see following)
    const base64_entry = await fetch(link).then(r => r.text())

    // convert base64-encoded text to plain text
    const asString = Buffer.from(base64_entry, 'base64').toString('utf-8')

    // parse entry
    const fileEntry: IFile = JSON.parse(asString)

    res.header('Content-Length', fileEntry.size.toString())
    res.attachment(fileEntry.name)

    DownloadAllPieces(
        fileEntry.pieces.map(piece => 'https://cdn.discordapp.com/attachments/' + piece),
        res)
})

app.listen(process.env.PORT || 8000, () => {
    console.log(`Listening on port ${process.env.PORT || 8000}`)
})