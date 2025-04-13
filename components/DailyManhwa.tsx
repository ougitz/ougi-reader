import { AppState, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useDailyManhwaState } from '@/store/dailyManhwaStore'
import { dbGetDailyManhwa, dbGetManhwaGenres } from '@/database/db'
import { Image } from 'expo-image'
import { getRelativeHeight, wp } from '@/helpers/util'
import { AppStyle } from '@/styles/AppStyles'
import { Manhwa } from '@/model/Manhwa'
import { Colors } from '@/constants/Colors'
import { AppConstants } from '@/constants/AppConstants'
import { useReadingState } from '@/store/readingStore'
import { router } from 'expo-router'

const ManhwaInfo = ({manhwa}: {manhwa: Manhwa}) => {

    const [genres, setGenres] = useState<string[]>([])

    const init = async () => {
        if (manhwa) {
            await dbGetManhwaGenres(manhwa.manhwa_id)
                .then(values => setGenres([...values]))
        }
    }

    useEffect(
        useCallback(() => {
            init()
        }, []),
        []
    )

    const manhwaTitle = manhwa ? manhwa.title : ''

    return (
        <View>
            <Text style={AppStyle.textHeader}>{manhwaTitle}</Text>
            <View style={{width: 300, flexDirection: 'row', gap: 10, flexWrap: 'wrap'}} >
                {
                    genres.map((item, index) => 
                        <View key={index} style={{paddingHorizontal: 10, paddingVertical: 12, backgroundColor: Colors.gray, borderRadius: 4, alignItems: "center", justifyContent: "center"}} >
                            <Text style={AppStyle.textRegular}>{item}</Text>
                        </View>
                    )
                }
            </View>
        </View>
    )
}

const DailyManhwa = () => {

    const { manhwa, width, height, cover_image_url, setDailyManhwa } = useDailyManhwaState()
    const { setManhwa } = useReadingState()


    const init = async () => {
        if (!manhwa) {
            const r = await dbGetDailyManhwa()
            if (r?.manhwa && r?.image_url) {
                setDailyManhwa(r.manhwa, r.image_url, r.width, r.height)
            }
        }
    }

    useEffect(
        useCallback(() => {
            init()
        }, []),
        []
    )

    const w = wp(80)
    const h = getRelativeHeight(w, width!, height!)       

    const openManhwaPage = () => {
        if (manhwa) {
            setManhwa(manhwa)
            router.navigate("/Manhwa")
        }
    }
    
    return (
        <>
            {
                manhwa &&
                <>
                    <View style={{width: '100%', gap: 20}} >
                        <Text style={[AppStyle.textHeader, {fontSize: 24}]}>Today's Recommendation</Text>
                        <View>
                            <Image source={cover_image_url} style={{
                                alignSelf: "center",
                                width: w, 
                                height: h,
                                borderRadius: 20
                            }} />
                            <View 
                                style={{
                                    position: 'absolute',
                                    left: 10,
                                    top: -10,
                                    paddingHorizontal: 4, 
                                    paddingVertical: 10, 
                                    backgroundColor: Colors.orange, 
                                    borderRadius: 4
                                }} >
                                <Text style={AppStyle.textRegular}>{manhwa.title}</Text>
                            </View>
                            <Pressable
                                onPress={openManhwaPage}
                                hitSlop={AppConstants.hitSlopLarge}
                                style={{
                                    position: 'absolute',
                                    right: 10,
                                    bottom: -10,
                                    paddingHorizontal: 12, 
                                    paddingVertical: 12, 
                                    backgroundColor: Colors.gray, 
                                    borderRadius: 4
                                }} >
                                <Text style={AppStyle.textRegular}>Read Now</Text>
                            </Pressable>
                        </View>
                    </View>
                </>
            }
        </>
    )
}

export default DailyManhwa

const styles = StyleSheet.create({})