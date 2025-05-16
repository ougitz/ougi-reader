import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import { Pressable } from 'react-native'
import { router } from 'expo-router'
import BugIcon from '../BugIcon'
import React from 'react'


interface OpenBugReportButtonProps {
    size?: number
    color?: string
    backgroundColor?: string
    title?: string
}


const BugReportButton = ({
    title, 
    size = 28, 
    color = Colors.BugReportColor, 
    backgroundColor = Colors.backgroundColor
}: OpenBugReportButtonProps) => {

    const onPress = () => {
        router.navigate({
            pathname: "/(pages)/BugReport",
            params: title ? {title: title} : { }
        })
    }

    return (
        <Pressable onPress={onPress} style={[AppStyle.buttonBackground, {backgroundColor}]} >
            <BugIcon size={size} color={color} />
        </Pressable>
    )
}

export default BugReportButton
