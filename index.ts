import express from 'express'
import fetch from 'node-fetch'
import { readFile } from 'fs/promises'
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

app.get('/', async (req, res) => {
    console.log('Ping')
    res.sendStatus(200)
})

app.get('/:ptr', async (req, res) => {
    const html = await readFile('./index.html')

    try {
        if (!req.params.ptr)
            throw new Error('No link provided')

        const ptr = ('x.' + req.params.ptr).split('').map(x => x === '.' ? '/' : x).reverse().join('')
        const link = 'https://cdn.discordapp.com/attachments/' + ptr

        // get entry
        const entry = await fetch(link).then(r => r.text())

        // parse entry
        const fileEntry: IFile = JSON.parse(entry)

        // send index.html with file information
        res.setHeader('Content-Type', 'text/html')
        res.send(html +
        `
        <script>
            try {
                window.downloadInfo = ${JSON.stringify(fileEntry)}
            } catch(z) {}
        </script>
        `)
    } catch(ex) {
        console.error(ex)

        // send index.html without file information
        res.setHeader('Content-Type', 'text/html')
        res.send(html)
    }
})

app.get('/:ptr/dl', async (req, res) => {
    if (!req.params.ptr)
        return error(400, 'Missing file pointer', res)

    const ptr = ('x.' + req.params.ptr).split('').map(x => x === '.' ? '/' : x).reverse().join('')
    const link = 'https://cdn.discordapp.com/attachments/' + ptr

    // get entry
    const entry = await fetch(link).then(r => r.text())

    // parse entry
    const fileEntry: IFile = JSON.parse(entry)

    res.header('Content-Length', fileEntry.size.toString())
    res.attachment(fileEntry.name)

    DownloadAllPieces(
        fileEntry.pieces.map(piece => 'https://cdn.discordapp.com/attachments/' + piece),
        res)
})

app.listen(process.env.PORT || 8000, () => {
    console.log(`Listening on port ${process.env.PORT || 8000}`)

    // check if is running on Glitch
    if (process.env.PROJECT_DOMAIN) {
        setInterval(() => {
            fetch(`https://${process.env.PROJECT_DOMAIN}.glitch.me/`)
        }, 280000)
    }
})