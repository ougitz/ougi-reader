import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { spFetchManhwasByAuthor } from '@/lib/supabase'
import ReturnButton from '@/components/ReturnButton'
import { useLocalSearchParams } from 'expo-router'
import ManhwaGrid from '@/components/ManhwaGrid'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'
import { Manhwa } from '@/model/Manhwa'


const ManhwaByAuthor = () => {
  
    const params = useLocalSearchParams()
    const author_id: number = parseInt(params.author_id as any)
    const author_name: string = params.author_name as any
    const author_role: string = params.author_role as any
    
    const [manhwas, setManhwas] = useState<Manhwa[]>([])
    const [loading, setLoading] = useState(false)

    const init = useCallback(async () => {        
        if (manhwas.length == 0) {
            setLoading(true)
            await spFetchManhwasByAuthor(author_id)
                .then(values => setManhwas([...values]))
            setLoading(false)
        }
    }, [])

    useEffect(
        () => {
            init()
        },
        []
    )    

    return (
        <SafeAreaView style={AppStyle.safeArea}>
            <TopBar title={`${author_role}: ${author_name}`}>
                <ReturnButton/>
            </TopBar>
            <ManhwaGrid
                manhwas={manhwas}
                numColumns={2}
                loading={loading}
                hasResults={true}
                listMode='FlatList'
                shouldShowChapterDate={false}/>
        </SafeAreaView>
  )
}


export default ManhwaByAuthor

const styles = StyleSheet.create({})