import { Pressable, StyleSheet, Text, View } from 'react-native'
import { getRelativeHeight, wp } from '@/helpers/util'
import { Recommendation } from '@/helpers/types'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import React, { useCallback, useEffect, useState } from 'react'


const WIDTH = wp(80)


interface ManhwaRecommendationProps {
    recommendation: Recommendation
}


const ManhwaCardBig = ({recommendation}: ManhwaRecommendationProps) => {
    
    const manhwaTitle = recommendation.manhwa.title
    const height = getRelativeHeight(
        WIDTH, 
        recommendation.image.width, 
        recommendation.image.height
    )    
    
    const openManhwaPage = () => {
        router.navigate({
            pathname: "/(pages)/Manhwa", 
            params: {
                manhwa_id: recommendation.manhwa.manhwa_id
            }})
    }    
        
    return (
        <Pressable
            onPress={openManhwaPage}
            style={styles.container}>
            <Image 
                source={recommendation.image.image_url}
                style={[styles.image, {height}]}
                cachePolicy={'disk'}
                contentFit='cover'/>
            <View 
                style={styles.title} >
                <Text style={AppStyle.textRegular}>{manhwaTitle}</Text>
            </View>
        </Pressable>
    )
}


export default ManhwaCardBig


const styles = StyleSheet.create({
    container: {
        gap: 20, 
        marginRight: 10, 
        alignSelf: "flex-start"
    },
    image: {
        alignSelf: "center",
        width: WIDTH,        
        borderRadius: 12
    },
    title: {
        position: 'absolute',
        maxWidth: '95%',
        left: 10,
        top: 10,
        paddingHorizontal: 10, 
        paddingVertical: 10, 
        backgroundColor: Colors.orange, 
        borderRadius: 20
    }
})