import { SafeAreaView, StyleSheet, View } from 'react-native'
import { AppStyle } from '@/styles/AppStyles'
import React, { useCallback, useRef, useState } from 'react'
import TopBar from '@/components/TopBar'
import ReadingStatusPicker from '@/components/picker/ReadingStatusPicker'
import { Manhwa } from '@/model/Manhwa'
import { dbGetManhwasByReadingStatus } from '@/lib/database'
import ManhwaGrid from '@/components/ManhwaGrid'
import { useFocusEffect } from 'expo-router'
import ReturnButton from '@/components/ReturnButton'
import { useSQLiteContext } from 'expo-sqlite'
import { Colors } from '@/constants/Colors'


const PAGE_LIMIT = 30


const Library = () => {

  const db = useSQLiteContext()
  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)
  const status = useRef('Reading')
  const page = useRef(0)
  const hasResults = useRef(true)

  const init = async () => {
    setLoading(true)
    await dbGetManhwasByReadingStatus(db, status.current)
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
    await dbGetManhwasByReadingStatus(db, value)
      .then(values => {
        hasResults.current = values.length > 0
        setManhwas(values)
      })
    setLoading(false)
  }

  const onEndReached = async () => {
    if (!hasResults.current) { return }
    page.current += 1
    await dbGetManhwasByReadingStatus(
      db,
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
      <TopBar title='Library' titleColor={Colors.libraryColor} >
        <ReturnButton color={Colors.libraryColor} />
      </TopBar>
      <View style={{flex: 1, gap: 10}} >
        <ReadingStatusPicker defaultValue='Reading' onChangeValue={onChangeValue} />
        <ManhwaGrid
          manhwas={manhwas}
          loading={loading}          
          numColumns={2}
          hasResults={true}
          showChaptersPreview={false}
          onEndReached={onEndReached}
          listMode='FlatList'
        />
      </View>
    </SafeAreaView>
  )
}

export default Library

const styles = StyleSheet.create({})