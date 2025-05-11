import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { AppStyle } from '@/styles/AppStyles'
import React, { useState } from 'react'
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
import ChangeProfileInfoForm from '@/components/form/ChangeProficleInfoForm'


const Account = () => {

  const { user, session, logout } = useAuthState()
  const db = useSQLiteContext()
  
  const [loading, setLoading] = useState(false)
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    await dbClearTable(db, 'reading_status')
    logout()
    ToastSuccess()
    router.replace("/(pages)/Home")
  }

  return (
    <SafeAreaView style={AppStyle.safeArea} >
      <TopBar title='Account' titleColor={Colors.accountColor} >
        <View style={{flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "center"}} >
          <ReturnButton iconColor={Colors.accountColor} />
        </View>
      </TopBar>
      <ChangeProfileInfoForm/>
    </SafeAreaView>
  )
}

export default Account

const styles = StyleSheet.create({})