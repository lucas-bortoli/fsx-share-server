export interface IFile {
    type: 'file',
    name: string,
    size: number,
    cdate: number,
    pieces: string[],
}

export interface IDirectory {
    type: 'directory',
    name: string,
    cdate: number,
    entries: { [key: string]: FilesystemEntry }
}

export type FilesystemEntry = IFile | IDirectory