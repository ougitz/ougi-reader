import { FlatList, StyleSheet, View } from 'react-native'
import { AppConstants } from '@/constants/AppConstants'
import { Manhwa } from '@/model/Manhwa'
import ManhwaCover from './ManhwaCover'
import React from 'react'


const width: number = AppConstants.ManhwaCoverDimension.width
const height: number = AppConstants.ManhwaCoverDimension.height


interface ManhwaHorizontalGridProps {
    manhwas: Manhwa[]
}


const ManhwaHorizontalGrid = ({manhwas}: ManhwaHorizontalGridProps) => {
    return (
        <View style={{alignItems: 'flex-start', height: height + 180, width: '100%'}}>
            <FlatList                    
                data={manhwas}
                horizontal={true}
                keyExtractor={(item: Manhwa, index: number) => index.toString()}
                renderItem={({item}) => <ManhwaCover manhwa={item} marginRight={4} />}
            />
        </View>
    )
}

export default ManhwaHorizontalGrid

const styles = StyleSheet.create({})