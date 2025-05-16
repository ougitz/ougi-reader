import { Pressable, StyleSheet, Text, View } from 'react-native'
import { getRelativeHeight, wp } from '@/helpers/util'
import { Recommendation } from '@/helpers/types'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import React from 'react'
import FastImage from 'react-native-fast-image'


const WIDTH = wp(80)


interface ManhwaRecommendationProps {
    recommendation: Recommendation
}


const ManhwaCardBigComponent = ({recommendation}: ManhwaRecommendationProps) => {
    
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
            <FastImage 
                source={{uri: recommendation.image.image_url, priority: 'normal', cache: 'immutable'}} 
                style={[styles.image, {height}]}
                resizeMode={FastImage.resizeMode.cover}/>
            <View 
                style={styles.title} >
                <Text style={AppStyle.textRegular}>{manhwaTitle}</Text>
            </View>
        </Pressable>
    )
}

const areEqual = (
  prevProps: Readonly<ManhwaRecommendationProps>,
  nextProps: Readonly<ManhwaRecommendationProps>
) => {
  return (
    prevProps.recommendation.image.image_url ===
    nextProps.recommendation.image.image_url
  )
}


export const ManhwaCardBig = React.memo(
  ManhwaCardBigComponent,
  areEqual
)


const styles = StyleSheet.create({
    container: {
        gap: 20, 
        marginRight: 10, 
        alignSelf: "flex-start"
    },
    image: {
        alignSelf: "center",
        width: WIDTH,        
        borderRadius: 20
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