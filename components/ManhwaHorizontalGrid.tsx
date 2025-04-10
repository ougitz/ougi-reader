import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import { AppStyle } from '@/styles/AppStyles'
import { Manhwa } from '@/model/Manhwa'
import ManhwaCover from './ManhwaCover'
import React from 'react'


const width: number = AppConstants.ManhwaCoverDimension.width
const height: number = AppConstants.ManhwaCoverDimension.height


interface ManhwaHorizontalGridProps {
    manhwas: Manhwa[]
    title: string
    onPress?: () => void
}


const ManhwaHorizontalGrid = ({
    manhwas, 
    title,
    onPress
}: ManhwaHorizontalGridProps) => {
    return (
        <View style={{gap: 20}} >
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: "space-between"}} >
                <Text style={AppStyle.textHeader}>{title}</Text>
                {
                    onPress &&
                    <Pressable onPress={onPress} hitSlop={AppConstants.hitSlopLarge}>
                        <Text style={AppStyle.textLink}>view all</Text>
                    </Pressable>
                }
            </View>
            <View style={{alignItems: 'flex-start', height: height + 180, width: '100%'}}>
                <FlatList                    
                    data={manhwas}
                    horizontal={true}
                    keyExtractor={(item: Manhwa, index: number) => index.toString()}
                    renderItem={({item}) => <ManhwaCover manhwa={item} marginRight={4} />}
                />
            </View>
        </View>
    )
}

export default ManhwaHorizontalGrid

const styles = StyleSheet.create({})