import Filesystem from '@lucas-bortoli/libdiscord-fs'
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
                let blob = await fetch(link).then(response => response.blob())
                let buffer = Buffer.from(await blob.arrayBuffer())

                // release memory
                blob = null
                if (res.writable) {
                    res.write(buffer)

                    // release memory
                    buffer = null
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

export const createArchive = (fs: Filesystem) => {
    
}