import { create }  from 'zustand'


type AppVersionState = {
    localVersion: string | null
    setLocalVersion: (version: string | null) => void
}


export const useAppVersionState = create<AppVersionState>(

    (set) => ({
        localVersion: null,
        setLocalVersion: (localVersion: string | null) => {
            (set((state) => {return {...state, localVersion}}))
        }
    })
)