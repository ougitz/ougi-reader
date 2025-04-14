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
    width: number
    height: number
    cover_image_url: string
}

export type ChapterImage = {
    image_url: string
    width: number
    height: number
}


export type ManhwaGenre = {
    manhwa_id: number
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
}