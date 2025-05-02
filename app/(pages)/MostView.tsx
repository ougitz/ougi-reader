import { useMostViewManhwasState } from '@/store/mostViewManhwasStore';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView, StyleSheet} from 'react-native'
import ReturnButton from '@/components/ReturnButton'
import ManhwaGrid from '@/components/ManhwaGrid'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'
import { spFetchMostViewManhwas } from '@/lib/supabase';


const PAGE_OFFSET = 30

const MostView = () => {

  const { manhwas, setManhwas, appendManwas } = useMostViewManhwasState()
  const [loading, setLoading] = useState(false)
  
  const page = useRef(0)
  const hasResults = useRef(true)
  const isInitialized = useRef(false)

  const init = useCallback(async () => {
    if (manhwas.length == 0) {
      await spFetchMostViewManhwas()
        .then(values => setManhwas([...values]))
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
    if (!hasResults.current || !isInitialized.current) {
      return
    }
    page.current += 1
    setLoading(true)
    await spFetchMostViewManhwas(page.current * PAGE_OFFSET)
      .then(values => {
        hasResults.current = values.length > 0
        appendManwas(values)
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