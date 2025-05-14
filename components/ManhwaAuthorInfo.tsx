import { View, Pressable, Text, StyleSheet, FlatList } from "react-native"
import { useCallback, useEffect, useRef, useState } from "react"
import { dbReadManhwaAuthors } from "@/lib/database"
import { ManhwaAuthor } from "@/helpers/types"
import { AppStyle } from "@/styles/AppStyles"
import { Colors } from "@/constants/Colors"
import { useSQLiteContext } from "expo-sqlite"
import { router } from "expo-router"


interface ManhwaAuthorsInfoProps {
  manhwa_id: number
}


const ManhwaAuthorsInfo = ({manhwa_id}: ManhwaAuthorsInfoProps) => {

  const db = useSQLiteContext()
  const [authors, setAuthors] = useState<ManhwaAuthor[]>([])
  const flatListRef = useRef<FlatList>(null)

  const init = useCallback(async () => {
    await dbReadManhwaAuthors(db, manhwa_id).then(values => setAuthors(values))
    flatListRef.current?.scrollToIndex({animated: false, index: 0})
  }, [manhwa_id])

  useEffect(
    () => {
      init()
    }, 
    [manhwa_id]
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
      <FlatList
        ref={flatListRef}
        data={authors}
        keyExtractor={(item, index) => index.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => 
          <Pressable style={styles.item} onPress={() => openAuthorPage(item)}>
            <Text style={[AppStyle.textRegular, {color: Colors.white}]} >{item.role}: {item.name}</Text>
          </Pressable>
        }
      />
    </View>
  )

}

export default ManhwaAuthorsInfo;

const styles = StyleSheet.create({
    item: {
        paddingHorizontal: 10,
        paddingVertical: 12,
        backgroundColor: Colors.gray,
        marginRight: 8,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center"
      }
})
