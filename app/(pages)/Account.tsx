import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { AppStyle } from '@/styles/AppStyles'
import React from 'react'
import TopBar from '@/components/TopBar'
import HomeButton from '@/components/HomeButton'
import { useAuthState } from '@/store/authState'
import { supabase } from '@/lib/supabase'
import { AppConstants } from '@/constants/AppConstants'
import { router } from 'expo-router'


const Account = () => {

  const { user, session, logout } = useAuthState()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    router.replace("/(pages)/Home")
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Account' >
        <HomeButton/>  
      </TopBar>
      <Pressable onPress={handleLogout} hitSlop={AppConstants.hitSlopLarge} >
        <Text style={AppStyle.textRegular}>
          Logout
        </Text>
      </Pressable>
    </SafeAreaView>
  )
}

export default Account

const styles = StyleSheet.create({})