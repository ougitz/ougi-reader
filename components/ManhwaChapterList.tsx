import { View, Pressable, ActivityIndicator, Text } from "react-native"
import { useState, useEffect, useCallback } from "react"
import { spFetchChapterList } from "@/lib/supabase"
import { useManhwaChapterState } from "@/store/manhwaChaptersState"
import { useReadingState } from "@/store/manhwaReadingState"
import { router } from "expo-router"
import { AppStyle } from "@/styles/AppStyles"
import { Colors } from "@/constants/Colors"

const ManhwaChapterList = () => {
  
  const { chapterMap, addChapters } = useManhwaChapterState()
  const { manhwa, setChapterMap, setChapterNum } = useReadingState()
  const manhwa_id: number = manhwa!.manhwa_id
  const [loading, setLoading] = useState(false)

  const chapters = chapterMap.has(manhwa_id) ?
    chapterMap.get(manhwa_id)! :
    []

  const init = useCallback(async () => {
    if (!chapterMap.has(manhwa_id)) {
      setLoading(true)
      await spFetchChapterList(manhwa_id)
        .then(values => {
          setChapterMap(values)
          addChapters(manhwa_id, values)}
        )
      setLoading(false)
    } else {
      setChapterMap(chapterMap.get(manhwa_id)!)
    }
  }, [])

  useEffect(
    () => {
      init()
    },
    []
  )

  const readFirst = () => {
    if (chapters.length > 0) {
      setChapterNum(chapters[0].chapter_num)
      router.navigate("/(pages)/Chapter")
    }
  }

  const readLast = () => {
    if (chapters.length > 0) {
      setChapterNum(chapters[chapters.length - 1].chapter_num)
      router.navigate("/(pages)/Chapter")
    }
  }
  
  return (
    <View style={{width: '100%', gap: 10, flexWrap: 'wrap', flexDirection: 'row', alignItems: "center", justifyContent: "center"}} >
      {
        loading ?
          <ActivityIndicator size={'large'} color={Colors.white} /> :
          <>
            <View style={{width: '100%', flexDirection: 'row', gap: 10, alignItems: "center"}} >
              <Pressable onPress={readFirst} style={{flex: 1, backgroundColor: Colors.white, height: 52, borderRadius: 4, alignItems: "center", justifyContent: "center"}}  >
                <Text style={[AppStyle.textRegular, {color: Colors.almostBlack}]}>Read First</Text>
              </Pressable>
              <Pressable onPress={readLast} style={{flex: 1, backgroundColor: Colors.white, height: 52, borderRadius: 4, alignItems: "center", justifyContent: "center"}}  >
                <Text style={[AppStyle.textRegular, {color: Colors.almostBlack}]}>Read Last</Text>
              </Pressable>
            </View>
            {
              chapters.map((item, index) =>
                <Pressable 
                  key={index}
                  style={{backgroundColor: Colors.gray, width: 48, height: 48, borderRadius: 4, alignItems: "center", justifyContent: "center"}} >
                    <Text style={AppStyle.textRegular}>{item.chapter_num}</Text>
                </Pressable>
              )
            }  
          </>
      }
    </View>
  )
}

export default ManhwaChapterList;