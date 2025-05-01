import { create }  from 'zustand'
import { ManhwaAuthor } from '@/helpers/types'


type ManhwaAuthorState = {
    manhwaAuthorMap: Map<number, ManhwaAuthor[]>
    addAuthor: (manhwa_id: number, authors: ManhwaAuthor[]) => void
}


export const useManhwaAuthorState = create<ManhwaAuthorState>(
    (set) => ({
        manhwaAuthorMap: new Map(),
        addAuthor: (manhwa_id: number, authors: ManhwaAuthor[]) => {            
            (set((state) => {
                const n = new Map(state.manhwaAuthorMap)
                n.set(manhwa_id, authors)
                return {...state, manhwaAuthorMap: n}}
            ))
        }        
    })
)