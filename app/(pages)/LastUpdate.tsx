import { useLastUpdateManhwasState } from '@/store/lastUpdateManhwasStore'
import React, { useCallback, useEffect, useState } from 'react'
import { dbSortManhwasByLastUpdate } from '@/database/db';
import { SafeAreaView, StyleSheet} from 'react-native'
import ReturnButton from '@/components/ReturnButton'
import ManhwaGrid from '@/components/ManhwaGrid'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'


const MANHWAS_PER_PAGE = 60

const LastUpdate = () => {

  const [page, setPage] = useState(1)

  const { manhwas, setManhwas } = useLastUpdateManhwasState()

  const init = async () => {
    if (manhwas.length == 0) {
      await dbSortManhwasByLastUpdate()
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
      <TopBar title='Latest Releases' >
        <ReturnButton/>        
      </TopBar>
      <ManhwaGrid
        manhwas={manhwas.slice(0, page * MANHWAS_PER_PAGE)}
        numColumns={2}
        shouldShowChapterDate={false}
        onEndReached={onEndReached}
      />      
    </SafeAreaView>
  )
}

export default LastUpdate

const styles = StyleSheet.create({})