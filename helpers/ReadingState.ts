import { Chapter } from "@/model/Chapter"
import { Manhwa } from "@/model/Manhwa"


export type ReadingState = {
    manhwa: Manhwa
    chapterMap: Map<number, Chapter>
}


export type ReadingStack = {
    top: number
    readingStateMap: Map<number, ReadingState>
}