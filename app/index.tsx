import React, { useEffect} from 'react'
import {
  Text,
  SafeAreaView,
  StyleSheet,  
  View 
} from 'react-native'
import { useAuthState } from '@/store/authState'
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import {
  useFonts,
  LeagueSpartan_100Thin,
  LeagueSpartan_200ExtraLight,
  LeagueSpartan_300Light,
  LeagueSpartan_400Regular,
  LeagueSpartan_500Medium,
  LeagueSpartan_600SemiBold,
  LeagueSpartan_700Bold,
  LeagueSpartan_800ExtraBold,
  LeagueSpartan_900Black,
} from '@expo-google-fonts/league-spartan';
import { spFetchUser, spGetSession } from '@/lib/supabase';
import { AppStyle } from '@/styles/AppStyles';
import { router } from 'expo-router';
import { sleep } from '@/helpers/util';
import { ToastNoInternet } from '@/helpers/ToastMessages';
import { SQLiteDatabase, useSQLiteContext } from 'expo-sqlite';
import { Image } from 'expo-image';


const App = () => {
  
  const { login } = useAuthState()    
  const db: SQLiteDatabase = useSQLiteContext();

  let [fontsLoaded] = useFonts({
      LeagueSpartan_100Thin,
      LeagueSpartan_200ExtraLight,
      LeagueSpartan_300Light,
      LeagueSpartan_400Regular,
      LeagueSpartan_500Medium,
      LeagueSpartan_600SemiBold,
      LeagueSpartan_700Bold,
      LeagueSpartan_800ExtraBold,
      LeagueSpartan_900Black,
  });

  const initSession = async () => {
    const session = await spGetSession()
    if (!session) { return }

    spFetchUser(session.user.id)
      .then(user => user ?
          login(user, session) :
          console.log("error fetching user", session.user.id)
    )
  }

  const init = async () => {    

    const state: NetInfoState = await NetInfo.fetch()

    if (!state.isConnected) {
      ToastNoInternet()
      await sleep(1500)
      return
    }

    await initSession()
    
    // router.replace("/(pages)/Home")
  }

  useEffect(
    () => {
      if (fontsLoaded) { init() }
    },
    [fontsLoaded]
  )

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
        <Image source={require('@/assets/images/loading2.gif')} style={styles.image} />
        <Text style={AppStyle.textRegular}>Loading database...</Text>
      </View>
    </SafeAreaView>
  )

}


export default App

const styles = StyleSheet.create({
  image: {
    width: 164,
    height: 164,
    borderRadius: 164
  }
})
