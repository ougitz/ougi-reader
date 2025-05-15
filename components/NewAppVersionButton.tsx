import { useAppVersionState } from '@/store/appReleasesState'
import { AppConstants } from '@/constants/AppConstants'
import { Pressable, Text, View } from 'react-native'
import { AppStyle } from '@/styles/AppStyles'
import { AppRelease } from '@/helpers/types'
import { router } from 'expo-router'
import React from 'react'


const NewAppVersionButton = () => {
    
    const { localVersion, allReleases } = useAppVersionState()
    const latestVersion: AppRelease | null = allReleases.length > 0 ? allReleases[allReleases.length - 1] : null
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