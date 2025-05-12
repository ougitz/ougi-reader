import { dbShouldUpdate, dbCheckSecondsSinceLastRefresh, dbUpdateDatabase } from '@/lib/database'
import { ToastNoInternet, ToastUpdateDatabase, ToastWaitDatabase } from '@/helpers/ToastMessages'
import { StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import { hasInternetAvailable } from '@/helpers/util'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useSQLiteContext } from 'expo-sqlite'
import { Colors } from '@/constants/Colors'
import React, { useState } from 'react'
import { router } from 'expo-router'


interface UpdateDatabaseProps {
    iconSize?: number
    iconColor?: string
}

const UpdateDatabase = ({
    iconSize = 28, 
    iconColor = Colors.white
}: UpdateDatabaseProps) => {

    const db = useSQLiteContext()
    const [loading, setLoading] = useState(false)

    const update = async () => {
        setLoading(true)
        const hasInternet = await hasInternetAvailable()
        if (!hasInternet) { 
            ToastNoInternet()
            setLoading(false)
            return 
        }

        const shouldUpdate = await dbShouldUpdate(db, 'database')
        
        if (!shouldUpdate) {
            const secondsUntilRefresh = await dbCheckSecondsSinceLastRefresh(db, 'database')
            ToastWaitDatabase(secondsUntilRefresh)
        } else {
            ToastUpdateDatabase()
            try {
                await dbUpdateDatabase(db)
                setLoading(false)
                router.replace("/(pages)/Home")
                return
            } catch (error) {
                console.log(error)
            }
        }

        setLoading(false)
    }

    return (
        <>
            {
                loading ?
                <ActivityIndicator size={iconSize} color={iconColor} /> :
                <Pressable onPress={update} hitSlop={AppConstants.hitSlop} >
                    <Ionicons name='cloud-download-outline' size={iconSize} color={iconColor} />
                </Pressable>
            }
        </>
    )
}

export default UpdateDatabase

const styles = StyleSheet.create({})