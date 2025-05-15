import React, { useCallback, useEffect, useRef, useState } from 'react'
import { dbReadManhwasByGenreId } from '@/lib/database'
import { SafeAreaView, StyleSheet } from 'react-native'
import ReturnButton from '@/components/ReturnButton'
import { useLocalSearchParams } from 'expo-router'
import ManhwaList from '@/components/ManhwaList'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'
import { Manhwa } from '@/helpers/types'


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
            <ManhwaList
                manhwas={manhwas}
                numColumns={2}
                loading={loading}
                estimatedItemSize={400}
                hasResults={true}
                listMode='FlashList'
                showChaptersPreview={true}
                shouldShowChapterDate={false}
                onEndReached={onEndReached}/>            
        </SafeAreaView>
  )
}


export default ManhwaByGenre

const styles = StyleSheet.create({})