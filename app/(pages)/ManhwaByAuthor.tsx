import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { AppStyle } from '@/styles/AppStyles'
import ManhwaGrid from '@/components/ManhwaGrid'
import TopBar from '@/components/TopBar'
import { useLocalSearchParams } from 'expo-router'
import ReturnButton from '@/components/ReturnButton'
import { Manhwa } from '@/model/Manhwa'
import { dbGetManhwasByAuthor, dbGetManhwasByGenre } from '@/database/db'


const MANHWAS_PER_PAGE = 60


const ManhwaByAuthor = () => {
  
    const params = useLocalSearchParams()
    const author_id: number = parseInt(params.author_id as any)
    const author_name: string = params.author_name as any
    const author_role: string = params.author_role as any

    const [page, setPage] = useState(1)
    const [manhwas, setManhwas] = useState<Manhwa[]>([])
    
    const init = async () => {        
        if (manhwas.length == 0) {
            await dbGetManhwasByAuthor(author_id)
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
            <TopBar title={`${author_role}: ${author_name}`}>
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


export default ManhwaByAuthor

const styles = StyleSheet.create({})