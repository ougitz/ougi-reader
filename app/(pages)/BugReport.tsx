import BugReportForm from '@/components/form/BugReportForm'
import { StyleSheet, SafeAreaView } from 'react-native'
import ReturnButton from '@/components/ReturnButton'
import { useLocalSearchParams } from 'expo-router'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import React from 'react'


const BugReport = () => {

    const params = useLocalSearchParams()
    const title = params.title as any

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Bug Report' titleColor={Colors.BugReportColor} >
                <ReturnButton color={Colors.BugReportColor} />
            </TopBar>
            <BugReportForm title={title}  />
        </SafeAreaView>
    )
}

export default BugReport

const styles = StyleSheet.create({})