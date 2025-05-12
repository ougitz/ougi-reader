import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

interface EmptyFooterProps {
    height?: number
}


const EmptyFooter = ({height = 60}: EmptyFooterProps) => {
  return (
    <View style={{width: '100%', height}} />
  )
}

export default EmptyFooter

const styles = StyleSheet.create({})