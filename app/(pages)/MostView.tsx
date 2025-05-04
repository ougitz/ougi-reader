import React, { useCallback, useEffect, useRef, useState } from 'react'
import { dbReadManhwasOrderedByViews } from '@/lib/database';
import { SafeAreaView, StyleSheet} from 'react-native'
import ReturnButton from '@/components/ReturnButton'
import ManhwaGrid from '@/components/ManhwaGrid'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'
import { Manhwa } from '@/model/Manhwa';
import { useSQLiteContext } from 'expo-sqlite';


const PAGE_LIMIT = 30

const MostView = () => {

  const db = useSQLiteContext()
  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)
  
  const page = useRef(0)
  const hasResults = useRef(true)
  const isInitialized = useRef(false)

  const init = useCallback(async () => {
    await dbReadManhwasOrderedByViews(db, 0, PAGE_LIMIT)
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
    await dbReadManhwasOrderedByViews(db, page.current * PAGE_LIMIT, PAGE_LIMIT)
      .then(values => {
        hasResults.current = values.length > 0
        setManhwas(prev => [...prev, ...values])
      })
    setLoading(false)
  }  

  return (
    <SafeAreaView style={AppStyle.safeArea}>
      <TopBar title='Most Views ⚡' >
        <ReturnButton/>        
      </TopBar>
      <ManhwaGrid
        manhwas={manhwas}
        hasResults={true}
        loading={loading}
        numColumns={2}
        shouldShowChapterDate={false}
        onEndReached={onEndReached}
        listMode='FlatList'/>
    </SafeAreaView>
  )
}

export default MostView

const styles = StyleSheet.create({})