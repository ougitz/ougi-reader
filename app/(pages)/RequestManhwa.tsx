import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import ReturnButton from '@/components/ReturnButton'
import RequestManhwaForm from '@/components/form/RequestManhwaForm'

const RequestManhwa = () => {
  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Request Manhwa' titleColor={Colors.requestManhwaColor} >
            <ReturnButton color={Colors.requestManhwaColor} />
        </TopBar>
        <RequestManhwaForm/>
    </SafeAreaView>
  )
}

export default RequestManhwa

const styles = StyleSheet.create({})