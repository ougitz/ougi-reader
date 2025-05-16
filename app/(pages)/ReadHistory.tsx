import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState, useRef} from 'react'
import { useReadingState } from '@/store/manhwaReadingState'
import { dbGetUserReadHistory } from '@/lib/database'
import ReturnButton from '@/components/button/ReturnButton'
import { spFetchChapterList } from '@/lib/supabase'
import { ChapterReadLog } from '@/helpers/types'
import { hp, isColorDark } from '@/helpers/util'
import { ActivityIndicator } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import { router } from 'expo-router'
import { Image } from 'expo-image'


const PAGE_LIMIT = 20


interface HistoryChapterItemProps {
  chapter_num: number
  backgroundColor: string
  textColor: string
  onPress: () => any
}


const HistoryChapterItem = ({chapter_num, backgroundColor, textColor, onPress}: HistoryChapterItemProps) => {
  return (
    <Pressable onPress={onPress} style={[styles.historyChapterItem, {backgroundColor}]}>
      <Text style={[AppStyle.textRegular, {color: textColor}]} >{chapter_num}</Text>
    </Pressable>
  )
}

const HistoryItem = ({log}: {log: ChapterReadLog}) => {
  
  const { setChapterMap, setChapterNum } = useReadingState()
  const [loading, setLoading] = useState(false)

  const onPress = async (chapter_num: number, manhwa_id: number) => {
    setLoading(true)
    await spFetchChapterList(manhwa_id)
        .then(values => setChapterMap(new Map(values.map(i => [i.chapter_num, i]))))
    setChapterNum(chapter_num)
    setLoading(false)
    router.navigate({
      pathname: "/(pages)/Chapter", 
      params: {manhwa_title: log.title}}
    )
  } 

  const onImagePress = () => {
    router.navigate({
        pathname: '/(pages)/Manhwa', 
        params: {manhwa_id: log.manhwa_id}
    })
  }

  return (
    <View style={styles.itemContainer} >
      <Pressable onPress={onImagePress} style={{width: '100%', maxWidth: 380, height: 480, borderRadius: 12}} >
        <Image 
          source={log.cover_image_url}
          contentFit='cover'
          style={styles.image}
          />
      </Pressable>
      <View style={{gap: 10, width: '100%'}} >
        <Text numberOfLines={1} style={[AppStyle.textRegular, {fontSize: 20}]}>{log.title}</Text>
        {
          loading ?
          <View style={{paddingVertical: 20, alignItems: "center", justifyContent: "center"}} >
            <ActivityIndicator size={32} color={Colors.white} />
          </View>
          :
          <View style={styles.itemGrid} >
            {
              Array.from(log.chapters).map(
                (chapter_num, index) => 
                  <HistoryChapterItem 
                    key={index}
                    textColor={isColorDark(log.color) ? Colors.white : Colors.backgroundColor} 
                    backgroundColor={log.color}
                    chapter_num={chapter_num} 
                    onPress={() => onPress(chapter_num, log.manhwa_id)}
                  />
              )
            }
          </View>
        }        
      </View>
    </View>
  )
}

const ReadHistory = () => {

  const db = useSQLiteContext()
  const page = useRef(0)
  const hasResults = useRef(true)
  const isInitialized = useRef(false)
  
  const [logs, setLogs] = useState<ChapterReadLog[]>([])
  const [loading, setLoading] = useState(false)

  const init = useCallback(async () => {
    await dbGetUserReadHistory(db, 0, PAGE_LIMIT)
      .then(values => setLogs(values))
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
    setLoading(true)
    page.current += 1    
    await dbGetUserReadHistory(db, page.current * PAGE_LIMIT, PAGE_LIMIT)
      .then(values => {
        hasResults.current = values.length > 0
        setLogs(prev => [...prev, ...values])
      })
    setLoading(false)
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Reading History' titleColor={Colors.readingHistoryColor} >
        <ReturnButton color={Colors.readingHistoryColor} />
      </TopBar>
      <FlashList
        data={logs} 
        estimatedItemSize={600}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => <HistoryItem log={item}/>} 
        onEndReached={onEndReached}
        drawDistance={hp(100)}
        scrollEventThrottle={4}
        onEndReachedThreshold={1}
        ListFooterComponent={
          <>
              {
                  loading && hasResults.current &&
                  <View style={{width: '100%', paddingVertical: 22, alignItems: "center", justifyContent: "center"}} >
                      <ActivityIndicator size={32} color={Colors.white} />
                  </View> 
              }
          </>}
        />
    </SafeAreaView>
  )
}

export default ReadHistory

const styles = StyleSheet.create({
  itemContainer: {
    width: '100%',
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    marginBottom: 40
  },
  image: {
    width: '100%', 
    maxWidth: 380, 
    height: 480, 
    borderRadius: 12,
    alignSelf: "flex-start"
  },
  itemGrid: {
    gap: 10, 
    alignSelf: "flex-start", 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    alignItems: "center", 
    justifyContent: "flex-start"
  },
  historyChapterItem: {
    width: 48, 
    height: 48, 
    borderRadius: 4,     
    alignItems: "center", 
    justifyContent: "center", 
    paddingVertical: 8
  }
})