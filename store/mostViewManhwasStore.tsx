import { Manhwa } from '@/model/Manhwa'
import { create }  from 'zustand'


type MostViewManhwasState = {
    manhwas: Manhwa[]
    setManhwas: (manhwas: Manhwa[]) => void
}

export const useMostViewManhwasState = create<MostViewManhwasState>(
    (set) => ({
        manhwas: [],        
        setManhwas: (manhwas: Manhwa[]) => {
            (set((state) => {return {...state, manhwas}}))
        }
    })
)