import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { AppStyle } from '@/styles/AppStyles'
import React from 'react'
import TopBar from '@/components/TopBar'
import HomeButton from '@/components/HomeButton'
import { useAuthState } from '@/store/authState'
import { supabase } from '@/lib/supabase'
import { AppConstants } from '@/constants/AppConstants'
import { router } from 'expo-router'
import ReturnButton from '@/components/ReturnButton'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import { dbClearTable } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import { ToastSuccess } from '@/helpers/ToastMessages'


const Account = () => {

  const { user, session, logout } = useAuthState()
  const db = useSQLiteContext()
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    await dbClearTable(db, 'reading_status')
    logout()
    ToastSuccess()
    router.replace("/(pages)/Home")
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Account' >
        <ReturnButton/>  
      </TopBar>
      <Pressable onPress={handleLogout} hitSlop={AppConstants.hitSlopLarge} >
        <View style={{width: '100%', alignItems: "center", justifyContent: "center"}} >
          <Ionicons name='person-circle' size={128} color={Colors.white} />
          <Text style={AppStyle.textHeader}>{user ? user.username : ''}</Text>
          <Text style={AppStyle.textHeader}>{session ? session.user.email : ''}</Text>
        </View>
        <View style={{marginTop: 100}} />
        <Pressable onPress={handleLogout} hitSlop={AppConstants.hitSlopLarge} >
          <Text style={AppStyle.textRegular}>
            Logout
          </Text>
        </Pressable>
      </Pressable>
    </SafeAreaView>
  )
}

export default Account

const styles = StyleSheet.create({})