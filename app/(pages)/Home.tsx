import { 
    SafeAreaView, 
    Pressable, 
    Animated, 
    StyleSheet, 
    View, 
    ScrollView 
} from 'react-native'
import MostViewedManhwasComponent from '@/components/ManhwaMostViewsGrid'
import MangaRecommendationGrid from '@/components/MangaRecommendationGrid'
import ManhwasLastUpdateGrid from '@/components/ManhwasLastUpdateGrid'
import UpdateDatabase from '@/components/UpdateDatabase'
import { AppConstants } from '@/constants/AppConstants'
import LateralMenu from '@/components/LateralMenu'
import Ionicons from '@expo/vector-icons/Ionicons'
import GenreGrid from '@/components/GenreGrid'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import React, { useEffect, useRef, useState } from 'react'
import { router } from 'expo-router'
import { hp, wp } from '@/helpers/util'
import { dbClearDatabase, dbCleaTable, dbListTable, dbUserReadHistory } from '@/lib/database'
import { useSQLiteContext } from 'expo-sqlite'


const MENU_WIDTH = wp(60)
const ANIMATION_TIME = 300


const Home = () => {
    const db = useSQLiteContext()
    const menuAnim = useRef(new Animated.Value(-MENU_WIDTH)).current 
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
    }

    const closeMenu = () => {
        Animated.timing(menuAnim, {
            toValue: -MENU_WIDTH,
            duration: ANIMATION_TIME,
            useNativeDriver: false
        }).start(() => {
            menuVisible.current = false
        })
    }  

    const toggleMenu = () => {
        menuVisible.current ? closeMenu() : openMenu()
    }

    const init = async () => {
        
    }

    useEffect(
        () => {
            init()
        },
        []
    )
    
    return (
        <SafeAreaView style={[AppStyle.safeArea, {paddingBottom: 60}]} >
            <TopBar title='Ougi'>
                <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 20}} >
                    <UpdateDatabase/>
                    <Pressable onPress={searchPress} hitSlop={AppConstants.hitSlop} >
                        <Ionicons name='search-outline' size={28} color={'white'} />
                    </Pressable>
                    <Pressable onPress={toggleMenu} hitSlop={AppConstants.hitSlop} >
                        <Ionicons name='options-outline' size={28} color={'white'} />
                    </Pressable>
                </View>
            </TopBar>
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
                <GenreGrid/>
                <View style={{width: '100%', gap: 20, marginTop: 20}} >
                    <ManhwasLastUpdateGrid/>
                    <MostViewedManhwasComponent/>
                    <MangaRecommendationGrid/>
                </View>
            </ScrollView>

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
        backgroundColor: Colors.gray,
        elevation: 5,
        shadowColor: Colors.almostBlack,
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 5,    
        zIndex: 100
    }
})