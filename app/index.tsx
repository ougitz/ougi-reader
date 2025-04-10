import { 
  ActivityIndicator, 
  SafeAreaView,
  View 
} from 'react-native'
import React, { useEffect, useRef } from 'react'
import { useAuthState } from '@/store/authStore'
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
import GenreModel from '@/database/models/GenreModel'
import { AppStyle } from '@/styles/AppStyles';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import {   
  spFetchUser,
  spGetSession  
} from '@/lib/supabase';
import { 
  dbCreateLastUpdate, 
  dbListTable, 
  dpUpsertManhwas, 
  dbShouldUpdateTable, 
  dbUpsertGenres 
} from '@/database/db';
import ManhwaModel from '@/database/models/ManhwaModel';
import ChapterModel from '@/database/models/ChapterModel';

const App = () => {
  
  const initialized = useRef(false)
  const { login, logout } = useAuthState()  

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

  const init = async () => {
    
    if (initialized.current) { return }
    
    initialized.current = true

    await dbCreateLastUpdate('genres', 24)
    await dbCreateLastUpdate('manhwas', 8)

    if (await dbShouldUpdateTable('genres')) {
      await dbUpsertGenres()
    }

    if (await dbShouldUpdateTable('manhwas')) {
      await dpUpsertManhwas()
    }    

    const session = await spGetSession()

    if (session) {

      await spFetchUser(session.user.id)
        .then(username => login(username, session))
        
    } else {
      logout()
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
    <SafeAreaView style={AppStyle.safeArea} >
      <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
        <ActivityIndicator size={48} color={Colors.white}/>
      </View>
    </SafeAreaView>
  )
}

export default App
