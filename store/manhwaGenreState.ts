import { create }  from 'zustand'
import { ManhwaGenre } from '@/helpers/types'


type ManhwaGenreState = {
    manhwaGenresMap: Map<number, ManhwaGenre[]>
    addGenres: (manhwa_id: number, genres: ManhwaGenre[]) => void
}


export const useManhwaGenreState = create<ManhwaGenreState>(
    (set) => ({
        manhwaGenresMap: new Map(),
        addGenres: (manhwa_id: number, genres: ManhwaGenre[]) => {            
            (set((state) => {
                const n = new Map(state.manhwaGenresMap)
                n.set(manhwa_id, genres)
                return {...state, manhwaGenresMap: n}}
            ))
        }        
    })
)