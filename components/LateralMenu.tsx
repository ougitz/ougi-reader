import { 
    ActivityIndicator,
    Linking, 
    Pressable, 
    ScrollView, 
    StyleSheet,
    Text, 
    View 
} from 'react-native'
import { dbReadRandomManhwa, dbUpdateDatabase, dbShouldUpdate, dbCheckSecondsSinceLastRefresh } from '@/lib/database'
import { ToastNoInternet, ToastUpdateDatabase, ToastWaitDatabase } from '@/helpers/ToastMessages'
import { choice, hasInternetAvailable, hp, wp } from '@/helpers/util'
import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAuthState } from '@/store/authState'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import React, { useState } from 'react'
import { Manhwa } from '@/model/Manhwa'
import { router } from 'expo-router'
import CloseBtn from './CloseBtn'



const ICON_COLOR = Colors.white
const ICON_SIZE = 26


interface OptionProps {
    onPress: () => void
    iconColor?: string
    title: string
    iconName: string
}


const Option = ({onPress, title, iconName, iconColor = Colors.white}: OptionProps) => {

    const [loading, setLoading] = useState(false)

    const p = async () => {
        setLoading(true)
        await onPress()
        setLoading(false)
    }

    return (
        <Pressable 
            onPress={p} 
            style={[styles.link, {paddingVertical: 8, paddingHorizontal: 6, borderRadius: 4}]} 
            hitSlop={AppConstants.hitSlop} >
            <Text style={[AppStyle.textRegular]}>{title}</Text>
            {
                loading ?
                <ActivityIndicator size={ICON_SIZE} color={ICON_COLOR} /> :
                <Ionicons name={iconName as any} size={ICON_SIZE} color={iconColor} />
            }
        </Pressable>
    )
}


interface LateralMenuProps {
    closeMenu: () => any
}

const LateralMenu = ({closeMenu}: LateralMenuProps) => {

    const db = useSQLiteContext()
    const { session } = useAuthState()
    
    const randomRead = async () => {
        const manhwaList: Manhwa[] = await dbReadRandomManhwa(db)
        router.navigate({
            pathname: "/(pages)/Manhwa", 
            params: {manhwa_id: manhwaList[0].manhwa_id}
        })
    }

    const accountPage = () => {
        router.navigate("/(pages)/Account")
    }

    const updateDatabase = async () => {
        const hasInternet = await hasInternetAvailable()
        if (!hasInternet) { 
            ToastNoInternet()
            return 
        }

        const shouldUpdate = await dbShouldUpdate(db, 'database')
        
        if (!shouldUpdate) {
            const secondsUntilRefresh = await dbCheckSecondsSinceLastRefresh(db, 'database')
            ToastWaitDatabase(secondsUntilRefresh)            
        } else {
            ToastUpdateDatabase()
            try {
                await dbUpdateDatabase(db)
                router.replace("/(pages)/Home")
                return
            } catch (error) {
                console.log(error)
            }
        }        
    }

    const loginPage = () => {
        router.navigate("/(auth)/SignIn")
    }

    const readingHistoryPage = () => {
        router.navigate("/(pages)/ReadHistory")
    }

    const libraryPage = () => {
        router.navigate("/(pages)/Library")
    }

    const koreanTerms = () => {
        router.navigate("/KoreanTerms")
    }

    const openReddit = () => {
        Linking.openURL(AppConstants.PORNWHA_REDDIT_URL)
    }

    const openDonate = () => {
        router.navigate("/(pages)/Donate")
    }

    const openBugReport = () => {
        router.navigate("/(pages)/BugReport")
    }

    const openDisclaimer = () => {
        router.navigate("/(pages)/Disclaimer")
    }

    return (
        
        <ScrollView showsVerticalScrollIndicator={false} >
            <View style={styles.container} >
                <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between", marginBottom: 10}} >
                    <Text style={[AppStyle.textHeader, {color: Colors.orange, fontFamily: "LeagueSpartan_600SemiBold"}]}>Menu</Text>
                    <CloseBtn onPress={closeMenu} style={{padding: 2}} />
                </View>
            
                {
                    session ? 
                    <Option 
                        onPress={accountPage} 
                        title='Account' 
                        iconName='person-outline'
                        iconColor={Colors.accountColor}
                    />
                        :
                    <Option 
                        onPress={loginPage} 
                        title='Login' 
                        iconName='log-in'
                        iconColor={Colors.accountColor}
                    />
                }                

                <Option 
                    onPress={libraryPage} 
                    title='Library' 
                    iconName='library-outline'
                    iconColor={Colors.libraryColor}
                />
                
                <Option 
                    onPress={readingHistoryPage} 
                    title='Reading History' 
                    iconName='calendar-number-outline'
                    iconColor={Colors.readingHistoryColor}
                />

                <Option 
                    onPress={koreanTerms} 
                    title='Korean Terms' 
                    iconName='language-outline'
                    iconColor={Colors.translationColor}
                />
                
                <Option 
                    onPress={openReddit} 
                    title='Pornwha' 
                    iconName='logo-reddit'
                    iconColor={Colors.orange}
                />                

                <Option 
                    onPress={openBugReport} 
                    title='Bug Report' 
                    iconName='bug-outline'
                    iconColor={Colors.BugReportColor}
                />

                <Option 
                    onPress={openDonate} 
                    title='Donate' 
                    iconName='cash-outline'
                    iconColor={Colors.donateColor}
                />

                <Option 
                    onPress={openDisclaimer} 
                    title='Disclaimer' 
                    iconName='newspaper-outline'
                    iconColor={Colors.disclaimerColor}
                />

            </View>            
        </ScrollView>
    )
}

export default LateralMenu

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 10,
        paddingVertical: 40,
        paddingHorizontal: 20
    },
    link: {
        width: '100%',
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between"
    }
})