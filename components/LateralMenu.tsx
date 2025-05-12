import { 
    ActivityIndicator,
    Linking, 
    Pressable, 
    ScrollView, 
    StyleSheet,
    Text, 
    View 
} from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import Ionicons from '@expo/vector-icons/Ionicons'
import { supabase } from '@/lib/supabase'
import { useAuthState } from '@/store/authState'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import React, { useState } from 'react'
import { router } from 'expo-router'
import CloseBtn from './CloseBtn'
import { ToastSuccess } from '@/helpers/ToastMessages'
import { dbClearTable } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'



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
            style={[styles.link, {paddingVertical: 10}]} 
            hitSlop={AppConstants.hitSlop} >
            {
                loading ?
                <ActivityIndicator size={ICON_SIZE} color={ICON_COLOR} /> :
                <Ionicons name={iconName as any} size={ICON_SIZE} color={iconColor} />
            }
            <Text style={[AppStyle.textRegular]}>{title}</Text>
        </Pressable>
    )
}


interface LateralMenuProps {
    closeMenu: () => any
}

const LateralMenu = ({closeMenu}: LateralMenuProps) => {
    
    const db = useSQLiteContext()
    const { session, logout } = useAuthState()
    
    const accountPage = () => {
        router.navigate("/(pages)/Account")
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

    const handleLogout = async () => {
        await supabase.auth.signOut()
        await dbClearTable(db, 'reading_status')
        logout()
        ToastSuccess()
        router.replace("/(pages)/Home")
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

                {
                    session &&
                    <Option 
                        onPress={handleLogout} 
                        title='Logout' 
                        iconName='log-out-outline'
                        iconColor={Colors.neonRed}
                    />
                }

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
        gap: 20,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "flex-start"
    }
})