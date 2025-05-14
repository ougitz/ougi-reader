import { Text, View, Pressable, StyleSheet, FlatList } from "react-native"
import { useCallback, useEffect, useRef, useState } from "react"
import { dbReadManhwaGenres } from "@/lib/database"
import { useSQLiteContext } from "expo-sqlite"
import { AppStyle } from "@/styles/AppStyles"
import { Colors } from "@/constants/Colors"
import { Genre } from "@/helpers/types"
import { router } from "expo-router"


const ManhwaGenreInfo = ({manhwa_id}: {manhwa_id: number}) => {

  const db = useSQLiteContext()
  const [genres, setGenres] = useState<Genre[]>([])

  const flatListRef = useRef<FlatList>(null)

  const init = useCallback(async () => {
    await dbReadManhwaGenres(db, manhwa_id).then(values => setGenres(values))
    flatListRef.current?.scrollToIndex({animated: false, index: 0})
  }, [manhwa_id])

  useEffect(
    () => {
      init()
    }, 
    [manhwa_id]
  )

  const openGenrePage = (genre: Genre) => {
    router.navigate({
      pathname: '/ManhwaByGenre', 
      params: {
        genre_id: genre.genre_id,
        genre: genre.genre
      }})
  }

  return (
    <View style={{width: '100%', flexWrap: 'wrap', flexDirection: 'row', gap: 10}} >
      <FlatList 
        ref={flatListRef}
        data={genres}
        keyExtractor={(item, index) => index.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => 
          <Pressable style={styles.item} onPress={() => openGenrePage(item)}>
            <Text style={[AppStyle.textRegular, {color: Colors.white}]} >{item.genre}</Text>
          </Pressable>
        }
      />
    </View>
  )

}

export 
default ManhwaGenreInfo;

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