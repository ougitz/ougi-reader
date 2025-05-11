import { AppConstants } from '@/constants/AppConstants'
import { Pressable, StyleSheet } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import React from 'react'


const HomeButton = ({iconColor = Colors.white}: {iconColor?: string}) => {

  return (
    <Pressable 
      onPress={() => router.replace('/(pages)/Home')} 
      hitSlop={AppConstants.hitSlopLarge} 
      style={styles.container} >
        <Ionicons name='home' size={22} color={iconColor} />
    </Pressable>
  )
}

export default HomeButton

const styles = StyleSheet.create({
  container: {
    padding: 10, 
    borderRadius: 4, 
    backgroundColor: Colors.almostBlack
  }
})