import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import ReturnButton from '@/components/ReturnButton'
import { AppVersion } from '@/helpers/types'
import { useAppVersionState } from '@/store/appVersionState'
import { spGetAllAppVersions } from '@/lib/supabase'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Clipboard from 'expo-clipboard'
import Toast from '@/components/Toast'


const ReleaseItem = ({release}: {release: AppVersion}) => {

    const copyToClipboard = async (value: string) => {
        await Clipboard.setStringAsync(value);
        Toast.show({title: "Copied to clipboard!", message: "", type: "success"})   
    }

    return (
        <Pressable onPress={() => copyToClipboard(release.apk_url)} style={{width: '100%', padding: 10, borderRadius: 4, backgroundColor: Colors.gray}}>
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}} >
                <Text style={[AppStyle.textHeader, {color: Colors.releasesColor}]} >{release.version}</Text>
                <Ionicons name='copy-outline' size={28} color={Colors.releasesColor} />                
            </View>
            <Text style={AppStyle.textRegular} >{release.apk_url}</Text>
        </Pressable>
    )
}

const Releases = () => {

    const { localVersion, allVersions } = useAppVersionState()

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Releases' titleColor={Colors.releasesColor} >
                <ReturnButton color={Colors.releasesColor} />
            </TopBar>
            {
                localVersion && <Text style={[AppStyle.textRegular, {marginBottom: 10}]} >Your app version: {localVersion}</Text>
            }
            {
                allVersions.length == 0 ?
                <ActivityIndicator size={32} color={Colors.releasesColor} /> :
                <View style={{width: '100%', gap: 10, alignItems: "center", justifyContent: 'center'}} >
                    {
                        allVersions.map((item, index) => <ReleaseItem release={item} key={index} />)
                    }
                </View>
            }
        </SafeAreaView>
    )
}

export default Releases