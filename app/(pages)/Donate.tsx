import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/ReturnButton'

const Donate = () => {

  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Donate' >
            <ReturnButton/>
        </TopBar>
    </SafeAreaView>
  )
}

export default Donate

const styles = StyleSheet.create({})