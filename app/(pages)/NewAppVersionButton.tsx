import { useAppVersionState } from '@/store/appVersionState'
import { AppConstants } from '@/constants/AppConstants'
import { Pressable, Text, View } from 'react-native'
import { AppStyle } from '@/styles/AppStyles'
import { AppVersion } from '@/helpers/types'
import { router } from 'expo-router'
import React from 'react'


const NewAppVersionButton = () => {
    
    const { localVersion, allVersions } = useAppVersionState()

    const latestVersion: AppVersion | null = allVersions.length > 0 ? allVersions[-1] : null
    const isNotLatestVersion = latestVersion && localVersion && latestVersion.version != localVersion

    const onPress = () => {
        router.navigate("/(pages)/Releases")
    }

    return (
        <>
            {
                isNotLatestVersion &&
                <View style={{width: '100%', alignItems: "center", justifyContent: "center"}} >
                    <Pressable onPress={onPress}  hitSlop={AppConstants.hitSlopLarge} >
                        <Text style={[AppStyle.textRegular, {textDecorationLine: "underline"}]}>New app version available!</Text>
                    </Pressable>
                </View>
            }
        </>
    )
}

export default NewAppVersionButton