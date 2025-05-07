import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppStyle } from '@/styles/AppStyles'
import ManhwaGrid from '@/components/ManhwaGrid'
import TopBar from '@/components/TopBar'
import { useLocalSearchParams } from 'expo-router'
import ReturnButton from '@/components/ReturnButton'
import { Manhwa } from '@/model/Manhwa'
import { dbReadManhwasByGenreId } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'


const PAGE_LIMIT = 30


const ManhwaByGenre = () => {
    
    const db = useSQLiteContext()
    const params = useLocalSearchParams()
    const genre: string = params.genre as any
    const genre_id: number = parseInt(params.genre_id as any)

    const [manhwas, setManhwas] = useState<Manhwa[]>([])
    const [loading, setLoading] = useState(false)
    const hasResults = useRef(true)
    const page = useRef(0)
    const isInitialized = useRef(false)

    const init = useCallback(async () => {
        await dbReadManhwasByGenreId(db, genre_id, 0, PAGE_LIMIT)
            .then(values => setManhwas(values))
        isInitialized.current = true        
    }, [])


    useEffect(
        () => {
            init()
        },
        []
    )

    const onEndReached = async () => {
        if (!hasResults.current || !isInitialized.current) {
            return
        }
        page.current += 1
        setLoading(true)
        await dbReadManhwasByGenreId(db, genre_id, page.current * PAGE_LIMIT, PAGE_LIMIT)
            .then(values => {
                hasResults.current = values.length > 0
                setManhwas(prev => [...prev, ...values])
            })
        setLoading(false)
    }  


    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title={genre}>
                <ReturnButton/>
            </TopBar>
            <ManhwaGrid
                manhwas={manhwas}
                numColumns={2}
                loading={loading}
                hasResults={true}
                listMode='FlatList'
                showChaptersPreview={false}
                onEndReached={onEndReached}/>            
        </SafeAreaView>
  )
}


export default ManhwaByGenre

const styles = StyleSheet.create({})