import { AppConstants } from '@/constants/AppConstants'
import { StyleSheet, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { Manhwa } from '@/helpers/types'
import ManhwaCard from './ManhwaCard'
import { hp, wp } from '@/helpers/util'
import React from 'react'


interface ManhwaHorizontalGridProps {
    manhwas: Manhwa[]
}


const ManhwaHorizontalGrid = ({manhwas}: ManhwaHorizontalGridProps) => {
    return (
        <View style={{alignItems: 'flex-start', height: AppConstants.ManhwaCoverDimension.height + 180, width: '100%'}}>
            <FlashList
                data={manhwas}
                horizontal={true}
                estimatedItemSize={wp(90)}
                drawDistance={hp(200)}
                onEndReachedThreshold={3}
                keyExtractor={(item: Manhwa, index: number) => index.toString()}
                renderItem={({item}) => <ManhwaCard manhwa={item} marginRight={4} />}
            />
        </View>
    )
}

export default ManhwaHorizontalGrid

const styles = StyleSheet.create({})