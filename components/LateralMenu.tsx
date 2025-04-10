import { 
    Linking, 
    Pressable, 
    StyleSheet,
    Text, 
    View 
} from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import { useReadingState } from '@/store/readingStore'
import { spFetchRandomManhwa } from '@/lib/supabase'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAuthState } from '@/store/authStore'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import CloseBtn from './CloseBtn'
import React from 'react'


interface LateralMenuProps {
    closeMenu: () => void
}


const ICON_COLOR = Colors.white
const ICON_SIZE = 26


const LateralMenu = ({closeMenu}: LateralMenuProps) => {

    const { session } = useAuthState()
    const { setManhwa } = useReadingState()


    const randomRead = async () => {
        const manhwaList = await spFetchRandomManhwa(0, 1, 0)
        setManhwa(manhwaList[0])
        closeMenu()
        router.navigate("/(pages)/Manhwa")
    }

    const accountPage = () => {
        closeMenu()
        router.navigate("/(pages)/Account")
    }

    const loginPage = () => {
        closeMenu()
        router.navigate("/(auth)/SignIn")
    }

    const readingHistoryPage = () => {
        closeMenu()
        router.navigate("/(pages)/ReadHistory")
    }

    const libraryPage = () => {
        closeMenu()
        router.navigate("/(pages)/Library")
    }

    return (
        <View style={styles.container} >
            
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between", marginBottom: 30}} >
                <Text style={AppStyle.textHeader}>Menu</Text>
                <CloseBtn onPress={closeMenu} style={{padding: 2}} />
            </View>

            {
                session ? 
                <Pressable 
                    onPress={accountPage} 
                    style={styles.link} 
                    hitSlop={AppConstants.hitSlopLarge} >
                    <Text style={AppStyle.textRegular}>Account</Text>
                    <Ionicons name='person-outline' size={ICON_SIZE} color={ICON_COLOR} />
                </Pressable>
                    :
                <Pressable 
                    onPress={loginPage} 
                    style={styles.link} 
                    hitSlop={AppConstants.hitSlopLarge} >
                    <Text style={AppStyle.textRegular}>Login</Text>
                    <Ionicons name='log-in' size={ICON_SIZE} color={ICON_COLOR} />
                </Pressable>

            }

            <Pressable 
                onPress={libraryPage} 
                style={styles.link} 
                hitSlop={AppConstants.hitSlopLarge} >
                <Text style={AppStyle.textRegular}>Library</Text>
                <Ionicons name='library-outline' size={ICON_SIZE} color={ICON_COLOR} />
            </Pressable>        

            <Pressable 
                onPress={randomRead} 
                style={styles.link} 
                hitSlop={AppConstants.hitSlopLarge} >
                <Text style={AppStyle.textRegular}>Random Manhwa</Text>
                <Ionicons name='dice-outline' size={ICON_SIZE} color={ICON_COLOR} />
            </Pressable>

            <Pressable 
                onPress={readingHistoryPage}
                style={styles.link} 
                hitSlop={AppConstants.hitSlopLarge} >
                <Text style={AppStyle.textRegular}>Read history</Text>
                <Ionicons name='reader-outline' size={ICON_SIZE} color={ICON_COLOR} />
            </Pressable>

            <Pressable 
                onPress={() => Linking.openURL("https://github.com/VitorTz/ougi-reader")} 
                style={styles.link} 
                hitSlop={AppConstants.hitSlopLarge} >
                <Text style={AppStyle.textRegular}>Github</Text>
                <Ionicons name='logo-github' size={ICON_SIZE} color={ICON_COLOR} />
            </Pressable>

        </View>        
    )
}

export default LateralMenu

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 40,
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