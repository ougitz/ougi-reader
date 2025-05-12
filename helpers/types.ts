import { Manhwa } from "@/model/Manhwa"

export type RatingRegister = {
    rating: number
    totalRatings: number
    userRating: number | null
}

export type ManhwaComment = {
    comment_id: number
    parent_comment_id: number | null
    user_id: string
    username: string
    image_url: string | null
    comment: string,
    created_at: string
    thread: ManhwaComment[]
}

export type Recommendation = {
    manhwa: Manhwa,
    image: {
        width: number,
        height: number,
        image_url: number
        image_id: number
    }
}

export type ChapterImage = {
    image_url: string
    width: number
    height: number
}


export type ManhwaGenre = {
    manhwa_id: number
    genre_id: number
    genre: string
}

export type Author = {
    author_id: number
    name: string
    role: string
}

export type ManhwaAuthor = {
    author_id: number
    manhwa_id: number
    role: string
    name: string
}


export type Genre = {
    genre: string
    genre_id: number
}

export type OugiUser = {
    username: string
    user_id: string
    image: {
        image_id: number,
        width: number,
        height: number,
        image_url: string
    } | null
}


export type ChapterReadLog = {
  chapters: Set<number>,
  cover_image_url: string,
  manhwa_id: number,
  title: string,
  last_readed_at: Date
  color: string
}


export type DonateMethod = {
    method: string
    value: string
}


export type AppVersion = {
    version: string
    apk_url: string
}