import React, { 
  useEffect, 
  useRef, 
  useState 
} from 'react'
import { 
  ActivityIndicator, 
  SafeAreaView,
  StyleSheet,
  Text,
  View 
} from 'react-native'
import { useAuthState } from '@/store/authStore'
import { Image } from 'expo-image';
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
import { AppStyle } from '@/styles/AppStyles';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import {   
  spFetchUser,
  spGetSession  
} from '@/lib/supabase';
import {
  dbShouldUpdateTable,  
  dbUpdateDB,
  dbInit
} from '@/database/db';


const App = () => {
  
  const { login, logout } = useAuthState()
  const [updatingDB, setUpdatingDB] = useState(false)

  const initialized = useRef(false)

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

    await dbInit()

    if (await dbShouldUpdateTable('manhwas')) {
      setUpdatingDB(true)
      await dbUpdateDB()
      setUpdatingDB(false)
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
      {
        updatingDB ?
        <View style={{alignItems: "center", justifyContent: "center", gap: 10}} >
          <Image source={require("@/assets/images/loading1.gif")} style={styles.image} />
          <Text style={AppStyle.textHeader}>updating database...</Text>
        </View> :
        <ActivityIndicator size={48} color={Colors.white}/>
      }
      </View>
    </SafeAreaView>
  )
}

export default App

const styles = StyleSheet.create({
  image: {
    width: 164,
    height: 164,
    borderRadius: 12
  }
})
