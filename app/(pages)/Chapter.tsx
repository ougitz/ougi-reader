import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppConstants } from '@/constants/AppConstants'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/ReturnButton'
import { useReadingState } from '@/store/readingStore'
import { ChapterImage } from '@/helpers/types'
import { spFetchChapterImages } from '@/lib/supabase'
import { hp, wp } from '@/helpers/util'
import ManhwaImage from '@/components/ManhwaImage'
import { Manhwa } from '@/model/Manhwa'
import { Colors } from '@/constants/Colors'
import { Image } from 'expo-image'


const ChapterHeader = ({
  loading,
  previousChapter,
  nextChapter
}: {loading: boolean, previousChapter: () => void, nextChapter: () => void}) => {

  const { manhwa, currentChapter } = useReadingState()
  
  return (
    <View style={{width: '100%', paddingHorizontal: wp(5)}} >
      <TopBar title={manhwa!.title} >
        <ReturnButton/>
      </TopBar>
      <View style={{width: '100%', flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "flex-start", marginBottom: 20}} >
        <Text style={AppStyle.textHeader}>Chapter</Text>
        <View style={{flexDirection: 'row', alignItems: "center", gap: 10, justifyContent: "center"}} >
          <Pressable onPress={previousChapter} hitSlop={AppConstants.hitSlop} >
            <Ionicons name='chevron-back' size={24} color={Colors.white} />
          </Pressable>
          <View style={{alignItems: "center", justifyContent: "center"}} >
            {
              loading ?
              <ActivityIndicator size={20} color={Colors.white} /> :
              <Text style={AppStyle.textHeader}>{currentChapter!.chapter_num}</Text>
            }
          </View>
          <Pressable onPress={nextChapter} hitSlop={AppConstants.hitSlop}>
            <Ionicons name='chevron-forward' size={24} color={Colors.white} />
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const ChapterFooter = ({
  loading,
  previousChapter,
  nextChapter,
}: {loading: boolean, previousChapter: () => void, nextChapter: () => void}) => {
  const { currentChapter } = useReadingState()

  return (
    <View style={{width: '100%', paddingHorizontal: wp(5), marginTop: 42, marginBottom: 220}} >
        <View style={{width: '100%', flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "center", marginBottom: 20}} >
          <Text style={AppStyle.textHeader}>Chapter</Text>
          <View style={{flexDirection: 'row', alignItems: "center", gap: 10, justifyContent: "center"}} >
            <Pressable onPress={previousChapter} hitSlop={AppConstants.hitSlop} >
              <Ionicons name='chevron-back' size={24} color={Colors.white} />
            </Pressable>
            <View style={{alignItems: "center", justifyContent: "center"}} >
              {
                loading ?
                <ActivityIndicator size={20} color={Colors.white} /> :
                <Text style={AppStyle.textHeader}>{currentChapter!.chapter_num}</Text>
              }
            </View>
            <Pressable onPress={nextChapter} hitSlop={AppConstants.hitSlop}>
              <Ionicons name='chevron-forward' size={24} color={Colors.white} />
            </Pressable>
          </View>
        </View>
      </View>
  )
}

const Chapter = () => {

  const { currentChapter, moveToNextChapter, moveToPreviousChapter  } = useReadingState()
  const [images, setImages] = useState<ChapterImage[]>([])
  const [loading, setLoading] = useState(false)
  
  const flatListRef = useRef<FlatList>()

  const init = async () => {
    if (currentChapter && images.length == 0) {
      setLoading(true)
      await spFetchChapterImages(currentChapter.chapter_id) 
          .then(values => setImages([...values]))
      setLoading(false)
    }
  }

  const loadChapter = async () => {
    if (currentChapter) {
      await spFetchChapterImages(currentChapter.chapter_id) 
        .then(values => setImages([...values]))
    }
  }

  useEffect(
    useCallback(() => {
      init()
    }, []),
    []
  )
  
  const scrollUp = () => {
    flatListRef.current?.scrollToOffset({animated: false, offset: 0})
  }
  
  const scrollDown = () => {
    flatListRef.current?.scrollToEnd({animated: false})
  }

  const nextChapter = async () => {
    scrollUp()
    setLoading(true)
    await Image.clearMemoryCache()
    moveToNextChapter()
    setLoading(false)
  }

  const previousChapter = async () => {
    setLoading(true)
    await Image.clearMemoryCache()
    moveToPreviousChapter()
    setLoading(false)
  }

  return (
    <SafeAreaView style={[AppStyle.safeArea, {padding: 0}]} >
      <View style={{width: '100%', height: hp(120)}} >
        <FlatList
          data={images}
          ListHeaderComponent={<ChapterHeader loading={loading} nextChapter={nextChapter} previousChapter={previousChapter}/>}
          ListFooterComponent={<ChapterFooter loading={loading} nextChapter={nextChapter} previousChapter={previousChapter}/>}
          keyExtractor={(item, index) => index.toFixed()}
          maxToRenderPerBatch={1}
          removeClippedSubviews={true}
          ref={flatListRef as any}
          initialNumToRender={1}
          renderItem={({item, index}) => <ManhwaImage image={item} />}
        />
      </View>
      <Pressable onPress={scrollUp} hitSlop={AppConstants.hitSlopLarge} style={styles.arrowUp} >
          <Ionicons name='arrow-up-outline' size={20} color={'rgba(0, 0, 0, 0.6)'} />
      </Pressable>
      <Pressable onPress={scrollDown} hitSlop={AppConstants.hitSlopLarge} style={styles.arrowDown} >
          <Ionicons name='arrow-down-outline' size={20} color={'rgba(0, 0, 0, 0.6)'} />
      </Pressable>
    </SafeAreaView>
  )
}

export default Chapter

const styles = StyleSheet.create({
  arrowUp: {
    position: 'absolute', 
    bottom: 20, 
    right: 10, 
    padding: 6, 
    borderRadius: 32, 
    backgroundColor: 'rgba(255, 255, 255, 0.5)'
  },    
  arrowDown: {
      position: 'absolute', 
      bottom: 20, 
      right: 60, 
      padding: 6, 
      borderRadius: 32, 
      backgroundColor: 'rgba(255, 255, 255, 0.5)'
  },
})