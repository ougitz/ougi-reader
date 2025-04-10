

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