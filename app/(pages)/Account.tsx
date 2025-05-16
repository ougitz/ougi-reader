import ChangeProfileInfoForm from '@/components/form/ChangeProficleInfoForm'
import { SafeAreaView, StyleSheet, View } from 'react-native'
import ReturnButton from '@/components/button/ReturnButton'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import React from 'react'


const Account = () => {

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Account' titleColor={Colors.accountColor} >
        <ReturnButton color={Colors.accountColor} />
      </TopBar>
      <ChangeProfileInfoForm/>
    </SafeAreaView>
  )
  
}

export default Account

const styles = StyleSheet.create({})