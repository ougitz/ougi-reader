import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { AppStyle } from '@/styles/AppStyles'
import React from 'react'
import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/ReturnButton'


const SearchManhwa = () => {
  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Search' > 
        <ReturnButton/>
      </TopBar>
    </SafeAreaView>
  )
}

export default SearchManhwa

const styles = StyleSheet.create({})