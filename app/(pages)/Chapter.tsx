import { 
  ActivityIndicator,  
  FlatList, 
  Pressable, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  View 
} from 'react-native'
import React, {
  useEffect, 
  useRef, 
  useState 
} from 'react'
import BugReportButton from '@/components/button/BugReportButton'
import { SQLiteDatabase, useSQLiteContext } from 'expo-sqlite'
import { useReadingState } from '@/store/manhwaReadingState'
import ReturnButton from '@/components/button/ReturnButton'
import { router, useLocalSearchParams } from 'expo-router'
import { dbUpsertReadingHistory } from '@/lib/database'
import { AppConstants } from '@/constants/AppConstants'
import { spFetchChapterImages } from '@/lib/supabase'
import Ionicons from '@expo/vector-icons/Ionicons'
import ManhwaImage from '@/components/ManhwaImage'
import { FlashList } from '@shopify/flash-list'
import FastImage from 'react-native-fast-image'
import { ChapterImage } from '@/helpers/types'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import BugIcon from '@/components/BugIcon'
import TopBar from '@/components/TopBar'
import { hp, wp } from '@/helpers/util'
import { Image } from 'expo-image'


interface ChapterHeaderProps {
  manhwaTitle: string
  loading: boolean
  goToPreviousChapter: () => void
  goToNextChapter: () => void
}


const ChapterHeader = ({ manhwaTitle, loading, goToPreviousChapter, goToNextChapter}: ChapterHeaderProps) => {

  const { currentChapter } = useReadingState()

  const reportTitle = `${manhwaTitle}/${currentChapter ? currentChapter.chapter_num: '?'}`

  const exitChapter = async () => {
    FastImage.clearDiskCache()
    FastImage.clearMemoryCache()
    router.back()
  }
  
  return (
    <View style={{width: '100%', paddingHorizontal: wp(5)}} >
      <TopBar title={manhwaTitle} >
        <ReturnButton onPress={exitChapter} />
      </TopBar>

      <View style={{width: '100%', flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "space-between", marginBottom: 20}} >
        
        {/* Chapter Controller Button */}
        <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center"}} >
          <Text style={AppStyle.textHeader}>Chapter</Text>
          <View style={{flexDirection: 'row', alignItems: "center", gap: 10, justifyContent: "center"}} >
            <Pressable onPress={goToPreviousChapter} hitSlop={AppConstants.hitSlop} >
              <Ionicons name='chevron-back' size={24} color={Colors.white} />
            </Pressable>
            <View style={{alignItems: "center", justifyContent: "center"}} >
              {
                loading ?
                <ActivityIndicator size={20} color={Colors.white} /> :
                <Text style={AppStyle.textHeader}>{currentChapter!.chapter_num}</Text>
              }
            </View>
            <Pressable onPress={goToNextChapter} hitSlop={AppConstants.hitSlop}>
              <Ionicons name='chevron-forward' size={24} color={Colors.white} />
            </Pressable>
          </View>
        </View>

        <BugReportButton size={32} title={reportTitle} />

      </View>
    </View>
  )
}


interface ChapterFooterProps {
  manwhaTitle: string
  loading: boolean
  goToPreviousChapter: () => void
  goToNextChapter: () => void
}


