import { Chapter } from '@/helpers/types';
import { Manhwa } from '@/helpers/types'


export type ReadingState = {
    manhwa: Manhwa
    chapterMap: Map<number, Chapter>
}


export type ReadingStack = {
    top: number
    readingStateMap: Map<number, ReadingState>
}