import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { AppStyle } from '@/styles/AppStyles'
import { useSQLiteContext } from 'expo-sqlite'
import React, { useState, useRef, useEffect } from 'react'
import { useCallback } from 'react'
import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/ReturnButton'
import { Manhwa } from '@/model/Manhwa'
import { dbManhwaSearch } from '@/lib/database'
import ManhwaGrid from '@/components/ManhwaGrid'
import SearchBar from '@/components/SearchBar'
import { debounce } from 'lodash'


const PAGE_LIMIT = 30


const SearchManhwa = () => {

  const db = useSQLiteContext()
  const page = useRef(0)
  const hasResults = useRef(true)
  const isInitialized = useRef(false)

  const [manhwas, setManhwas] = useState<Manhwa[]>([])
  const [loading, setLoading] = useState(false)
  const searchTerm = useRef('')

  const init = useCallback(async () => {
    if (manhwas.length == 0) {
      setLoading(true)
      await dbManhwaSearch(db, searchTerm.current, 0, PAGE_LIMIT)
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

  const handleSearch = async (value: string) => {
    searchTerm.current = value
    page.current = 0
    setLoading(true)
      await dbManhwaSearch(db, searchTerm.current, page.current * PAGE_LIMIT, PAGE_LIMIT)
        .then(values => {
          hasResults.current = values.length > 0
          setManhwas([...values])
        })
    setLoading(false)
  }

  const debounceSearch = debounce(handleSearch, 400)

  const onEndReached = async () => {
    if (!hasResults.current || !isInitialized.current) { return }
    page.current += 1
    setLoading(true)
      await dbManhwaSearch(db, searchTerm.current, page.current * PAGE_LIMIT, PAGE_LIMIT)
        .then(values => {
          hasResults.current = values.length > 0
          setManhwas(prev => [...prev, ...values])
        })
    setLoading(false)
  }  

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Search' > 
        <ReturnButton/>
      </TopBar>
      <View style={{flex: 1, gap: 10}} >
        <SearchBar onChangeValue={debounceSearch} />      
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

export default SearchManhwa

const styles = StyleSheet.create({})