const ChapterFooter = ({manwhaTitle: manhwa_title, loading, goToPreviousChapter, goToNextChapter }: ChapterFooterProps) => {
  
  const {  currentChapter } = useReadingState()

  const openBugReport = () => {    
    router.navigate({
      pathname: "/(pages)/BugReport",
      params: {title: `${manhwa_title}/${currentChapter ? currentChapter.chapter_num: '?'}`}
    })
  }

  return (
    <View style={{width: '100%', paddingHorizontal: wp(5), marginTop: 42, marginBottom: 220}} >
        
        {/* Chapter Controller Button */}
        <View style={{width: '100%', flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "center", marginBottom: 20}} >
          <Text style={AppStyle.textHeader}>Chapter</Text>
          <View style={{flexDirection: 'row', alignItems: "center", gap: 10, justifyContent: "center"}} >
            <Pressable onPress={goToPreviousChapter} hitSlop={AppConstants.hitSlop} >
              <Ionicons name='chevron-back' size={24} color={Colors.white} />
            </Pressable>
            <View style={{alignItems: "center", justifyContent: "center"}} >
              {
                loading ?
                <ActivityIndicator size={20} color={Colors.white} /> :
                <Text style={AppStyle.textHeader}>{currentChapter!.chapter_num}</Text>
              }
            </View>
            <Pressable onPress={goToNextChapter} hitSlop={AppConstants.hitSlop}>
              <Ionicons name='chevron-forward' size={24} color={Colors.white} />
            </Pressable>
          </View>
        </View>
            
          
        {/* Custom Bug Report Button */}
        <Pressable onPress={openBugReport} style={{width: '100%', padding: 12, flexDirection: 'row', borderRadius: 4, backgroundColor: Colors.gray}} >
          <Text style={[AppStyle.textRegular, {fontSize: 18, flex: 0.8}]}>
            If you encounter broken or missing images, please use the bug-report option.
          </Text>
          <View style={{flex: 0.2, height: 64, alignSelf: "flex-start", alignItems: "center", justifyContent: "center"}} > 
            <BugIcon size={48} />
          </View>
        </Pressable>

      </View>
  )
}


const Chapter = () => {

  const db: SQLiteDatabase = useSQLiteContext()
  const params: {manhwa_title: string} = useLocalSearchParams()
  
  const { currentChapter, moveToNextChapter, moveToPreviousChapter  } = useReadingState()
  const [images, setImages] = useState<ChapterImage[]>([])
  const [loading, setLoading] = useState(false)
  
  const manhwa_title: string = params.manhwa_title as any
  const flatListRef = useRef<FlatList>()

  const init = async () => {
    if (currentChapter) {
      console.log("change chapter")
      setLoading(true)
        await Image.clearMemoryCache()
        await spFetchChapterImages(currentChapter.chapter_id)
          .then(values => setImages([...values]))
        dbUpsertReadingHistory(
          db, 
          currentChapter.manhwa_id, 
          currentChapter.chapter_id,
          currentChapter.chapter_num
        )
      setLoading(false)
    }
  }

  useEffect(
    () => {
      init()
    },
    [currentChapter]
  )
  
  const scrollUp = () => {
    flatListRef.current?.scrollToOffset({animated: false, offset: 0})
  }  

  const goToNextChapter = async () => {
    scrollUp()
    moveToNextChapter()
  }

  const goToPreviousChapter = async () => {
    scrollUp()
    moveToPreviousChapter()
  }

  return (
    <SafeAreaView style={[AppStyle.safeArea, {padding: 0}]} >
      <View style={{flex: 1}} >
        <FlashList
          data={images}
          ListHeaderComponent={<ChapterHeader manhwaTitle={manhwa_title} loading={loading} goToNextChapter={goToNextChapter} goToPreviousChapter={goToPreviousChapter}/>}
          ListFooterComponent={<ChapterFooter manwhaTitle={manhwa_title} loading={loading} goToNextChapter={goToNextChapter} goToPreviousChapter={goToPreviousChapter}/>}
          keyExtractor={(item, index) => item.image_url}          
          onEndReachedThreshold={3}
          estimatedItemSize={hp(50)}
          drawDistance={hp(300)}
          ref={flatListRef as any}
          renderItem={({item, index}) => 
            <ManhwaImage 
              imageUrl={item.image_url} 
              originalWidth={item.width} 
              originalHeight={item.height} />
          }
          ListEmptyComponent={<ActivityIndicator size={32} color={Colors.white} />}
        />
        <Pressable onPress={scrollUp} hitSlop={AppConstants.hitSlopLarge} style={styles.arrowUp} >
            <Ionicons name='arrow-up-outline' size={20} color={'rgba(0, 0, 0, 0.3)'} />
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default Chapter

const styles = StyleSheet.create({
  arrowUp: {
    position: 'absolute', 
    bottom: 60, 
    right: 12, 
    padding: 6, 
    borderRadius: 32, 
    backgroundColor: 'rgba(255, 255, 255, 0.3)'
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