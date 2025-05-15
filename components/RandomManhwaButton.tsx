import { StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { ToastError } from '@/helpers/ToastMessages'
import { dbReadRandomManhwa } from '@/lib/database'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useSQLiteContext } from 'expo-sqlite'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/helpers/types'
import React, { useState } from 'react'
import { router } from 'expo-router'


interface RandomManhwaButtonProps {
    size?: number
    color?: string
}


const RandomManhwaButton = ({size = 28, color = Colors.white}: RandomManhwaButtonProps) => {

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