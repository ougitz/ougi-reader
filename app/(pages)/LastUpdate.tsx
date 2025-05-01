import { useLastUpdateManhwasState } from '@/store/lastUpdateManhwasStore'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView, StyleSheet} from 'react-native'
import ReturnButton from '@/components/ReturnButton'
import ManhwaGrid from '@/components/ManhwaGrid'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'
import { spFetchLatestManhwas } from '@/lib/supabase'


const LastUpdate = () => {

  const page = useRef(0)
  const hasResults = useRef(true)

  const { manhwas, setManhwas } = useLastUpdateManhwasState()

  const init = async () => {
    if (manhwas.length == 0) {
      await spFetchLatestManhwas()
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
    await spFetchLatestManhwas(page.current)
      .then(values => {
        hasResults.current = values.length > 0
        setManhwas([...manhwas, ...values])
      })

  }  

  return (
    <SafeAreaView style={AppStyle.safeArea}>
      <TopBar title='Last Updates 🔥' >
        <ReturnButton/>        
      </TopBar>
      <ManhwaGrid
        manhwas={manhwas}
        numColumns={2}
        shouldShowChapterDate={false}
        onEndReached={onEndReached}
      />
    </SafeAreaView>
  )
}

export default LastUpdate

const styles = StyleSheet.create({})