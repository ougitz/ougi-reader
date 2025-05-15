import { 
  ActivityIndicator, 
  Pressable, 
  SafeAreaView,
  Linking,
  Text, 
  View 
} from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { spGetDonationMethods } from '@/lib/supabase'
import { ToastError } from '@/helpers/ToastMessages'
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

  const iconName = donateMethod.action == "copy" ? "copy-outline" : "globe-outline"

  const openUrl = async () => {
    try {
        await Linking.openURL(donateMethod.value)
    } catch (error) {
      ToastError("Unable to open the browser")
    }
  };

  const onPress = async () => {
    switch (donateMethod.action) {
      case "copy":
        await copyToClipboard()
        break
      case "link":
        await openUrl()
        break
      default:
        break
    }
  }

  return (
    <Pressable onPress={onPress} style={{maxWidth: '100%', padding: 10, borderRadius: 4, backgroundColor: Colors.donateColor, gap: 10}} >
      <View style={{width: "100%", flexDirection: 'row', alignItems: "center", gap: 10, justifyContent: "space-between"}} >
        <Text style={[AppStyle.textHeader, {color: Colors.backgroundColor}]}>{donateMethod.method}</Text>
        <Ionicons name={iconName as any} size={28} color={Colors.backgroundColor} />
      </View>
      <Text adjustsFontSizeToFit={true} style={[AppStyle.textRegular, {color: Colors.backgroundColor}]}>{donateMethod.value}</Text>
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

            <View style={{gap: 10}} >
              <Text style={AppStyle.textRegular} >
                Ougi contains no paid subscriptions, in-app purchases, or advertising interruptions—every feature is offered entirely free of charge.
              </Text>
              <Text style={AppStyle.textRegular} >
                However, operating and maintaining the servers that store and deliver thousands of images and user data does incur ongoing expenses.
              </Text>
              <Text style={AppStyle.textRegular} >
                To ensure that Ougi continues running smoothly and to fund future enhancements, we kindly invite you to consider making a voluntary contribution.
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
