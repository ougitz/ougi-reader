import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { AppStyle } from '@/styles/AppStyles'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import TopBar from '@/components/TopBar'
import HomeButton from '@/components/HomeButton'
import ReadingStatusPicker from '@/components/picker/ReadingStatusPicker'
import { Manhwa } from '@/model/Manhwa'
import { dbGetManhwasByReadingStatus, dbListTable } from '@/lib/database'
import ManhwaGrid from '@/components/ManhwaGrid'
import { useFocusEffect } from 'expo-router'
import ReturnButton from '@/components/ReturnButton'


const PAGE_LIMIT = 30


const Library = () => {

  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)
  const status = useRef('Completed')
  const page = useRef(0)
  const hasResults = useRef(true)

  const init = async () => {
    setLoading(true)
    await dbGetManhwasByReadingStatus(status.current)
      .then(values => setManhwas(values))
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      init()
    }, [])
  )

  const onChangeValue = async (value: string | null) => {
    if (!value) { return }
    setLoading(true)
    status.current = value
    page.current = 0
    await dbGetManhwasByReadingStatus(value)
      .then(values => {
        hasResults.current = values.length > 0
        setManhwas(values)
      })
    setLoading(false)
  }

  const onEndReached = async () => {
    if (!hasResults.current) { return }
    console.log("end")
    page.current += 1
    await dbGetManhwasByReadingStatus(
      status.current,
      page.current * PAGE_LIMIT,
      PAGE_LIMIT
    ).then(values => {
      hasResults.current = values.length > 0
      setManhwas(prev => [...prev, ...values])
    })
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Library' >
        <ReturnButton/>
      </TopBar>
      <View style={{flex: 1, gap: 20}} >
        <ReadingStatusPicker onChangeValue={onChangeValue} />
        <ManhwaGrid
          manhwas={manhwas}
          loading={loading}          
          numColumns={2}
          hasResults={true}
          shouldShowChapterDate={false}
          onEndReached={onEndReached}
          listMode='FlatList'
        />
      </View>
    </SafeAreaView>
  )
}

export default Library

const styles = StyleSheet.create({})