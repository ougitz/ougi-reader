import { View, Pressable, ActivityIndicator, Text, StyleSheet } from "react-native"
import { useState, useEffect, useCallback, useRef } from "react"
import { useReadingState } from "@/store/manhwaReadingState"
import {dbGetMangaReadChapters} from '@/lib/database'
import { spFetchChapterList } from "@/lib/supabase"
import { Chapter, Manhwa } from '@/helpers/types';
import { useSQLiteContext } from "expo-sqlite"
import { AppStyle } from "@/styles/AppStyles"
import { Colors } from "@/constants/Colors"
import { router } from "expo-router"


interface ChapterItemProps {
  isReaded: boolean
  manhwa_title: string
  chapter: Chapter  
}


const ChapterItem = ({
  isReaded, 
  manhwa_title, 
  chapter  
}: ChapterItemProps) => {

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
        <Text style={[AppStyle.textRegular, {color: tColor, fontSize: 14}]}>{chapter.chapter_num}</Text>
    </Pressable>
  )
}


interface ManhwaChapterListProps {
  manhwa: Manhwa
  textColor?: string
}


const ManhwaChapterList = ({
  manhwa, 
  textColor = Colors.backgroundColor
}: ManhwaChapterListProps) => {
  
  const db = useSQLiteContext()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(false)
  const { setChapterNum, setChapterMap } = useReadingState()
  
  const chapterAlreadyReaded = useRef<Set<number>>(new Set())
  
  const init = useCallback(async () => {    
    setLoading(true)
    dbGetMangaReadChapters(db, manhwa.manhwa_id).then(s => chapterAlreadyReaded.current = s)
      .then(
        v => {
          spFetchChapterList(manhwa.manhwa_id)
            .then(values => {
              setChapterMap(new Map(values.map(i => [i.chapter_num, i])))
              setChapters(values)
              setLoading(false)
            }).catch(error => console.log("error spFetchChapterList", error))
        }
      )
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
                <Text style={[AppStyle.textRegular, {color: textColor}]}>Read First</Text>
              </Pressable>
              <Pressable onPress={readLast} style={{flex: 1, backgroundColor: manhwa.color, height: 52, borderRadius: 4, alignItems: "center", justifyContent: "center"}}  >
                <Text style={[AppStyle.textRegular, {color: textColor}]}>Read Last</Text>
              </Pressable>
            </View>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: "center", justifyContent: "center"}} >
              {
                chapters.map((item, index) => 
                  <ChapterItem                    
                    isReaded={chapterAlreadyReaded.current.has(item.chapter_num)}
                    manhwa_title={manhwa.title} 
                    key={item.chapter_id} 
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
    width: 42, 
    height: 42, 
    borderRadius: 4, 
    alignItems: "center", 
    justifyContent: "center"    
  }
})