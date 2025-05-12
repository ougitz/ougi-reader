import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable } from 'react-native'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import { AppStyle } from '@/styles/AppStyles'
import React from 'react'


interface HomeButtonProps {
  size?: number
  color?: string
}

const HomeButton = ({size = 28, color = Colors.white}: HomeButtonProps) => {

  return (
    <Pressable 
      onPress={() => router.replace('/(pages)/Home')} 
      hitSlop={AppConstants.hitSlopLarge}
      style={AppStyle.buttonBackground} >
        <Ionicons name='home' size={size} color={color} />
    </Pressable>
  )
}

export default HomeButton