import { Manhwa } from '@/model/Manhwa'
import { create }  from 'zustand'


type MostViewManhwasState = {
    manhwas: Manhwa[]
    setManhwas: (manhwas: Manhwa[]) => void
    appendManwas: (manhwas: Manhwa[]) => void
}


export const useMostViewManhwasState = create<MostViewManhwasState>(
    (set) => ({
        manhwas: [],        
        setManhwas: (manhwas: Manhwa[]) => {
            (set((state) => {return {...state, manhwas}}))
        },
        appendManwas: (manhwas: Manhwa[]) => {
            (set((state) => {return {...state, manhwas: [...state.manhwas, ...manhwas]}}))
        }
    })
)