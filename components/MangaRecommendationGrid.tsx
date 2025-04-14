import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect } from 'react'
import { useManhwaRecommendationsState } from '@/store/manhwaRecommendationsStores'
import { dbGetManhwaRecommendations } from '@/database/db'
import { AppStyle } from '@/styles/AppStyles'
import ManhwaRecommendation from './DailyManhwa'

const MangaRecommendationGrid = () => {

    const { recommendations, setRecommendations } = useManhwaRecommendationsState()
    
    const init = async () => {
        if (recommendations.length > 0) { return }
        await dbGetManhwaRecommendations()
            .then(values => setRecommendations([...values]))
    }

    useEffect(
        useCallback(() => {
            init()
        }, []),
        []
    )

    return (
        <View style={{gap: 20}} >
            <Text style={[AppStyle.textHeader, {fontSize: 24}]}>Today's Recommendations</Text>
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