import { Manhwa } from '@/model/Manhwa'
import { create }  from 'zustand'


type DailyManhwaState = {
    manhwa: Manhwa | null
    cover_image_url: string | null
    width: number | null
    height: number | null
    setDailyManhwa: (manhwa: Manhwa, cover_image_url: string, width: number, height: number) => void
}

export const useDailyManhwaState = create<DailyManhwaState>(
    (set) => ({
        manhwa: null,
        cover_image_url: null,
        width: null,
        height: null,
        setDailyManhwa: (manhwa: Manhwa, cover_image_url: string, width: number, height: number) => {
            (set((state) => {return {...state, manhwa, cover_image_url, width, height}}))
        }
    })
)