import { create }  from 'zustand'
import { Recommendation } from '@/helpers/types'


type ManhwaRandomGridState = {
    recommendations: Recommendation[]
    setRecommendations: (recommendations: Recommendation[]) => void
}


export const useManhwaRecommendationsState = create<ManhwaRandomGridState>(
    (set) => ({
        recommendations: [],
        setRecommendations: (recommendations: Recommendation[]) => {
            (set((state) => {return {...state, recommendations}}))
        }
    })
)