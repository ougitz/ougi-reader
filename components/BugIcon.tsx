import { StyleSheet } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'


interface BugIconProps {
  size?: number
  color?: string
}


const BugIcon = ({size = 28, color = Colors.BugReportColor}: BugIconProps) => {
  return (
    <Ionicons name='bug-outline' color={color} size={size} />
  )
}


export default BugIcon