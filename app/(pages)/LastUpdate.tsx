import React, { useCallback, useEffect, useRef, useState } from 'react'
import { dbReadManhwasOrderedByUpdateAt } from '@/lib/database'
import { SafeAreaView, StyleSheet} from 'react-native'
import ReturnButton from '@/components/ReturnButton'
import ManhwaList from '@/components/ManhwaList'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'
import { Manhwa } from '@/model/Manhwa'


const PAGE_LIMIT = 30


const LastUpdate = () => {

  const db = useSQLiteContext()
  const page = useRef(0)
  const hasResults = useRef(true)
  const isInitialized = useRef(false)

  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)

  const init = useCallback(async () => {
    if (manhwas.length == 0) {
      setLoading(true)
      await dbReadManhwasOrderedByUpdateAt(db, 0, PAGE_LIMIT)
        .then(values => setManhwas(values))
      setLoading(false)
    }
    isInitialized.current = true
  }, [])

  useEffect(
    () => {
      init()
    },
    []
  )

  const onEndReached = async () => {
    if (!hasResults.current || !isInitialized.current) { return }
    page.current += 1
    setLoading(true)
      await dbReadManhwasOrderedByUpdateAt(db, page.current * PAGE_LIMIT, PAGE_LIMIT)
        .then(values => {
          hasResults.current = values.length > 0
          setManhwas(prev => [...prev, ...values])
        })
    setLoading(false)
  }  

  return (
    <SafeAreaView style={AppStyle.safeArea}>
      <TopBar title='Latest Updates' >
        <ReturnButton/>        
      </TopBar>
      <ManhwaList
        manhwas={manhwas}
        loading={loading}
        numColumns={2}
        estimatedItemSize={400}
        hasResults={true}
        showChaptersPreview={true}
        shouldShowChapterDate={false}
        onEndReached={onEndReached}
        listMode='FlashList'
      />
    </SafeAreaView>
  )
}

export default LastUpdate

const styles = StyleSheet.create({})