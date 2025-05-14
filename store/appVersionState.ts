import { AppVersion } from '@/helpers/types'
import { create }  from 'zustand'


type AppVersionState = {
    localVersion: string | null
    setLocalVersion: (version: string | null) => void
    allVersions: AppVersion[]
    selAllVersions: (allVersions: AppVersion[]) => void
}


export const useAppVersionState = create<AppVersionState>(
    (set) => ({
        localVersion: null,
        setLocalVersion: (localVersion: string | null) => {
            (set((state) => {return {...state, localVersion}}))
        },
        allVersions: [],
        selAllVersions: (allVersions: AppVersion[]) => {
            (set((state) => {return {...state, allVersions: allVersions}}))
        }
    })
)