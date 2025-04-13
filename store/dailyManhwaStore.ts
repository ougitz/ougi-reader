import { Manhwa } from '@/model/Manhwa'
import { create }  from 'zustand'


type DailyManhwaState = {
    manhwa: Manhwa | null
    cover_image_url: string | null
    setDailyManhwa: (manhwa: Manhwa, cover_image_url: string) => void
}

export const useDailyManhwaState = create<DailyManhwaState>(
    (set) => ({
        manhwa: null,
        cover_image_url: null,
        setDailyManhwa: (manhwa: Manhwa, cover_image_url: string) => {
            (set((state) => {return {...state, manhwa, cover_image_url}}))
        }
    })
)