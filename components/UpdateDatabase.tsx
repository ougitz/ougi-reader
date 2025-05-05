import { dbShouldUpdate, dbCheckSecondsSinceLastRefresh, dbUpdateDatabase } from '@/lib/database'
import { ToastNoInternet, ToastSuccess } from '@/helpers/ToastMessages'
import { StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import { hasInternetAvailable } from '@/helpers/util'
import Toast from './Toast'
import { router } from 'expo-router'


const UpdateDatabase = () => {
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
            const { seconds, secondsUntilRefresh } = await dbCheckSecondsSinceLastRefresh(db, 'database')
            Toast.show({
                title: "Wait ⌛", 
                message: `You can try again in ${secondsUntilRefresh} seconds`,
                type: "info",
                duration: 3000
            })
        } else {
            Toast.show({title: "Updating database", message: "", type: "info"})
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
                <ActivityIndicator size={28} color={'white'} /> :
                <Pressable onPress={update} hitSlop={AppConstants.hitSlop} >
                    <Ionicons name='layers-outline' size={28} color={'white'} />
                </Pressable>
            }
        </>
    )
}

export default UpdateDatabase

const styles = StyleSheet.create({})