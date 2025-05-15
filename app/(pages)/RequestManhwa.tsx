import RequestManhwaForm from '@/components/form/RequestManhwaForm'
import { SafeAreaView, StyleSheet } from 'react-native'
import ReturnButton from '@/components/ReturnButton'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import React from 'react'


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