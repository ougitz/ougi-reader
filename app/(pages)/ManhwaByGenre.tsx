import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { AppStyle } from '@/styles/AppStyles'
import ManhwaGrid from '@/components/ManhwaGrid'
import TopBar from '@/components/TopBar'
import { useLocalSearchParams } from 'expo-router'
import ReturnButton from '@/components/ReturnButton'
import { Manhwa } from '@/model/Manhwa'
import { dbGetManhwasByGenre } from '@/database/db'


const MANHWAS_PER_PAGE = 60


const ManhwaByGenre = () => {
  
    const params = useLocalSearchParams()
    const genre: string = params.genre as any

    const [page, setPage] = useState(1)
    const [manhwas, setManhwas] = useState<Manhwa[]>([])

    const init = async () => {
        if (manhwas.length == 0) {
            await dbGetManhwasByGenre(genre)
                .then(values => setManhwas([...values]))
        }
    }   

    useEffect(
        useCallback(() => {
            init()
        }, []),
        []
    )

    const onEndReached = () => {
        if (page * MANHWAS_PER_PAGE <= manhwas.length) {
            setPage(prev => prev + 1)
        }
    }  


    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title={genre}>
                <ReturnButton/>
            </TopBar>
            <ManhwaGrid
                manhwas={manhwas.slice(0, page * MANHWAS_PER_PAGE)}
                numColumns={2}
                shouldShowChapterDate={false}
                onEndReached={onEndReached}/>
        </SafeAreaView>
  )
}


export default ManhwaByGenre

const styles = StyleSheet.create({})