import { AppConstants } from '@/constants/AppConstants'
import { Pressable, StyleSheet } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import React from 'react'


const HomeButton = () => {
  return (
    <Pressable 
      onPress={() => router.replace('/(pages)/Home')} 
      hitSlop={AppConstants.hitSlopLarge} 
      style={styles.container} >
        <Ionicons name='home' size={20} color={Colors.white} />
    </Pressable>
  )
}

export default HomeButton

const styles = StyleSheet.create({
  container: {
    padding: 7, 
    borderRadius: 32, 
    backgroundColor: Colors.accentColor
  }
})