import { useManhwaRecommendationsState } from '@/store/manhwaRecommendationsStores'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect } from 'react'
import ManhwaRecommendation from './DailyManhwa'
import { AppStyle } from '@/styles/AppStyles'
import { spFetchManhwaRecommendations } from '@/lib/supabase'


const MangaRecommendationGrid = () => {

    const { recommendations, setRecommendations } = useManhwaRecommendationsState()
    
    const init = useCallback(async () => {
        if (recommendations.length > 0) { return }
        await spFetchManhwaRecommendations()
            .then(values => setRecommendations([...values]))
    }, [])

    useEffect(
        () => {init()},
        []
    )

    return (
        <View style={{gap: 20}} >
            <Text style={[AppStyle.textHeader, {fontSize: 24}]}>Recommendations</Text>
            <FlatList
                data={recommendations}
                horizontal={true}
                initialNumToRender={2}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => <ManhwaRecommendation recommendation={item} />}
            />
        </View> 
    )
}

export default MangaRecommendationGrid

const styles = StyleSheet.create({})