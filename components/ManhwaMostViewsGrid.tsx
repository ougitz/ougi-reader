import React, { useCallback, useEffect, useState } from 'react'
import { dbReadManhwasOrderedByViews } from '@/lib/database'
import ManhwaHorizontalGrid from './ManhwaHorizontalGrid'
import { StyleSheet, View, Text, Pressable } from 'react-native'
import { AppStyle } from '@/styles/AppStyles'
import { router } from 'expo-router'
import { Manhwa } from '@/model/Manhwa'
import { useSQLiteContext } from 'expo-sqlite'
import Title from './text/Title'
import { AppConstants } from '@/constants/AppConstants'


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
        <View style={{gap: 20}} >
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}} >
                <Title title='Most Views' iconName='flame-outline' />
                <Pressable onPress={onPress} hitSlop={AppConstants.hitSlopLarge} >
                    <Text style={[AppStyle.textRegular, {textDecorationLine: 'underline'}]}>view all</Text>
                </Pressable>
            </View>
            <ManhwaHorizontalGrid manhwas={manhwas}/>
        </View>
    )
}

export default MostViewedManhwasComponent;

const styles = StyleSheet.create({})