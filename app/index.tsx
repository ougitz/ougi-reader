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
import Toast from '@/components/Toast';
import { sleep } from '@/helpers/util';


const App = () => {
  
  const { login } = useAuthState()
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

  const connectSupabase = async () => {
    const session = await spGetSession()
    
    if (!session) { return }

    await spFetchUser(session.user.id)
      .then(username => login(username, session))      
    
  }

  const updateLocalDB = async () => {
    if (await dbShouldUpdateTable('manhwas')) {
      setUpdatingDB(true)
      await dbUpdateDB()
      setUpdatingDB(false)
    }
  }

  const init = async () => {
    
    if (initialized.current) { return }
    
    initialized.current = true

    await dbInit()

    const state: NetInfoState = await NetInfo.fetch()

    if (!state.isConnected) {
      Toast.show({title: 'Warning', message: 'You dont have connection to internet', type: 'info'})
      await sleep(1500)
    } else {
        await connectSupabase()
        await updateLocalDB()
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
          <Image source={require("@/assets/images/loading2.gif")} style={styles.image} />
          <Text style={[AppStyle.textHeader, {fontSize: 22}]}>updating local database...</Text>
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
    borderRadius: 164
  }
})
