import { spUpdateManhwaViews } from '@/lib/supabase'
import { 
  SafeAreaView, 
  ScrollView, 
  Text, 
  StyleSheet, 
  View,
  ActivityIndicator,
  Pressable
} from 'react-native'
import React, { 
  useCallback,
  useEffect,   
  useRef,   
  useState
} from 'react'
import ManhwaChapterList from '@/components/ManhwaChapterList';
import ManhwaGenreInfo from '@/components/ManhwaGenreInfo';
import ManhwaAuthorsInfo from '@/components/ManhwaAuthorInfo';
import { LinearGradient } from 'expo-linear-gradient';
import ReturnButton from '@/components/ReturnButton';
import HomeButton from '@/components/HomeButton';
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors';
import { wp, hp } from '@/helpers/util';
import { Image } from 'expo-image';
import { dbListTable, dbReadManhwaById, dbUpdateManhwaViews, dbGetMangaReadChapters } from '@/lib/database';
import { router, useLocalSearchParams } from 'expo-router';
import { Manhwa } from '@/model/Manhwa';
import Toast from '@/components/Toast';
import AddToLibray from '@/components/AddToLibray';
import { useSQLiteContext } from 'expo-sqlite';
import { ChapterReadLog } from '@/helpers/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import RandomManhwaIcon from '@/components/RandomManhwaIcon';


const ManhwaPage = () => {

  const db = useSQLiteContext()
  const params = useLocalSearchParams()
  const [manhwa, setManhwa] = useState<Manhwa | null>()
  const manhwa_id: number = parseInt(params.manhwa_id as any)  
  
  const init = useCallback(async () => {          
      await dbReadManhwaById(db, manhwa_id)
        .then(value => {
          if (value) {
            setManhwa(value)
          } else {
            Toast.show({title: "Error", message: "invalid manhwa", type: "error"})
            router.replace("/(pages)/Home")
            return
          }
      })
      spUpdateManhwaViews(manhwa_id)
      dbUpdateManhwaViews(db, manhwa_id)      
  }, [manhwa_id])

  useEffect(
    () => {
      init()
    },
    [manhwa_id]
  )

  const openBugReport = () => {
    router.navigate({
      pathname: "/(pages)/BugReport",
      params: {title: manhwa?.title}
    })
  }

  return (
    <SafeAreaView style={[AppStyle.safeArea, {padding: 0}]} >
      <ScrollView style={{flex: 1}} >
        {
          manhwa ?
          <>
            <LinearGradient 
                colors={[manhwa.color, Colors.backgroundColor]}
                style={styles.linearBackground} />
            <View style={styles.topBar} >
                <HomeButton iconColor={manhwa.color} />
                <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 20}} >
                    <Pressable onPress={openBugReport} style={{padding: 6, backgroundColor: Colors.backgroundColor, borderRadius: 4}} >
                      <Ionicons name='bug-outline' size={28} color={manhwa.color} />
                    </Pressable>
                    <RandomManhwaIcon iconSize={28} backgroundColor={Colors.backgroundColor} iconColor={manhwa.color} />
                    <ReturnButton iconColor={manhwa.color} />
                </View>
            </View>

            <View style={styles.manhwaContainer}>
                <Image source={manhwa.cover_image_url} style={styles.image} />
                <Text style={[AppStyle.textHeader, {alignSelf: 'flex-start', fontSize: 28, fontFamily: 'LeagueSpartan_600SemiBold'}]}>{manhwa!.title}</Text>
                <Text style={[AppStyle.textHeader, {alignSelf: 'flex-start', fontSize: 28}]}>Summary</Text>
                <View style={{gap: 10, alignSelf: "flex-start"}} >
                    <Text style={[AppStyle.textRegular, {alignSelf: 'flex-start', fontSize: 18}]}>{manhwa.descr}</Text>
                </View>
                <ManhwaAuthorsInfo manhwa_id={manhwa_id} />
                <ManhwaGenreInfo manhwa_id={manhwa_id} />
                <AddToLibray manhwa_id={manhwa_id} color={manhwa.color} />
                <View style={{flexDirection: 'row', width: '100%', gap: 10, alignItems: "center", justifyContent: "flex-start"}} >
                  <View style={[styles.item, {backgroundColor: manhwa.color}]} >
                    <Text style={[AppStyle.textRegular, {color: Colors.almostBlack}]}>{manhwa.status}</Text>
                  </View>
                  <View style={[styles.item, {backgroundColor: manhwa.color}]} >
                    <Text style={[AppStyle.textRegular, {color: Colors.almostBlack}]}>Views: {manhwa.views}</Text>
                  </View>
                </View>
                <ManhwaChapterList manhwa={manhwa} />
            </View>
          </>
          :
          <View style={{flex: 1, height: hp(100), alignItems: "center", justifyContent: "center"}} >
              <ActivityIndicator size={'large'} color={Colors.white} />
          </View>
        }

      </ScrollView>
    </SafeAreaView>
  )
}

export default ManhwaPage

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
    height: 52,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  topBar: {
    width: '100%', 
    marginVertical: 10, 
    flexDirection: 'row', 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: wp(5)
  },
  manhwaContainer: {
    width: '100%', 
    gap: 10, 
    alignItems: "center", 
    paddingHorizontal: wp(5), 
    paddingBottom: hp(8)
  },
  image: {
    width: '100%', 
    maxWidth: 380, 
    height: 480, 
    borderRadius: 4
  }
})