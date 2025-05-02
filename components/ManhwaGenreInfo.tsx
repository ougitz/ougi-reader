import { Text, View, Pressable, StyleSheet } from "react-native"
import { AppStyle } from "@/styles/AppStyles"
import { Colors } from "@/constants/Colors"
import { useReadingState } from "@/store/manhwaReadingState"
import { Genre } from "@/helpers/types"
import { router } from "expo-router"


const ManhwaGenreInfo = () => {

  const { manhwa } = useReadingState()
  const genres = manhwa ? manhwa.genres : []

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