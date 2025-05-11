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
  useCallback, 
  useEffect, 
  useRef, 
  useState 
} from 'react'
import { useReadingState } from '@/store/manhwaReadingState'
import { router, useLocalSearchParams } from 'expo-router'
import { dbUpsertReadingHistory } from '@/lib/database'
import { AppConstants } from '@/constants/AppConstants'
import { spFetchChapterImages } from '@/lib/supabase'
import ReturnButton from '@/components/ReturnButton'
import Ionicons from '@expo/vector-icons/Ionicons'
import ManhwaImage from '@/components/ManhwaImage'
import { ChapterImage } from '@/helpers/types'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import { hp, wp } from '@/helpers/util'


interface ChapterHeaderProps {
  manhwa_title: string
  loading: boolean
  previousChapter: () => void
  nextChapter: () => void
}


const ChapterHeader = ({ manhwa_title, loading, previousChapter, nextChapter}: ChapterHeaderProps) => {

  const { currentChapter } = useReadingState()
  
  const openBugReport = () => {    
    router.navigate({
      pathname: "/(pages)/BugReport",
      params: {title: `${manhwa_title}/${currentChapter ? currentChapter.chapter_num: '?'}`}
    })
  }
  
  return (
    <View style={{width: '100%', paddingHorizontal: wp(5)}} >
      <TopBar title={manhwa_title} >
        <ReturnButton/>
      </TopBar>
      <View style={{width: '100%', flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "space-between", marginBottom: 20}} >
        <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center"}} >
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
        <Pressable onPress={openBugReport} style={{flexDirection: 'row', gap: 20, alignItems: "center", justifyContent: "center", padding: 12, backgroundColor: Colors.gray, borderRadius: 42, alignSelf: "flex-end"}} >             
            <Ionicons name='bug-outline' size={32} color={Colors.green} />            
        </Pressable>
      </View>
    </View>
  )
}


interface ChapterFooterProps {
  manhwa_title: string
  loading: boolean
  previousChapter: () => void
  nextChapter: () => void
}


const ChapterFooter = ({manhwa_title, loading, previousChapter, nextChapter }: ChapterFooterProps) => {
  
  const {  currentChapter } = useReadingState()

  const openBugReport = () => {    
    router.navigate({
      pathname: "/(pages)/BugReport",
      params: {title: `${manhwa_title}/${currentChapter ? currentChapter.chapter_num: '?'}`}
    })
  }

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
        <View style={{gap: 10}} >
          <View style={{width: '100%', padding: 12, borderRadius: 4, backgroundColor: Colors.gray}} >
            <Text style={[AppStyle.textRegular, {fontSize: 20}]}>
              If you encounter broken or missing images, please use the bug-report option below.
            </Text>
          </View>
          <Pressable onPress={openBugReport} style={{flexDirection: 'row', gap: 20, alignItems: "center", justifyContent: "center", padding: 12, backgroundColor: Colors.gray, borderRadius: 4, alignSelf: "flex-end"}} > 
            <Text style={AppStyle.textRegular}>Bub Report</Text>
            <Ionicons name='bug-outline' size={32} color={Colors.green} />            
          </Pressable>
        </View>
      </View>
  )
}

const Chapter = () => {

  const db = useSQLiteContext()
  const { currentChapter, moveToNextChapter, moveToPreviousChapter  } = useReadingState()
  const [images, setImages] = useState<ChapterImage[]>([])
  const [loading, setLoading] = useState(false)
  const params = useLocalSearchParams()
  const manhwa_title: string = params.manhwa_title as any
  const flatListRef = useRef<FlatList>()

  const init = useCallback(async () => {
    if (currentChapter) {
      setLoading(true)
      await spFetchChapterImages(currentChapter.chapter_id)
        .then(values => setImages([...values]))
        .catch(error => console.log(error))
      setLoading(false)
      dbUpsertReadingHistory(
        db, 
        currentChapter.manhwa_id, 
        currentChapter.chapter_id,
        currentChapter.chapter_num
      )
    }
  }, [currentChapter])


  useEffect(
    () => {
      init()
    },
    [currentChapter]
  )
  
  const scrollUp = () => {
    flatListRef.current?.scrollToOffset({animated: false, offset: 0})
  }  

  const nextChapter = async () => {
    scrollUp()
    moveToNextChapter()
  }

  const previousChapter = async () => {
    scrollUp()
    moveToPreviousChapter()
  }

  return (
    <SafeAreaView style={[AppStyle.safeArea, {padding: 0, paddingBottom: 10}]} >
      <View style={{flex: 1}} >
        <FlatList
          data={images}
          ListHeaderComponent={<ChapterHeader manhwa_title={manhwa_title} loading={loading} nextChapter={nextChapter} previousChapter={previousChapter}/>}
          ListFooterComponent={<ChapterFooter manhwa_title={manhwa_title} loading={loading} nextChapter={nextChapter} previousChapter={previousChapter}/>}
          keyExtractor={(item, index) => index.toFixed()}
          ref={flatListRef as any}
          renderItem={({item, index}) => <ManhwaImage image={item} />}
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
    bottom: 50, 
    right: 10, 
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