import { StyleSheet, Pressable, View, Text } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { dbReadManhwasOrderedByUpdateAt } from '@/lib/database'
import ManhwaHorizontalGrid from './ManhwaHorizontalGrid'
import { AppConstants } from '@/constants/AppConstants'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyles'
import { Manhwa } from '@/model/Manhwa'
import { router } from 'expo-router'
import Title from './text/Title'


const ManhwasLastUpdateGrid = () => {
    
    const db = useSQLiteContext()
    const [manhwas, setManhwas] = useState<Manhwa[]>([])

    const init = useCallback(async () => {
        await dbReadManhwasOrderedByUpdateAt(db, 0, 30)
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
        <View style={{gap: 20}} >
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}} >
                <Title title='Latest Updates' iconName='rocket-outline' />
                <Pressable onPress={onPress} hitSlop={AppConstants.hitSlopLarge} >
                        <Text style={[AppStyle.textRegular, {textDecorationLine: 'underline'}]}>view all</Text>
                </Pressable>
            </View>
            <ManhwaHorizontalGrid manhwas={manhwas}/>
        </View>
    )
}

export default ManhwasLastUpdateGrid;

const styles = StyleSheet.create({})