import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'
import React from 'react'


interface CloseBtnProps {
    onPress: () => void
    style?: StyleProp<ViewStyle>
}


const CloseBtn = ({onPress, style}: CloseBtnProps) => {
  return (
    <Pressable
        onPress={onPress}
        hitSlop={AppConstants.hitSlopLarge}
        style={[styles.container, style]}>
        <Ionicons name='close' size={22} color={'white'} />
    </Pressable>
  )
}

export default CloseBtn

const styles = StyleSheet.create({
  container: {
    padding: 8, 
    borderRadius: 32, 
    backgroundColor: Colors.backgroundColor
  }
})