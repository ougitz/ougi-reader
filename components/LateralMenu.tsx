import { 
    ActivityIndicator,
    Pressable, 
    ScrollView, 
    StyleSheet,
    Text, 
    View 
} from 'react-native'
import NewAppVersionButton from './button/NewAppVersionButton'
import { AppConstants } from '@/constants/AppConstants'
import { ToastSuccess } from '@/helpers/ToastMessages'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAuthState } from '@/store/authState'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyles'
import { dbClearTable } from '@/lib/database'
import { Colors } from '@/constants/Colors'
import { supabase } from '@/lib/supabase'
import React, { useState } from 'react'
import { router } from 'expo-router'
import CloseBtn from './CloseBtn'
import { wp } from '@/helpers/util'



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
            style={styles.link} 
            hitSlop={AppConstants.hitSlop} >
            <View style={{padding: 3, backgroundColor: iconColor, borderRadius: 4}} >
                {
                    loading ?
                        <ActivityIndicator size={ICON_SIZE} color={Colors.backgroundColor} /> :
                        <Ionicons name={iconName as any} size={ICON_SIZE} color={Colors.backgroundColor} />
                }
            </View>
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

    const openRequestManhwa = () => {
        router.navigate("/(pages)/RequestManhwa")
    }

    const openReleases = () => {
        router.navigate("/(pages)/Releases")
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
                    onPress={openDonate} 
                    title='Donate' 
                    iconName='cash-outline'
                    iconColor={Colors.donateColor}
                />

                <Option 
                    onPress={openRequestManhwa} 
                    title='Request Manhwa' 
                    iconName='megaphone-outline'
                    iconColor={Colors.requestManhwaColor}
                />

                <Option 
                    onPress={openReleases} 
                    title='Releases' 
                    iconName='git-branch-outline'
                    iconColor={Colors.releasesColor}
                />

                <Option 
                    onPress={openBugReport} 
                    title='Bug Report' 
                    iconName='bug-outline'
                    iconColor={Colors.BugReportColor}
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

                <View style={{alignSelf: "flex-start"}} >
                    <NewAppVersionButton/>
                </View>

            </View>            
        </ScrollView>
    )
}

export default LateralMenu

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 20,
        padding: wp(5),
        marginTop: 20, 
        marginBottom: 10, 
    },
    link: {
        width: '100%',
        gap: 16,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "flex-start"
    }
})