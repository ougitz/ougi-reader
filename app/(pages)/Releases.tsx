import { ActivityIndicator, Linking, Pressable, SafeAreaView, Text, View } from 'react-native'
import { useAppVersionState } from '@/store/appReleasesState'
import ReturnButton from '@/components/ReturnButton'
import { ToastError } from '@/helpers/ToastMessages'
import Ionicons from '@expo/vector-icons/Ionicons'
import { AppStyle } from '@/styles/AppStyles'
import { AppRelease } from '@/helpers/types'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import React from 'react'


const ReleaseItem = ({release}: {release: AppRelease}) => {

    const openUrl = async () => {
        try {
            await Linking.openURL(release.url)
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
            {release.descr && <Text style={AppStyle.textRegular}>{release.descr}</Text>}            
        </Pressable>
    )
}

const Releases = () => {

    const { localVersion, allReleases } = useAppVersionState()

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Releases' titleColor={Colors.releasesColor} >
                <ReturnButton color={Colors.releasesColor} />
            </TopBar>
            {
                localVersion && <Text style={[AppStyle.textRegular, {marginBottom: 10}]} >Your app version: {localVersion}</Text>
            }
            {
                allReleases.length == 0 ?
                <ActivityIndicator size={32} color={Colors.releasesColor} /> :
                <View style={{width: '100%', gap: 20, alignItems: "center", justifyContent: 'center'}} >
                    {
                        allReleases.map((item, index) => <ReleaseItem release={item} key={index} />)
                    }
                </View>
            }
        </SafeAreaView>
    )
}

export default Releases