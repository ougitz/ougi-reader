import { AppVersion, OugiUser } from '@/helpers/types'
import { create }  from 'zustand'


type AppVersionState = {
    appVersion: AppVersion | null
    setAppVersion: (AppVersion: AppVersion | null) => void
}

export const useAppVersionState = create<AppVersionState>(

    (set) => ({
        appVersion: null,
        setAppVersion: (appVersion: AppVersion | null) => {
            (set((state) => {return {...state, appVersion}}))
        }
    })
)