import React, { useCallback, useEffect, useState } from 'react'
import { dbReadManhwasOrderedByViews } from '@/lib/database'
import ManhwaHorizontalGrid from './ManhwaHorizontalGrid'
import { StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Manhwa } from '@/model/Manhwa'
import { useSQLiteContext } from 'expo-sqlite'


const MostViewedManhwasComponent = () => {
    
    const db = useSQLiteContext()
    const [manhwas, setManhwas] = useState<Manhwa[]>([])

    const init = useCallback(async () => {
        await dbReadManhwasOrderedByViews(db, 0, 30)
            .then(values => setManhwas(values))
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
            manhwas={manhwas}
            onPress={onPress}/>
    )
}

export default MostViewedManhwasComponent;

const styles = StyleSheet.create({})