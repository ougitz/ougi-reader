import { spUpdateManhwaViews } from '@/lib/supabase'
import { 
  SafeAreaView, 
  ScrollView, 
  Text, 
  StyleSheet, 
  View
} from 'react-native'
import React, { 
  useCallback,
  useEffect, 
  useRef
} from 'react'
import ManhwaChapterList from '@/components/ManhwaChapterList';
import ManhwaGenreInfo from '@/components/ManhwaGenreInfo';
import ManhwaAuthorsInfo from '@/components/ManhwaAuthorInfo';
import { LinearGradient } from 'expo-linear-gradient';
import { useReadingState } from '@/store/manhwaReadingState'
import ReturnButton from '@/components/ReturnButton';
import HomeButton from '@/components/HomeButton';
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors';
import { wp, hp } from '@/helpers/util';
import { Image } from 'expo-image';
import { useManhwaStackState } from '@/store/manhwaStackState';


const Manhwa = () => {

  const { manhwa } = useReadingState()  

  const countView = useRef(false)

  const init = useCallback(async () => {
    if (countView.current == false) {
      countView.current = true
      spUpdateManhwaViews(manhwa!.manhwa_id)
    }    
  }, [])

  useEffect(
    () => {
      init()
    },
    []
  )

  return (
    <SafeAreaView style={[AppStyle.safeArea, {padding: 0}]} >
      <ScrollView style={{flex: 1}} >
        <LinearGradient 
            colors={[manhwa!.color, Colors.backgroundColor]}
            style={styles.linearBackground} />
        <View style={styles.topBar} >
            <HomeButton/>
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 20}} >
                <ReturnButton/>
            </View>
        </View>

        <View style={styles.manhwaContainer}>
            <Image source={manhwa!.cover_image_url} style={styles.image} />
            <Text style={[AppStyle.textHeader, {alignSelf: 'flex-start', fontSize: 28, fontFamily: 'LeagueSpartan_600SemiBold', color: Colors.orange}]}>{manhwa!.title}</Text>
            <View style={{gap: 10, alignSelf: "flex-start"}} >
                <Text style={[AppStyle.textRegular, {alignSelf: 'flex-start', fontSize: 18}]}>{manhwa!.descr}</Text>
            </View>
            <View style={[styles.item, { alignSelf: 'flex-start', backgroundColor: manhwa!.status == 'Completed' ? Colors.orange : Colors.white }]} >
              <Text style={[AppStyle.textRegular, {color: Colors.almostBlack}]}>{manhwa!.status}</Text>
            </View>
            <ManhwaAuthorsInfo/>
            <ManhwaGenreInfo/>
            <ManhwaChapterList/>
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