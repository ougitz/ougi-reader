import { Chapter } from "@/model/Chapter"
import { Manhwa } from "@/model/Manhwa"
import { create } from "zustand"


export type ReadingState = {
    manhwa: Manhwa | null
    setManhwa: (manhwa: Manhwa) => void
    chapterMap: Map<number, Chapter>
    chapterNum: number | null
    currentChapter: Chapter | null
    setChapterMap: (chapterList: Chapter[]) => void    
    setChapterNum: (newChapterIndex: number) => void
    moveToNextChapter: () => void
    moveToPreviousChapter: () => void
    clearReadingState: () => void
}


export const useReadingState = create<ReadingState>(
    (set) => ({
        manhwa: null,
        chapterMap: new Map<number, Chapter>,
        chapterNum: null,
        currentChapter: null,
        setManhwa: (manhwa: Manhwa) => {set((state) => {            
            return {...state, manhwa}
        })},
        setChapterMap: (chapterList: Chapter[]) => {set((state) => {
            const newChapterMap = new Map()
            chapterList.forEach(item => newChapterMap.set(item.chapter_num, item))
            return {...state, chapterMap: newChapterMap}
        })
        },
        setChapterNum: (newChapterNum: number) => {set((state) => {
            if (state.chapterMap.has(newChapterNum)) {
                return {...state, chapterNum: newChapterNum, currentChapter: state.chapterMap.get(newChapterNum)}
            }            
            return state
        })},
        moveToNextChapter: () => {set((state) => {
            if (state.chapterNum && state.chapterMap.has(state.chapterNum + 1)) {
                return {
                    ...state, 
                    chapterNum: state.chapterNum + 1, 
                    currentChapter: state.chapterMap.get(state.chapterNum + 1)
                }
            }
            return state
        })},
        moveToPreviousChapter: () => {set((state) => {
            if (state.chapterNum && state.chapterMap.has(state.chapterNum - 1)) {
                return {
                    ...state,
                    chapterNum: state.chapterNum - 1,
                    currentChapter: state.chapterMap.get(state.chapterNum - 1)
                }
            }
            return state
        })},
        clearReadingState: () => {set((state) => {
            return {
                ...state,
                manhwa: null,
                chapterMap: new Map(),
                chapterIndex: null,
                currentChapter: null,
            }
        })}
    })
)