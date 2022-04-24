import Filesystem, { File } from "@lucas-bortoli/libdiscord-fs"
import fetch from "node-fetch"
import * as Express from "express"
import * as Utils from './utils.js'
import { FetchedEntry } from "./types.js"
import archiver from "archiver"

const fetchEntryData = async (entryAttachmentURL: string): Promise<FetchedEntry> => {
    const entryAsArrayBuffer = await fetch(entryAttachmentURL).then(r => r.arrayBuffer())
    const jsonAsText = new TextDecoder('utf-8').decode(entryAsArrayBuffer)
    const json = JSON.parse(jsonAsText)

    return json
}

const openFileSystem = async () => {
    // Empty webhook URL, since we won't be writing anything to the server.
    const fsx: Filesystem = new Filesystem('@empty');

    return fsx
}

const download = async (req: Express.Request, res: Express.Response) => {
    const entryAttachmentLink = Utils.DecodeURLPointer(req.params.ptr)
    const fsx = await openFileSystem()
    
    const fetchedEntry = await fetchEntryData(entryAttachmentLink)

    // If it's a single file, then it's straightforward: just pipe it to the response.
    // If it's a directory or it has more than one top-level item, we have to create a .zip file first.
    if (fetchedEntry.rootItems.length === 1 && fetchedEntry.rootItems[0].type === 'file') {
        fsx.setEntry('/download', fetchedEntry.rootItems[0])

        const stream = await fsx.createReadStream('/download')

        res.header('Content-Length', fetchedEntry.rootItems[0].size.toString())
        res.header('Content-Type', 'application/octet-stream')
        res.header('Content-Disposition', 'attachment; filename=' + fetchedEntry.rootItems[0].name)

        stream.pipe(res)
    } else {
        // Add all files to filesystem
        for (const entry of fetchedEntry.rootItems) {
            fsx.setEntry(`/${entry.name}`, entry)
        }

        let zipFileName = fetchedEntry.metadata?.name || `Unnamed_${Date.now().toString(36)}.zip`

        // Set client headers (no Content-Length; we don't know the archive size ahead of time)
        res.header('Content-Type', 'application/octet-stream')
        res.header('Content-Disposition', `attachment; filename=${zipFileName.endsWith('.zip') ? zipFileName : zipFileName + '.zip'}`)

        // Create a zip archive   
        const zip = archiver('zip')

        // Cancel on errors
        //zip.on('error', err => { throw err })

        // Send it to the client
        zip.pipe(res)

        // Iterate over all files in the filesystem
        await fsx.walkDirectory(fsx.root, async (file: File, filePath: string) => {
            console.log(`Appending file ${filePath} to the archive`)
            const downloadStream = await fsx.createReadStream(filePath)

            // Add this file to the archive
            zip.append(downloadStream, { name: filePath })

            await new Promise<void>(resolve => {
                downloadStream.once('end', () => resolve())
            })
        })

        zip.finalize()
    }
}

export { openFileSystem, fetchEntryData, download }