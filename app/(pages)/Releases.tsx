import { ActivityIndicator, Linking, Pressable, SafeAreaView, Text, View } from 'react-native'
import React from 'react'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import ReturnButton from '@/components/ReturnButton'
import { AppVersion } from '@/helpers/types'
import { useAppVersionState } from '@/store/appVersionState'
import { ToastError } from '@/helpers/ToastMessages'
import Ionicons from '@expo/vector-icons/Ionicons'


const ReleaseItem = ({release}: {release: AppVersion}) => {

    const openUrl = async () => {
        try {
            const supported = await Linking.canOpenURL(release.apk_url);
            if (supported) {
                await Linking.openURL(release.apk_url);
            } else {
                ToastError(`Cannot open this URL: ${release.apk_url}`)
            }
        } catch (error) {
            ToastError("Unable to open the browser")
        }
    };

    return (
        <Pressable onPress={openUrl} style={{width: '100%', padding: 10, paddingVertical: 12, borderRadius: 4, backgroundColor: Colors.gray}}>
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}} >
                <Text style={[AppStyle.textHeader, {color: Colors.releasesColor}]} >{release.version}</Text>
                <Ionicons name='download-outline' size={28} color={Colors.releasesColor} />                
            </View>            
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