import { StyleSheet, Text, View } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import React from 'react'


interface TitleProps {
    title: string
    iconName: string
}

const Title = ({title, iconName}: TitleProps) => {
  return (
    <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 10}} >
        <Text style={[AppStyle.textHeader, {fontSize: 24}]}>{title}</Text>
        <Ionicons name={iconName as any} size={28} color={Colors.white} />
    </View>
  )
}

export default Title
