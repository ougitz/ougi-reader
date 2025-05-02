import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { AppStyle } from '@/styles/AppStyles'
import React from 'react'
import TopBar from '@/components/TopBar'
import HomeButton from '@/components/HomeButton'


const Library = () => {
  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Library' >
        <HomeButton/>
      </TopBar>
    </SafeAreaView>
  )
}

export default Library

const styles = StyleSheet.create({})