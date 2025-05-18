import ChangeProfileInfoForm from '@/components/form/ChangeProficleInfoForm'
import { SafeAreaView, StyleSheet, View } from 'react-native'
import ReturnButton from '@/components/button/ReturnButton'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import { useAuthState } from '@/store/authState';
import React from 'react'
import FastImage from 'react-native-fast-image'


const Account = () => {

  const { user } = useAuthState()    
  
  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Account' titleColor={Colors.accountColor} >
        <ReturnButton color={Colors.accountColor} />
      </TopBar>
      <View style={{width: '100%', alignItems: "center", justifyContent: "center"}} >
        <FastImage 
          source={{uri: user?.image_url, priority: 'high'}} 
          style={{width: 128, height: 128}}
          resizeMode='cover' />
      </View>
      <ChangeProfileInfoForm/>
    </SafeAreaView>
  )
  
}

export default Account

const styles = StyleSheet.create({})