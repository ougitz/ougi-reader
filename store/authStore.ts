import { Session } from '@supabase/supabase-js'
import { create }  from 'zustand'


type AuthState = {
    username: string | null
    session: Session | null
    login: (username: string | null, session: Session | null) => void
    logout: () => void
}

export const useAuthState = create<AuthState>(
    (set) => ({
        username: null,
        session: null,
        login: (username: string | null, session: Session | null) => {
            (set((state) => {return {...state, username, session}}))
        },
        logout: () => {
            set((state) => {return {...state, username: null, session: null}})
        }
    })
)