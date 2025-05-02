import { ArrayStack } from '@/helpers/Stack'
import { Manhwa } from '@/model/Manhwa'
import { create }  from 'zustand'


type ManhwaStackState = {
    manhwaStack: ArrayStack<Manhwa>
    manhwaStackPush: (manhwa: Manhwa) => void
    manhwaStackPop: () => void
    manhwaStackTop: Manhwa | null
}


export const useManhwaStackState = create<ManhwaStackState>(
    (set) => ({
        manhwaStack: new ArrayStack<Manhwa>(),
        manhwaStackTop: null,
        manhwaStackPush: (manhwa: Manhwa) => {
            (set((state) => {
                const n = state.manhwaStack.copy()
                n.push(manhwa)
                return {...state, manhwaStack: n, manhwaStackTop: manhwa}
            }))
        },
        manhwaStackPop: () => {
            (set((state) => {
                const n = state.manhwaStack.copy()
                n.pop()
                return {
                    ...state, 
                    manhwaStack: n,
                    manhwaStackTop: n.isEmpty() ? null : n.peek()
                }
            }))
        }        
    })
)