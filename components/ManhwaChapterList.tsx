import { View, Pressable, ActivityIndicator, Text, StyleSheet } from "react-native"
import { useState, useEffect, useCallback, useRef } from "react"
import { spFetchChapterList } from "@/lib/supabase"
import { router } from "expo-router"
import {dbGetMangaReadChapters} from '@/lib/database'
import { AppStyle } from "@/styles/AppStyles"
import { Colors } from "@/constants/Colors"
import { Chapter } from "@/model/Chapter"
import { useReadingState } from "@/store/manhwaReadingState"
import { Manhwa } from "@/model/Manhwa"
import { useSQLiteContext } from "expo-sqlite"
import Ionicons from "@expo/vector-icons/Ionicons"
import RotatingButton from "./RotatingButton"


const ChapterItem = ({
  isReaded, 
  manhwa_title, 
  chapter
}: {
  isReaded: boolean,
  manhwa_title: string, 
  chapter: Chapter
}) => {

  const { setChapterNum } = useReadingState()  

  const onPress = () => {
    setChapterNum(chapter.chapter_num)
    router.navigate({pathname: "/(pages)/Chapter", params: {manhwa_title}})
  }

  const bColor = isReaded ? Colors.white : Colors.gray
  const tColor = isReaded ? Colors.backgroundColor : Colors.white

  return (
    <Pressable       
      onPress={onPress}
      style={[styles.chapterItem, {backgroundColor: bColor}]} >
        <Text style={[AppStyle.textRegular, {color: tColor}]}>{chapter.chapter_num}</Text>
    </Pressable>
  )
}


const ManhwaChapterList = ({manhwa}: {manhwa: Manhwa}) => {
  
  const db = useSQLiteContext()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(false)
  const { setChapterNum, setChapterMap } = useReadingState()
  
  const chapterAlreadyReaded = useRef<Set<number>>(new Set())
  
  const init = useCallback(async () => {
    setLoading(true)
    await spFetchChapterList(manhwa.manhwa_id)
    .then(values => {
      setChapterMap(new Map(values.map(i => [i.chapter_num, i])))
      setChapters(values)
    })
    chapterAlreadyReaded.current = await dbGetMangaReadChapters(db, manhwa.manhwa_id)
    setLoading(false)
  }, [manhwa])  
  
  useEffect(
    () => {
      init()
    },
    [manhwa]
  )

  const readFirst = () => {
    if (chapters.length > 0) {
      setChapterNum(chapters[0].chapter_num)
      router.navigate({pathname: "/(pages)/Chapter", params: {manhwa_title: manhwa.title}})
    }
  }

  const readLast = () => {
    if (chapters.length > 0) {
      setChapterNum(chapters[chapters.length - 1].chapter_num)
      router.navigate({pathname: "/(pages)/Chapter", params: {manhwa_title: manhwa.title}})
    }
  }
  
  return (
    <View style={{width: '100%', gap: 10, flexWrap: 'wrap', flexDirection: 'row', alignItems: "center", justifyContent: "center"}} >
      {
        loading ?
          <View style={{flex: 1, alignItems: "center", justifyContent: "center"}} >
            <ActivityIndicator size={'large'} color={Colors.white} />
          </View>
            :
          <View style={{width: '100%', gap: 20}} >
            <View style={{width: '100%', flexDirection: 'row', gap: 10, alignItems: "center"}} >
              <Pressable onPress={readFirst} style={{flex: 1, backgroundColor: manhwa.color, height: 52, borderRadius: 4, alignItems: "center", justifyContent: "center"}}  >
                <Text style={[AppStyle.textRegular, {color: Colors.almostBlack}]}>Read First</Text>
              </Pressable>
              <Pressable onPress={readLast} style={{flex: 1, backgroundColor: manhwa.color, height: 52, borderRadius: 4, alignItems: "center", justifyContent: "center"}}  >
                <Text style={[AppStyle.textRegular, {color: Colors.almostBlack}]}>Read Last</Text>
              </Pressable>
            </View>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: "center", justifyContent: "center"}} >
              {
                chapters.map((item, index) => 
                  <ChapterItem 
                    isReaded={chapterAlreadyReaded.current.has(item.chapter_num)}
                    manhwa_title={manhwa.title} 
                    key={index} 
                    chapter={item}/>
                )
              }
            </View>
          </View>
      }
    </View>
  )
}

export default ManhwaChapterList;

const styles = StyleSheet.create({
  chapterItem: {    
    width: 48, 
    height: 48, 
    borderRadius: 4, 
    alignItems: "center", 
    justifyContent: "center"
  }
})