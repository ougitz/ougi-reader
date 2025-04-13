import { useLastUpdateManhwasState } from '@/store/lastUpdateManhwasStore'
import ManhwaHorizontalGrid from './ManhwaHorizontalGrid'
import { dbSortManhwasByLastUpdate } from '@/database/db'
import React, { useCallback, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { router } from 'expo-router'


const ManhwasLastUpdateGrid = () => {
    
    const { manhwas, setManhwas } = useLastUpdateManhwasState()

    const init = async () => {
        if (manhwas.length == 0) {
            await dbSortManhwasByLastUpdate()
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
        router.navigate("/(pages)/LastUpdate")
    }

    return (
        <ManhwaHorizontalGrid 
            title='Last Updates 🔥' 
            manhwas={manhwas.slice(0, 30)}
            onPress={onPress}/>
    )
}

export default ManhwasLastUpdateGrid;

const styles = StyleSheet.create({})