import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Colors } from '@/constants/Colors'


const BugIcon = ({size}: {size: number}) => {
  return (
    <Ionicons name='bug-outline' color={Colors.BugReportColor} size={size} />
  )
}


export default BugIcon

const styles = StyleSheet.create({})