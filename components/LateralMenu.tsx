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
import { useReadingState } from '@/store/manhwaReadingState'
import { spFetchRandomManhwa } from '@/lib/supabase'
import { hasInternetAvailable } from '@/helpers/util'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAuthState } from '@/store/authState'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import CloseBtn from './CloseBtn'
import React, { useState } from 'react'
import { Manhwa } from '@/model/Manhwa'
import { dbReadRandomManhwa, dbUpdateDatabase, dbShouldUpdate, dbCheckSecondsSinceLastRefresh } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'
import Toast from './Toast'
import { ToastNoInternet, ToastUpdateDatabase, ToastWaitDatabase } from '@/helpers/ToastMessages'



const ICON_COLOR = Colors.white
const ICON_SIZE = 26


interface OptionProps {
    onPress: () => void
    title: string
    iconName: string
}

const Option = ({onPress, title, iconName}: OptionProps) => {

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
            hitSlop={AppConstants.hitSlopLarge} >
            <Text style={AppStyle.textRegular}>{title}</Text>
            {
                loading ?
                <ActivityIndicator size={ICON_SIZE} color={ICON_COLOR} /> :
                <Ionicons name={iconName as any} size={ICON_SIZE} color={ICON_COLOR} />
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

    return (
        
        <ScrollView>
            <View style={styles.container} >
                <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between", marginBottom: 10}} >
                    <Text style={AppStyle.textHeader}>Menu</Text>
                    <CloseBtn onPress={closeMenu} style={{padding: 2}} />
                </View>
            
                {
                    session ? 
                    <Option 
                        onPress={accountPage} 
                        title='Account' 
                        iconName='person-outline'
                    />
                        :
                    <Option 
                        onPress={loginPage} 
                        title='Login' 
                        iconName='log-in'
                    />
                }

                <Option 
                    onPress={updateDatabase} 
                    title='Update database' 
                    iconName='layers-outline'
                    />

                <Option 
                    onPress={libraryPage} 
                    title='Library' 
                    iconName='library-outline'
                />

                <Option 
                    onPress={randomRead} 
                    title='Random' 
                    iconName='dice-outline'
                />
                
                <Option 
                    onPress={readingHistoryPage} 
                    title='Reading History' 
                    iconName='reader-outline'
                />

                <Option 
                    onPress={koreanTerms} 
                    title='Korean Terms' 
                    iconName='language-outline'
                />
                
                <Option 
                    onPress={openReddit} 
                    title='Pornwha' 
                    iconName='logo-reddit'
                />

                <Option 
                    onPress={openDonate} 
                    title='Donate' 
                    iconName='cash-outline'
                />

            </View>
        </ScrollView>
    )
}

export default LateralMenu

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 30,
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