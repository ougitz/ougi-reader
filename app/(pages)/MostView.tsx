import React, { useCallback, useEffect, useRef, useState } from 'react'
import { dbReadManhwasOrderedByViews } from '@/lib/database'
import ReturnButton from '@/components/ReturnButton'
import ManhwaList from '@/components/ManhwaList'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyles'
import { SafeAreaView } from 'react-native'
import TopBar from '@/components/TopBar'
import { Manhwa } from '@/model/Manhwa'


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
      <TopBar title='Most Views' >
        <ReturnButton/>        
      </TopBar>
      <ManhwaList
        manhwas={manhwas}
        hasResults={true}
        loading={loading}
        numColumns={2}
        estimatedItemSize={400}
        showChaptersPreview={true}
        shouldShowChapterDate={false}
        onEndReached={onEndReached}
        listMode='FlashList'/>
    </SafeAreaView>
  )
}

export default MostView
