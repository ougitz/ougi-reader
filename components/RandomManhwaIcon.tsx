import { StyleSheet, Pressable, Text, View, ActivityIndicator } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useState } from 'react'
import { dbReadRandomManhwa } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import { Manhwa } from '@/model/Manhwa'
import { router } from 'expo-router'
import Toast from './Toast'


interface RandomManhwaIconProps {
    iconColor: string
    iconSize: number
    backgroundColor: string
}

const RandomManhwaIcon = ({iconColor, iconSize, backgroundColor}: RandomManhwaIconProps) => {

    const db = useSQLiteContext()
    const [loading, setLoading] = useState(false)

    const openRandomManhwa = async () => {
        setLoading(true)
        console.log("oi")
        const m: Manhwa[] = await dbReadRandomManhwa(db, 1)
        if (m.length == 0) {
            Toast.show({title: "Error", message: "No manhwas!", type: "error"})
            setLoading(false)
            return
        }
        setLoading(false)
        router.navigate({
            pathname: '/(pages)/Manhwa', 
            params: {manhwa_id: m[0].manhwa_id}
        })
    
    }

    return (
        <Pressable onPress={openRandomManhwa}  style={{padding: 6, backgroundColor, borderRadius: 4}}>
            {
                loading ?
                <ActivityIndicator size={iconSize} color={iconColor}/> :                
                <Ionicons name='dice-outline' size={iconSize} color={iconColor}/>
            }
        </Pressable>
    )
}

export default RandomManhwaIcon

const styles = StyleSheet.create({})