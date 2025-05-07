import { useManhwaRecommendationsState } from '@/store/manhwaRecommendationStores'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { spFetchManhwaRecommendations } from '@/lib/supabase'
import React, { useCallback, useEffect } from 'react'
import ManhwaRecommendation from './DailyManhwa'
import { AppStyle } from '@/styles/AppStyles'
import RotatingButton from './RotatingButton'
import { debounce } from 'lodash'


const MangaRecommendationGrid = () => {

    const { recommendations, setRecommendations } = useManhwaRecommendationsState()
    
    const init = useCallback(async () => {
        if (recommendations.length > 0) { return }
        await spFetchManhwaRecommendations()
            .then(values => setRecommendations([...values]))
    }, [])


    const reload = async () => {
        await spFetchManhwaRecommendations()
            .then(values => setRecommendations([...values]))
    }

    const debounceReload = useCallback(
        debounce(reload, 1500),
        []
    )

    useEffect(
        () => {init()},
        []
    )

    return (
        <View style={{gap: 20}} >
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}} >
                <Text style={[AppStyle.textHeader, {fontSize: 24}]}>Random</Text>
                <RotatingButton onPress={debounceReload} duration={800} />
            </View>
            <FlatList
                showsVerticalScrollIndicator={false}
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