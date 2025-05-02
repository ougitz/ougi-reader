import { Genre } from '@/helpers/types'
import { create }  from 'zustand'


type GenreState = {
    genres: Genre[]
    setGenres: (genres: Genre[]) => void    
}


export const useGenreState = create<GenreState>(
    (set) => ({
        genres: [],
        setGenres: (genres: Genre[]) => {
            (set((state) => {return {...state, genres}}))
        }    
    })
)