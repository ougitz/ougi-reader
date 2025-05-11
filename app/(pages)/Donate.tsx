import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { AppConstants } from '@/constants/AppConstants'
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

  const init = async () => {
    setLoading(true)
    await spGetDonationMethods().then(values => setDonateMethods(values))
    setLoading(false)
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Donate' titleColor={Colors.donateColor} >
            <ReturnButton iconColor={Colors.donateColor} />
        </TopBar>

        {
          loading ?
          <ActivityIndicator size={32} color={Colors.white} /> :
          <View style={{flex: 1, gap: 20}} >
            {
              donateMethods.map((item, index) => <DonateMethodComponent key={index} donateMethod={item} />)
            }
          </View>
        }

    </SafeAreaView>
  )
}

export default Donate

const styles = StyleSheet.create({})