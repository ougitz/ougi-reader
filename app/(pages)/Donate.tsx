import { 
  ActivityIndicator, 
  Pressable, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  View 
} from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { spGetDonationMethods } from '@/lib/supabase'
import ReturnButton from '@/components/ReturnButton'
import Ionicons from '@expo/vector-icons/Ionicons'
import { DonateMethod } from '@/helpers/types'
import { AppStyle } from '@/styles/AppStyles'
import * as Clipboard from 'expo-clipboard'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import Toast from '@/components/Toast'


const DonateMethodComponent = ({donateMethod}: {donateMethod: DonateMethod}) => {

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(donateMethod.value);
    Toast.show({title: "Copied to clipboard!", message: "", type: "success"})
  }

  return (
    <Pressable onPress={copyToClipboard} style={{gap: 10}} >
      <View style={{width: "100%", flexDirection: 'row', alignItems: "center", gap: 10, justifyContent: "flex-start", alignSelf: "flex-start"}} >
        <Text style={[AppStyle.textHeader, {color: Colors.orange}]}>{donateMethod.method}</Text>
        <Ionicons name='copy-outline' size={28} color={Colors.orange} />
      </View>
      <Text style={AppStyle.textRegular}>{donateMethod.value}</Text>
    </Pressable>
  )
}


const Donate = () => {  

  const [donateMethods, setDonateMethods] = useState<DonateMethod[]>([])
  const [loading, setLoading] = useState(false)

  const init = useCallback(async () => {
    setLoading(true)
    await spGetDonationMethods().then(values => setDonateMethods(values))
    setLoading(false)
  }, [])

  useEffect(() => {
    init()
  }, [])

  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Donate' titleColor={Colors.donateColor} >
            <ReturnButton color={Colors.donateColor} />
        </TopBar>

        {
          loading ?
          
          <ActivityIndicator size={32} color={Colors.white} /> 
          
          :

          <View style={{flex: 1, gap: 20}} >

            {
              donateMethods.map((item, index) => <DonateMethodComponent key={index} donateMethod={item} />)
            }

            <View style={{width: '100%', height: 2, backgroundColor: Colors.donateColor}} />

            <View style={{gap: 10}} >
              <Text style={AppStyle.textRegular} >
                Ougi contains no paid subscriptions, in-app purchases, or advertising interruptions—every feature is offered entirely free of charge.
              </Text>
              <Text style={AppStyle.textRegular} >
                However, operating and maintaining the servers that store and deliver thousands of images and user data does incur ongoing expenses.
              </Text>
              <Text style={AppStyle.textRegular} >
                To ensure that Ougi continues running smoothly and to fund future enhancements, we kindly invite you to consider making a voluntary contribution. Your support is completely optional, but any gift helps us keep delivering the best possible experience.
              </Text>
              <Text style={AppStyle.textRegular} >
                Your support is completely optional, but any gift helps us keep delivering the best possible experience.
              </Text>
            </View>
          </View>
        }

    </SafeAreaView>
  )
}

export default Donate

const styles = StyleSheet.create({})