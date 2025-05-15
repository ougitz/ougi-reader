import { Pressable, StyleSheet } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import React from 'react'


interface ButtonProps {
    iconName: string
    onPress: () => any
    iconSize?: number
    iconColor?: string
}


const Button = ({iconName, onPress, iconSize = 28, iconColor = Colors.white}: ButtonProps) => {

  return (
    <Pressable onPress={onPress} hitSlop={AppConstants.hitSlop} >
        <Ionicons name={iconName as any} size={iconSize} color={iconColor} />
    </Pressable>
  )

}

export default Button

const styles = StyleSheet.create({})