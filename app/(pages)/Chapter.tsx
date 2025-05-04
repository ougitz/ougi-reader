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
import { AppConstants } from '@/constants/AppConstants'
import { useReadingState } from '@/store/manhwaReadingState'
import ReturnButton from '@/components/ReturnButton'
import Ionicons from '@expo/vector-icons/Ionicons'
import { spFetchChapterImages } from '@/lib/supabase'
import ManhwaImage from '@/components/ManhwaImage'
import { ChapterImage } from '@/helpers/types'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import { hp, wp } from '@/helpers/util'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import { dbUpsertReadingHistory } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'


interface ChapterHeaderProps {
  manhwa_title: string
  loading: boolean
  previousChapter: () => void
  nextChapter: () => void
}


const ChapterHeader = ({ manhwa_title, loading, previousChapter, nextChapter}: ChapterHeaderProps) => {

  const { currentChapter } = useReadingState()
  
  return (
    <View style={{width: '100%', paddingHorizontal: wp(5)}} >
      <TopBar title={manhwa_title} >
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


interface ChapterFooterProps {
  loading: boolean
  previousChapter: () => void
  nextChapter: () => void
}


const ChapterFooter = ({ loading, previousChapter, nextChapter }: ChapterFooterProps) => {
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
      await dbUpsertReadingHistory(db, currentChapter.manhwa_id, currentChapter.chapter_id)
      await spFetchChapterImages(currentChapter.chapter_id)
        .then(values => setImages([...values]))
        .catch(error => console.log(error))        
      setLoading(false)
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
  
  const scrollDown = () => {
    flatListRef.current?.scrollToEnd({animated: false})
  }

  const nextChapter = async () => {
    scrollUp()
    await Image.clearMemoryCache()
    moveToNextChapter()
  }

  const previousChapter = async () => {
    scrollUp()
    await Image.clearMemoryCache()    
    moveToPreviousChapter()
  }

  return (
    <SafeAreaView style={[AppStyle.safeArea, {paddingHorizontal: 0}]} >
      <View style={{width: '100%', height: hp(100)}} >
        <FlatList
          data={images}
          ListHeaderComponent={<ChapterHeader manhwa_title={manhwa_title} loading={loading} nextChapter={nextChapter} previousChapter={previousChapter}/>}
          ListFooterComponent={<ChapterFooter loading={loading} nextChapter={nextChapter} previousChapter={previousChapter}/>}
          keyExtractor={(item, index) => index.toFixed()}
          maxToRenderPerBatch={1}
          removeClippedSubviews={true}
          ref={flatListRef as any}
          initialNumToRender={1}
          renderItem={({item, index}) => <ManhwaImage image={item} />}
        />
        <Pressable onPress={scrollUp} hitSlop={AppConstants.hitSlopLarge} style={styles.arrowUp} >
            <Ionicons name='arrow-up-outline' size={20} color={'rgba(0, 0, 0, 0.6)'} />
        </Pressable>
      </View>
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