import { useMostViewManhwasState } from '@/store/mostViewManhwasStore'
import ManhwaHorizontalGrid from './ManhwaHorizontalGrid'
import React, { useCallback, useEffect } from 'react'
import { dbSortManhwasByViews } from '@/database/db'
import { StyleSheet } from 'react-native'
import { router } from 'expo-router'


const MostViewedManhwasComponent = () => {
    
    const { manhwas, setManhwas } = useMostViewManhwasState()

    const init = async () => {
        if (manhwas.length == 0) {
            await dbSortManhwasByViews()
                .then(values => setManhwas([...values]))
        }
    }

    useEffect(
        useCallback(() => {            
            init()
        }, []),
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