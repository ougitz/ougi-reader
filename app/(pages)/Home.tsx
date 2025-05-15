import { SafeAreaView, Pressable, Animated, StyleSheet,View, ScrollView } from 'react-native'
import MostViewedManhwasComponent from '@/components/ManhwaMostViewsGrid'
import ManhwasLastUpdateGrid from '@/components/ManhwasLastUpdateGrid'
import RandomManhwaButton from '@/components/RandomManhwaButton'
import RandomManhwaGrid from '@/components/RandomManhwaGrid'
import UpdateDatabase from '@/components/UpdateDatabase'
import { AppConstants } from '@/constants/AppConstants'
import LateralMenu from '@/components/LateralMenu'
import EmptyFooter from '@/components/EmptyFooter'
import Ionicons from '@expo/vector-icons/Ionicons'
import GenreGrid from '@/components/GenreGrid'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import { hp, wp } from '@/helpers/util'
import React, { useRef } from 'react'
import { router } from 'expo-router'
import Button from '@/components/Button'


const MENU_WIDTH = wp(70)
const ANIMATION_TIME = 300
const SCREEN_WIDTH = wp(100)
const SCREEN_HEIGHT = hp(100)


const Home = () => {
            
    const menuAnim = useRef(new Animated.Value(-MENU_WIDTH)).current 
    const backgroundAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current

    const menuVisible = useRef(false)

    const searchPress = () => {
        router.navigate("/(pages)/SearchManhwa")
    }

    const openMenu = () => {
        Animated.timing(menuAnim, {
            toValue: 0,
            duration: ANIMATION_TIME,      
            useNativeDriver: false
        }).start(() => {
            menuVisible.current = true
        })
        Animated.timing(backgroundAnim, {
            toValue: 0,
            duration: ANIMATION_TIME * 1.2,
            useNativeDriver: false
        }).start(() => {
            
        })
    }

    const closeMenu = () => {
        Animated.timing(menuAnim, {
            toValue: -MENU_WIDTH,
            duration: ANIMATION_TIME,
            useNativeDriver: false
        }).start(() => {
            menuVisible.current = false
        })
        Animated.timing(backgroundAnim, {
            toValue: -SCREEN_WIDTH,
            duration: ANIMATION_TIME,
            useNativeDriver: false
        }).start(() => {
            
        })
    }  

    const toggleMenu = () => {
        menuVisible.current ? closeMenu() : openMenu()
    }        
    
    return (
        <SafeAreaView style={AppStyle.safeArea} >

            {/* Header */}
            <TopBar title='Ougi' titleColor={Colors.orange} >
                <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 20}} >
                    <UpdateDatabase/>
                    <Button iconName='search-outline' onPress={searchPress} />                    
                    <RandomManhwaButton color={Colors.white} size={28} />
                    <Button iconName='options-outline' onPress={toggleMenu} />                    
                </View>
            </TopBar>

            {/* Content */}
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
                <GenreGrid/>
                <View style={{width: '100%', gap: 20, marginTop: 20}} >
                    <ManhwasLastUpdateGrid/>
                    <MostViewedManhwasComponent/>
                    <RandomManhwaGrid/>
                </View>
                <EmptyFooter/>
            </ScrollView>            
            
            {/* Lateral Menu */}
            <Animated.View style={[styles.menuBackground, { width: SCREEN_WIDTH, transform: [{ translateX: backgroundAnim }] }]}>
                <Pressable onPress={closeMenu} style={{width: '100%', height: '100%'}} />
            </Animated.View>
            <Animated.View style={[styles.sideMenu, { width: MENU_WIDTH, transform: [{ translateX: menuAnim }] }]}>
                <LateralMenu closeMenu={closeMenu}/>
            </Animated.View>

        </SafeAreaView>
    )
}

export default Home

const styles = StyleSheet.create({
    sideMenu: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,        
        backgroundColor: Colors.backgroundColor,
        elevation: 5,
        shadowColor: Colors.almostBlack,
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 5,    
        zIndex: 100
    },
    menuBackground: {
        position: 'absolute',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        top: 0,
        left: 0,        
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        elevation: 4,        
        zIndex: 90
    }    
})