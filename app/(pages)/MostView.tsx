import { useMostViewManhwasState } from '@/store/mostViewManhwasStore';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView, StyleSheet} from 'react-native'
import ReturnButton from '@/components/ReturnButton'
import ManhwaGrid from '@/components/ManhwaGrid'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'
import { spFetchMostViewManhwas } from '@/lib/supabase';


const MostView = () => {

  const { manhwas, setManhwas } = useMostViewManhwasState()

  const page = useRef(0)
  const hasResults = useRef(true)

  const init = async () => {
    if (manhwas.length == 0) {
      await spFetchMostViewManhwas()
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
    page.current += 1
    await spFetchMostViewManhwas(page.current)
      .then(values => {
        hasResults.current = values.length > 0
        setManhwas([...manhwas, ...values])
      })
  }  

  return (
    <SafeAreaView style={AppStyle.safeArea}>
      <TopBar title='Most Views ⚡' >
        <ReturnButton/>        
      </TopBar>
      <ManhwaGrid
        manhwas={manhwas}
        numColumns={2}
        shouldShowChapterDate={false}
        onEndReached={onEndReached}/>
    </SafeAreaView>
  )
}

export default MostView

const styles = StyleSheet.create({})