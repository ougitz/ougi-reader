import { SafeAreaView, ScrollView, Text, StyleSheet, View, Pressable, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image';
import ReturnButton from '@/components/ReturnButton';
import HomeButton from '@/components/HomeButton';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { spFetchChapterList, spUpdateManhwaViews } from '@/lib/supabase'
import { useReadingState } from '@/store/readingStore'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors';
import { wp, hp } from '@/helpers/util';
import { dbGetAuthorsOfManhwa, dbGetGenresOfManhwa, dbUpsertManhwaViewCount } from '@/database/db';
import { router } from 'expo-router';
import { Author } from '@/helpers/types';
import { Chapter } from '@/model/Chapter';


const ManhwaGenreInfo = ({genres}: {genres: string[]}) => {
  
  const openGenrePage = (g: string) => {
    router.navigate({pathname: '/ManhwaByGenre', params: {genre: g}})
  }

  return (
    <View style={{width: '100%', flexWrap: 'wrap', flexDirection: 'row', gap: 10}} >
      {
        genres.map((genre, index) => 
          <Pressable style={styles.item} onPress={() => openGenrePage(genre)} key={index} >
            <Text style={[AppStyle.textRegular, {color: Colors.white}]} >{genre}</Text>
          </Pressable>
        )
      }
    </View>
  )

}


const ManhwaAuthorsInfo = ({authors}: {authors: Author[]}) => {
  
  const openAuthorPage = (author: Author) => {
    router.navigate({
      pathname: '/ManhwaByAuthor', 
      params: {author_id: author.author_id, author_name: author.name, author_role: author.role}})
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


const ManhwaChapterList = ({manhwa_id}: {manhwa_id: number}) => {
  
  const [chapters, setChapters] = useState<Chapter[]>([])

  const { setChapterMap, setChapterNum } = useReadingState()

  const init = async () => {
    if (chapters.length == 0) {
      await spFetchChapterList(manhwa_id)
        .then(values => {
          setChapterMap(values)
          setChapters([...values])
        })
      
    }
  }

  useEffect(
    useCallback(() => {
      init()
    }, []),
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
    </View>
  )
}


const Manhwa = () => {

  const { manhwa } = useReadingState()

  const [genres, setGenres] = useState<string[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(false)

  const countView = useRef(false)

  const init = async () => {
    setLoading(true)
    if (countView.current == false) {
      countView.current = true
      await spUpdateManhwaViews(manhwa!.manhwa_id)
      await dbUpsertManhwaViewCount(manhwa!.manhwa_id)
    }

    if (genres.length == 0) {
      await dbGetGenresOfManhwa(manhwa!.manhwa_id)
        .then(values => setGenres([...values]))
    }

    if (authors.length == 0) {
      await dbGetAuthorsOfManhwa(manhwa!.manhwa_id)
        .then(values => setAuthors([...values]))
    }

    setLoading(false)
  }

  useEffect(
    useCallback(() => {
      init()
    }, []),
    []
  )


  return (
    <SafeAreaView style={[AppStyle.safeArea, {padding: 0}]} >
      <ScrollView style={{flex: 1}} >
        <LinearGradient 
            colors={[manhwa!.color, Colors.backgroundColor]}
            style={styles.linearBackground} />
        <View style={{width: '100%', marginVertical: 10, flexDirection: 'row', alignItems: "center", justifyContent: "space-between", padding: wp(5)}} >
            <HomeButton/>
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 20}} >
                <ReturnButton/>
            </View>
        </View>

        <View style={{width: '100%', gap: 10, alignItems: "center", paddingHorizontal: wp(5), paddingBottom: hp(8)}}>
            <Image source={manhwa!.cover_image_url} style={{width: '100%', maxWidth: 380, height: 480, borderRadius: 4}} />            
            <Text style={[AppStyle.textHeader, {alignSelf: 'flex-start'}]}>{manhwa!.title}</Text>              
            <View style={{gap: 10, alignSelf: "flex-start"}} >
                <Text style={[AppStyle.textHeader, {alignSelf: 'flex-start'}]}>Summary</Text>
                <Text style={[AppStyle.textRegular, {alignSelf: 'flex-start'}]}>{manhwa!.descr}</Text>
            </View>
            <View style={[styles.item, { alignSelf: 'flex-start', backgroundColor: manhwa!.status == 'Completed' ? Colors.orange : Colors.white }]} >
              <Text style={[AppStyle.textRegular, {color: Colors.almostBlack}]}>{manhwa!.status}</Text>
            </View>
            {
              loading ?
              <ActivityIndicator size={32} color={Colors.white} /> :
              <>                
                <ManhwaAuthorsInfo authors={authors} />
                <ManhwaGenreInfo genres={genres} />
                <ManhwaChapterList manhwa_id={manhwa!.manhwa_id} />
              </>
            }
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default Manhwa

const styles = StyleSheet.create({
  linearBackground: {
    position: 'absolute',
    width: wp(100),
    left: 0,
    right: 0,
    top: 0,
    height: hp(80)
  },
  item: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: Colors.gray,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center"
  }
})