import { StyleSheet, Pressable, Text, View, ActivityIndicator } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useState } from 'react'
import { dbReadRandomManhwa } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import { Manhwa } from '@/model/Manhwa'
import { router } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { ToastError } from '@/helpers/ToastMessages'


interface RandomManhwaIconProps {
    size?: number
    color?: string
}


const RandomManhwaButton = ({size = 28, color = Colors.white}: RandomManhwaIconProps) => {

    const db = useSQLiteContext()
    const [loading, setLoading] = useState(false)

    const openRandomManhwa = async () => {
        setLoading(true)
        const m: Manhwa[] = await dbReadRandomManhwa(db, 1)
        if (m.length == 0) {
            ToastError("No manhwas!")
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
        <Pressable onPress={openRandomManhwa}  style={{padding: 6, backgroundColor: Colors.backgroundColor, borderRadius: 4}}>
            {
                loading ?
                <ActivityIndicator size={size} color={color}/> :                
                <Ionicons name='dice-outline' size={size} color={color}/>
            }
        </Pressable>
    )
}

export default RandomManhwaButton

const styles = StyleSheet.create({})