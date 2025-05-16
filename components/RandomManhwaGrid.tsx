import { useManhwaRecommendationsState } from '@/store/manhwaRecommendationState'
import { spFetchManhwaRecommendations } from '@/lib/supabase'
import React, { useCallback, useEffect } from 'react'
import { ManhwaRecommendation } from './ManhwaCardBig'
import RotatingButton from './button/RotatingButton'
import { FlatList, View } from 'react-native'
import { debounce } from 'lodash'
import Title from './text/Title'


const RandomManhwaGrid = () => {

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
        () => {
            init()
        },
        []
    )    

    return (
        <View style={{gap: 20}} >
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}} >
                <Title title='Random' iconName='dice-outline'/>
                <RotatingButton onPress={debounceReload} duration={800} />
            </View>
            <FlatList
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                data={recommendations}
                horizontal={true}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => <ManhwaRecommendation recommendation={item} />}
            />
        </View> 
    )
}


export default RandomManhwaGrid