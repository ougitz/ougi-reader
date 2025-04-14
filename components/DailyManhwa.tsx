import { Pressable, StyleSheet, Text, View } from 'react-native'
import { getRelativeHeight, wp } from '@/helpers/util'
import { AppConstants } from '@/constants/AppConstants'
import { useReadingState } from '@/store/readingStore'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import { Recommendation } from '@/helpers/types'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import React from 'react'


const ManhwaRecommendation = ({recommendation}: {recommendation: Recommendation}) => {
    
    const { setManhwa } = useReadingState()    


    const w = wp(80)
    const h = getRelativeHeight(w, recommendation.width, recommendation.height)

    const openManhwaPage = () => {
        setManhwa(recommendation.manhwa)
        router.navigate("/Manhwa")
    }
    
    return (                    
            <View 
                style={{gap: 20, marginRight: 10, alignSelf: "flex-start"}} >
                <View>
                    <Image source={recommendation.cover_image_url} style={{
                        alignSelf: "center",
                        width: w, 
                        height: h,
                        borderRadius: 20
                    }} />
                    <View 
                        style={{
                            position: 'absolute',
                            left: 10,
                            top: 10,
                            paddingHorizontal: 10, 
                            paddingVertical: 10, 
                            backgroundColor: Colors.orange, 
                            borderRadius: 20
                        }} >
                        <Text style={AppStyle.textRegular}>{recommendation.manhwa.title}</Text>
                    </View>
                    <Pressable
                        onPress={openManhwaPage}
                        hitSlop={AppConstants.hitSlopLarge}
                        style={{
                            position: 'absolute',
                            right: 10,
                            bottom: 10,
                            paddingHorizontal: 10, 
                            paddingVertical: 10, 
                            backgroundColor: Colors.gray, 
                            borderRadius: 20
                        }} >
                        <Text style={AppStyle.textRegular}>Read Now</Text>
                    </Pressable>
                </View>
            </View>
    )
}

export default ManhwaRecommendation

const styles = StyleSheet.create({})