import * as Express from 'express'
import fetch from 'node-fetch'
import { Writable } from 'stream'
import { Wait } from './utils.js'

export const DownloadAllPieces = async (file_links: string[], res: Express.Response) => {
    const stream = new Writable()

    for (const link of file_links) {
        let downloadDone = false

        while (!downloadDone) {
            try {
                const blob = await fetch(link).then(response => response.blob())

                const buffer = Buffer.from(await blob.arrayBuffer())

                if (res.writable) {
                    res.write(buffer)
                    downloadDone = true
                } else {
                    console.error('Aborting download! Client stream is not writable anymore')
                    return
                }
            } catch(ex) {
                console.error('Download failed -- retrying', link)
                console.error(ex)
                await Wait(1000)
            }
        }
    }

    stream.end()

    return stream
}