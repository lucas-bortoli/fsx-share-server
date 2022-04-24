import express from 'express'
import fetch from 'node-fetch'
import { readFile } from 'fs/promises'
import * as Utils from './utils.js'
import { download, fetchEntryData } from './fs.js'
import path from 'path'

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

app.use('/css/', express.static(path.resolve('./public/css/')))
app.use('/js/', express.static(path.resolve('./public/js/')))
app.use('/assets/', express.static(path.resolve('./public/assets/')))

app.get('/:ptr', async (req, res) => {
    const html = await readFile('./public/index.html')

    try {
        if (!req.params.ptr)
            throw new Error('No link provided')

        const entryAttachmentLink = Utils.DecodeURLPointer(req.params.ptr)

        // get entry
        const entry = await fetchEntryData(entryAttachmentLink)

        // send index.html with file information
        res.setHeader('Content-Type', 'text/html')
        res.send(html +
        `
        <script>
            try {
                window.downloadInfo = ${JSON.stringify(entry)}
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

    await download(req, res)
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