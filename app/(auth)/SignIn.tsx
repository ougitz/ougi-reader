import { SafeAreaView, StyleSheet } from 'react-native'
import HomeButton from '@/components/HomeButton'
import SignInForm from '@/components/form/SignInForm'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'
import React from 'react'



const SignInPage = () => {
    
    return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='SignIn' >
            <HomeButton/>
        </TopBar>
        <SignInForm/>
    </SafeAreaView>
    )
}

export default SignInPage

const styles = StyleSheet.create({})