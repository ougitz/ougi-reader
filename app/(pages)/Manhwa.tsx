import { spUpdateManhwaViews } from '@/lib/supabase'
import { 
  SafeAreaView, 
  ScrollView, 
  Text, 
  StyleSheet, 
  View,
  ActivityIndicator
} from 'react-native'
import React, { 
  useCallback,
  useEffect,   
  useRef,   
  useState
} from 'react'
import { dbReadManhwaById, dbUpdateManhwaViews } from '@/lib/database';
import RandomManhwaButton from '@/components/button/RandomManhwaButton';
import BugReportButton from '@/components/button/BugReportButton';
import ManhwaChapterList from '@/components/ManhwaChapterList';
import ManhwaAuthorsInfo from '@/components/ManhwaAuthorInfo';
import ReturnButton from '@/components/button/ReturnButton';
import ManhwaGenreInfo from '@/components/ManhwaGenreInfo';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { wp, hp, isColorDark } from '@/helpers/util';
import AddToLibray from '@/components/AddToLibray';
import HomeButton from '@/components/HomeButton';
import FastImage from 'react-native-fast-image';
import { useSQLiteContext } from 'expo-sqlite';
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors';
import { Manhwa } from '@/helpers/types'
import Toast from '@/components/Toast';
import ManhwaCommentSection from '@/components/ManhwaCommentSection';


interface ItemProps {
  text: string
  backgroundColor: string
  textColor?: string
}

const Item = ({text, backgroundColor, textColor = Colors.backgroundColor}: ItemProps) => {
  return (
    <View style={[styles.item, {backgroundColor}]} >
      <Text style={[AppStyle.textRegular, {color: textColor}]}>{text}</Text>
    </View>
  )
}


const ManhwaPage = () => {

  const db = useSQLiteContext()
  const params = useLocalSearchParams()
  const [manhwa, setManhwa] = useState<Manhwa | null>()
  const manhwa_id: number = parseInt(params.manhwa_id as any)  
  const iconColor = useRef(Colors.white)
  const textColor = useRef(Colors.backgroundColor)
  
  const init = useCallback(async () => {          
      await dbReadManhwaById(db, manhwa_id)
        .then(value => {
          if (value) {
            if (isColorDark(value.color)) {
              textColor.current = Colors.white
              iconColor.current = Colors.white
            } else {
              textColor.current = Colors.backgroundColor
              iconColor.current = value.color
            }
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

  return (
    <SafeAreaView style={[AppStyle.safeArea, {padding: 0}]} >
      <ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'always'} >
        {
          manhwa ?
          <>
            {/* Header */}
            <LinearGradient 
                colors={[manhwa.color, Colors.backgroundColor]}
                style={styles.linearBackground} />
            <View style={styles.topBar} >
                <HomeButton color={iconColor.current} />
                <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 20}} >
                    <BugReportButton color={iconColor.current} title={manhwa.title} />                    
                    <RandomManhwaButton color={iconColor.current} />
                    <ReturnButton color={iconColor.current} />
                </View>
            </View>

            {/* Manhwa Info */}
            <View style={styles.manhwaContainer}>
                
                <FastImage
                  source={{uri: manhwa.cover_image_url, priority: "high", cache: 'immutable'}} 
                  resizeMode={FastImage.resizeMode.cover} 
                  style={styles.image} />
                <View style={{alignSelf: "flex-start"}} >
                  <Text style={AppStyle.textManhwaTitle}>{manhwa!.title}</Text>
                  <Text style={AppStyle.textRegular}>{manhwa.descr}</Text>
                </View>
                
                <ManhwaAuthorsInfo manhwa_id={manhwa_id} />
                <ManhwaGenreInfo manhwa_id={manhwa_id} />
                <AddToLibray manhwa_id={manhwa_id} textColor={textColor.current} backgroundColor={manhwa.color} />

                <View style={{flexDirection: 'row', width: '100%', gap: 10, alignItems: "center", justifyContent: "flex-start"}} >
                  <Item text={manhwa.status} textColor={textColor.current} backgroundColor={manhwa.color} />
                  <Item text={`Views: ${manhwa.views}`} textColor={textColor.current} backgroundColor={manhwa.color} />
                </View>

                <ManhwaChapterList textColor={textColor.current} manhwa={manhwa} />
                <ManhwaCommentSection manhwa={manhwa} />
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