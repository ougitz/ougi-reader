import React, { useCallback, useEffect, useState } from 'react'
import { dbReadManhwasByAuthorId } from '@/lib/database'
import { SafeAreaView, StyleSheet } from 'react-native'
import ReturnButton from '@/components/ReturnButton'
import { useLocalSearchParams } from 'expo-router'
import ManhwaList from '@/components/ManhwaList'
import { AppStyle } from '@/styles/AppStyles'
import { useSQLiteContext } from 'expo-sqlite'
import TopBar from '@/components/TopBar'
import { Manhwa } from '@/helpers/types'


const ManhwaByAuthor = () => {
  
    const db = useSQLiteContext()
    const params = useLocalSearchParams()
    const author_id: number = parseInt(params.author_id as any)
    const author_name: string = params.author_name as any
    const author_role: string = params.author_role as any
    
    const [manhwas, setManhwas] = useState<Manhwa[]>([])
    const [loading, setLoading] = useState(false)

    const init = useCallback(async () => {        
        if (manhwas.length == 0) {
            setLoading(true)
            await dbReadManhwasByAuthorId(db, author_id)
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
            <ManhwaList
                manhwas={manhwas}
                numColumns={2}
                loading={loading}
                hasResults={true}
                listMode='FlatList'
                showChaptersPreview={false}/>
        </SafeAreaView>
  )
}


export default ManhwaByAuthor

const styles = StyleSheet.create({})