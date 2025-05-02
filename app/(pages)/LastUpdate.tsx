import { useLastUpdateManhwasState } from '@/store/manhwaLastUpdateState'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView, StyleSheet} from 'react-native'
import ReturnButton from '@/components/ReturnButton'
import ManhwaGrid from '@/components/ManhwaGrid'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'
import { spFetchLatestManhwas } from '@/lib/supabase'
import { Manhwa } from '@/model/Manhwa'


const PAGE_OFFSET = 30

const LastUpdate = () => {

  const page = useRef(0)
  const hasResults = useRef(true)
  const isInitialized = useRef(false)

  const { manhwas, setManhwas, appendManhwas } = useLastUpdateManhwasState()
  const [loading, setLoading] = useState(false)

  const init = useCallback(async () => {
    if (manhwas.length == 0) {
      setLoading(true)
      await spFetchLatestManhwas(0, PAGE_OFFSET)
        .then(values => setManhwas([...values]))
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
    console.log("end")
    page.current += 1
    setLoading(true)
    await spFetchLatestManhwas(page.current * PAGE_OFFSET)
      .then(values => {
        hasResults.current = values.length > 0
        appendManhwas(values)
      })
    setLoading(false)
  }  

  return (
    <SafeAreaView style={AppStyle.safeArea}>
      <TopBar title='Last Updates 🔥' >
        <ReturnButton/>        
      </TopBar>
      <ManhwaGrid
        manhwas={manhwas}
        loading={loading}
        numColumns={2}
        hasResults={true}
        shouldShowChapterDate={false}
        onEndReached={onEndReached}
        listMode='FlatList'
      />
    </SafeAreaView>
  )
}

export default LastUpdate

const styles = StyleSheet.create({})