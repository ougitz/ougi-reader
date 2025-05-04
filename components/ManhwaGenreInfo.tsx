import { Text, View, Pressable, StyleSheet } from "react-native"
import { AppStyle } from "@/styles/AppStyles"
import { Colors } from "@/constants/Colors"
import { useReadingState } from "@/store/manhwaReadingState"
import { Genre } from "@/helpers/types"
import { router } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { dbReadManhwaGenres } from "@/lib/database"


const ManhwaGenreInfo = ({manhwa_id}: {manhwa_id: number}) => {

  
  const [genres, setGenres] = useState<Genre[]>([])

  const init = useCallback(async () => {
    await dbReadManhwaGenres(manhwa_id)
      .then(values => setGenres(values))
  }, [])

  useEffect(
    () => {
      init()
    }, 
    []
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
      {
        genres.map((genre, index) => 
          <Pressable style={styles.item} onPress={() => openGenrePage(genre)} key={index} >
            <Text style={[AppStyle.textRegular, {color: Colors.white}]} >{genre.genre}</Text>
          </Pressable>
        )
      }
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
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center"
      }
})