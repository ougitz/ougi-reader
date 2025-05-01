import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppStyle } from '@/styles/AppStyles'
import ManhwaGrid from '@/components/ManhwaGrid'
import TopBar from '@/components/TopBar'
import { useLocalSearchParams } from 'expo-router'
import ReturnButton from '@/components/ReturnButton'
import { Manhwa } from '@/model/Manhwa'
import { spFetchManhwasByGenre } from '@/lib/supabase'


const ManhwaByGenre = () => {
  
    const params = useLocalSearchParams()
    const genre: string = params.genre as any
    const genre_id: number = parseInt(params.genre_id as any)

    const hasResults = useRef(true)
    const page = useRef(0)
    const [manhwas, setManhwas] = useState<Manhwa[]>([])

    const init = async () => {
        if (manhwas.length == 0) {
            await spFetchManhwasByGenre(genre_id)
                .then(values => setManhwas([...values]))
        }
    }   

    useEffect(
        useCallback(() => {
            init()
        }, []),
        []
    )

    const onEndReached = async () => {
        if (!hasResults.current) {
            return
        }
        console.log("end")
        page.current += 1
        await spFetchManhwasByGenre(genre_id, page.current)
            .then(values => {
                hasResults.current = values.length > 0
                setManhwas(prev => [...prev, ...values])
            })
    }  


    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title={genre}>
                <ReturnButton/>
            </TopBar>
            <ManhwaGrid
                manhwas={manhwas}
                numColumns={2}
                shouldShowChapterDate={false}
                onEndReached={onEndReached}/>
        </SafeAreaView>
  )
}


export default ManhwaByGenre

const styles = StyleSheet.create({})