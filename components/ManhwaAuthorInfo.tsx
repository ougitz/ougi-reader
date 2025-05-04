import { View, Pressable, Text, StyleSheet } from "react-native"
import { router } from "expo-router"
import { useReadingState } from "@/store/manhwaReadingState"
import { Colors } from "@/constants/Colors"
import { AppStyle } from "@/styles/AppStyles"
import { ManhwaAuthor } from "@/helpers/types"
import { useCallback, useEffect, useState } from "react"
import { dbReadManhwaAuthors } from "@/lib/database"
import { useSQLiteContext } from "expo-sqlite"


const ManhwaAuthorsInfo = ({manhwa_id}: {manhwa_id: number}) => {

  const db = useSQLiteContext()
  const [authors, setAuthors] = useState<ManhwaAuthor[]>([])

  const init = useCallback(async () => {
    await dbReadManhwaAuthors(db, manhwa_id)
      .then(values => setAuthors(values))
  }, [])

  useEffect(
    () => {
      init()
    }, 
    []
  )
  
  const openAuthorPage = (author: ManhwaAuthor) => {
    router.navigate({
      pathname: '/ManhwaByAuthor', 
      params: {
        author_id: author.author_id,
        author_name: author.name, 
        author_role: author.role
      }})
  }

  return (
    <View style={{width: '100%', flexWrap: 'wrap', flexDirection: 'row', gap: 10}} >
      {
        authors.map((author, index) => 
          <Pressable style={styles.item} onPress={() => openAuthorPage(author)} key={index} >
            <Text style={[AppStyle.textRegular, {color: Colors.white}]} >{author.role}: {author.name}</Text>
          </Pressable>
        )
      }
    </View>
  )

}

export default ManhwaAuthorsInfo;

const styles = StyleSheet.create({
    item: {
        paddingHorizontal: 10,
        paddingVertical: 12,
        backgroundColor: Colors.gray,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center"
      }
})
