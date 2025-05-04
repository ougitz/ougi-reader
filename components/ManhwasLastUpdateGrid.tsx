import React, { useCallback, useEffect, useState } from 'react'
import { dbReadManhwasOrderedByUpdateAt } from '@/lib/database'
import ManhwaHorizontalGrid from './ManhwaHorizontalGrid'
import { StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Manhwa } from '@/model/Manhwa'


const ManhwasLastUpdateGrid = () => {
    
    const [manhwas, setManhwas] = useState<Manhwa[]>([])

    const init = useCallback(async () => {
        await dbReadManhwasOrderedByUpdateAt(0, 30)
            .then(values => setManhwas(values))
    }, [])

    useEffect(
        () => {
            init()
        },
        []
    )

    const onPress = () => {
        router.navigate("/(pages)/LastUpdate")
    }

    return (
        <ManhwaHorizontalGrid 
            title='Last Updates 🔥' 
            manhwas={manhwas}
            onPress={onPress}/>
    )
}

export default ManhwasLastUpdateGrid;

const styles = StyleSheet.create({})