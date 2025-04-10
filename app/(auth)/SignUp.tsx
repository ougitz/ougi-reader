import { SafeAreaView, StyleSheet } from 'react-native'
import SignUpForm from '@/components/form/SignUpForm'
import HomeButton from '@/components/HomeButton'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'
import React from 'react'


const SignInPage = () => {
    
    return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='SignIn' >
            <HomeButton/>
        </TopBar>
        <SignUpForm/>
    </SafeAreaView>
    )
}

export default SignInPage

const styles = StyleSheet.create({})