import { Chapter } from '@/model/Chapter'
import { create }  from 'zustand'


type ManhwaChapterState = {
    chapterMap: Map<number, Chapter[]>
    addChapters: (manhwa_id: number, chapters: Chapter[]) => void    
}


export const useManhwaChapterState = create<ManhwaChapterState>(
    (set) => ({
        chapterMap: new Map(),
        addChapters: (manhwa_id: number, chapters: Chapter[]) => {
            (set((state) => {
                const n = new Map(state.chapterMap)
                n.set(manhwa_id, chapters)
                return {...state, chapterMap: n}
            }))
        }    
    })
)