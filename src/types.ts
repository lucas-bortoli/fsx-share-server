import { Entry } from "@lucas-bortoli/libdiscord-fs"

export type FetchedEntry = {
    metadata?: {
        name: string,
        description: string
    },
    rootItems: ({ name: string } & Entry)[]
}