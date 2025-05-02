import React, { 
  useEffect, 
  useRef, 
  useState 
} from 'react'
import { 
  ActivityIndicator, 
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
import { AppStyle } from '@/styles/AppStyles';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import {   
  spFetchUser,
  spGetSession  
} from '@/lib/supabase';
import Toast from '@/components/Toast';
import { sleep } from '@/helpers/util';


const App = () => {
  
  const { login } = useAuthState()  

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

    const state: NetInfoState = await NetInfo.fetch()

    if (!state.isConnected) {
      Toast.show({title: 'Warning', message: 'You dont have connection to internet', type: 'info'})
      await sleep(1500)
    } else {
      const session = await spGetSession()
    
      if (session) { 
          await spFetchUser(session.user.id)
            .then(user => {
              if (!user) {
                console.log("error fetching user", session.user.id)
              } else {
                login(user, session)
              }
            })
      }
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

const styles = StyleSheet.create({
  image: {
    width: 164,
    height: 164,
    borderRadius: 164
  }
})
