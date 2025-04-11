import { Chapter } from "./Chapter"


export type Manhwa = {
    manhwa_id: number
    title: string
    descr: string
    cover_image_url: string
    status: "OnGoing" | "Completed"
    color: string
    updated_at: string
    views: number
    rating: number | null
    genres: string[]
    titles: string[]
    authors: {name: string, role: string, author_id: number}[]
    chapters: Chapter[] | null
}