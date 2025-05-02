import { useMostViewManhwasState } from '@/store/mostViewManhwasStore'
import ManhwaHorizontalGrid from './ManhwaHorizontalGrid'
import React, { useCallback, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { spFetchMostViewManhwas } from '@/lib/supabase'


const MostViewedManhwasComponent = () => {
    
    const { manhwas, setManhwas } = useMostViewManhwasState()

    const init = useCallback(async () => {
        if (manhwas.length == 0) {
            await spFetchMostViewManhwas()
                .then(values => setManhwas(values))
        }
    }, [])

    useEffect(
        () => {
            init()
        },
        []
    )

    const onPress = () => {
        router.navigate("/(pages)/MostView")
    }

    return (
        <ManhwaHorizontalGrid 
            title='Most Views ⚡' 
            manhwas={manhwas.slice(0, 30)}
            onPress={onPress}/>
    )
}

export default MostViewedManhwasComponent;

const styles = StyleSheet.create({})