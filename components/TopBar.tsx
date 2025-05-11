import { StyleSheet, Text, View } from 'react-native'
import { AppStyle } from '@/styles/AppStyles'
import React from 'react'
import { Colors } from '@/constants/Colors'


interface TopBarProps {
    title: string
    children?: React.JSX.Element
    titleColor?: string
}

const TopBar = ({title, children, titleColor = Colors.white}: TopBarProps) => {
  return (
    <View style={{width: '100%', flexDirection: 'row', marginVertical: 20, alignItems: "center", justifyContent: "space-between"}} >
        <Text style={[AppStyle.textHeader, {alignSelf: "flex-start", fontFamily: "LeagueSpartan_600SemiBold", maxWidth: '80%', color: titleColor}]}>{title}</Text>
        {children}
    </View>
  )
}

export default TopBar

const styles = StyleSheet.create({})