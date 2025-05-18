import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Text, SafeAreaView, View } from 'react-native'
import { useAuthState } from '@/store/authState'
import React, { useEffect} from 'react'
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
import { 
  dbShouldUpdate, 
  dbUpdateDatabase, 
  dbPopulateReadingStatusTable, 
  dbGetAppVersion 
} from '@/lib/database';
import { spFetchUser, spGetReleases, spGetSession } from '@/lib/supabase';
import { SQLiteDatabase, useSQLiteContext } from 'expo-sqlite';
import { useAppVersionState } from '@/store/appReleasesState';
import { ToastNoInternet } from '@/helpers/ToastMessages';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppStyle } from '@/styles/AppStyles';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';


const App = () => {
  
  const { login, logout } = useAuthState()    
  const { setLocalVersion, setAllReleases } = useAppVersionState()
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

    const user = await spFetchUser(session.user.id)
    
    if (user) {
      login(user, session)
    } else {
      console.log("error fetching user", session.user.id)
      logout()
    }
    
    await dbPopulateReadingStatusTable(db, session.user.id)
  }

  const init = async () => {    

    const state: NetInfoState = await NetInfo.fetch()

    if (!state.isConnected) {
      ToastNoInternet()
      router.replace("/(pages)/Home")
      return
    }

    await dbGetAppVersion(db).then(value => setLocalVersion(value))
    spGetReleases().then(values => setAllReleases(values))
    await initSession()
    
    const shouldUpdate = await dbShouldUpdate(db, 'database')
    if (shouldUpdate) {
      await dbUpdateDatabase(db)
    }
  
    router.replace("/(pages)/Home")
  }

  useEffect(
    () => {
      if (fontsLoaded) { init() }
    },
    [fontsLoaded]
  )  

  return (
    <SafeAreaView style={[AppStyle.safeArea, {padding: 0}]} >
      <View style={{flex: 1, alignItems: "center", justifyContent: "center", gap: 10}} >
        <Ionicons name='cloud-download-outline' size={42} color={Colors.white} />
        <Text style={{fontSize: 16, color: Colors.white}} >Downloading database...</Text>
      </View>      
    </SafeAreaView>
  )

}


export default App
