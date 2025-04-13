import { Pressable, StyleSheet } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import React from 'react'


const ReturnButton = () => {
  return (
    <Pressable 
      style={styles.container}
      onPress={() => router.back()} 
      hitSlop={AppConstants.hitSlopLarge} >
        <Ionicons name='return-down-back-outline' size={28} color={Colors.white} />
    </Pressable>
  )
}

export default ReturnButton

const styles = StyleSheet.create({
  container: {
    padding: 6,
    backgroundColor: Colors.almostBlack,
    borderRadius: 32
  }
})