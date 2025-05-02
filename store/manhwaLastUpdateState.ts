import { Manhwa } from '@/model/Manhwa'
import { create }  from 'zustand'


type LastUpdateManhwasState = {
    manhwas: Manhwa[]
    setManhwas: (manhwas: Manhwa[]) => void
    appendManhwas: (manhwas: Manhwa[]) => void
}

export const useLastUpdateManhwasState = create<LastUpdateManhwasState>(
    (set) => ({
        manhwas: [],        
        setManhwas: (manhwas: Manhwa[]) => {
            (set((state) => {return {...state, manhwas}}))
        },
        appendManhwas: (manhwas: Manhwa[]) => {
            (set((state) => {return {...state, manhwas: [...state.manhwas, ...manhwas]}}))
        }
    })
)