import { create }  from 'zustand'
import { Recommendation } from '@/helpers/types'


type ManhwaRecomendationState = {
    recommendations: Recommendation[]
    setRecommendations: (recommendations: Recommendation[]) => void
}


export const useManhwaRecommendationsState = create<ManhwaRecomendationState>(
    (set) => ({
        recommendations: [],
        setRecommendations: (recommendations: Recommendation[]) => {
            (set((state) => {return {...state, recommendations}}))
        }
    })
)