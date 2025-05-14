import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native'
import { getItemGridDimensions, hp, wp } from '@/helpers/util'
import { AppConstants } from '@/constants/AppConstants'
import React, { useEffect, useRef } from 'react'
import { FlashList } from '@shopify/flash-list'
import { Colors } from '@/constants/Colors'
import { Manhwa } from '@/model/Manhwa'
import ManhwaCover from './ManhwaCover'


interface ManhwaListProps {
    manhwas: Manhwa[]
    onEndReached?: () => void
    loading?: boolean
    hasResults?: boolean
    shouldScrollToTopWhenManhwasChange?: boolean
    paddingHorizontal?: number
    gap?: number
    numColumns?: number
    shouldShowChapterDate?: boolean
    showChaptersPreview?: boolean
    listMode?: 'FlashList' | 'FlatList'
    estimatedItemSize?: number
}

const ManhwaList = ({
    manhwas, 
    onEndReached, 
    loading = false, 
    hasResults = true,
    shouldScrollToTopWhenManhwasChange = false,
    paddingHorizontal = wp(5), 
    gap = 10, 
    numColumns = 1,
    shouldShowChapterDate = true,
    showChaptersPreview = true,
    listMode = 'FlashList',
    estimatedItemSize = AppConstants.ManhwaCoverDimension.height + 180
}: ManhwaListProps) => {    

    const ref = useRef<FlashList<Manhwa>>()
    const {width, height} = getItemGridDimensions(
        paddingHorizontal,
        gap,
        numColumns,
        AppConstants.ManhwaCoverDimension.width,
        AppConstants.ManhwaCoverDimension.height
    )

    useEffect(
        () => {            
            if (shouldScrollToTopWhenManhwasChange) {
                ref.current?.scrollToOffset({animated: false, offset: 0})
            }
        },
        [manhwas]
    )

    return (
        <View style={{width: '100%', flex: 1, marginBottom: 20}} >
            {
                listMode == 'FlashList' ?
                    <FlashList
                        ref={ref as any}
                        keyboardShouldPersistTaps={'always'}
                        data={manhwas}
                        numColumns={numColumns}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => 
                            <ManhwaCover 
                                showChaptersPreview={showChaptersPreview} 
                                shouldShowChapterDate={shouldShowChapterDate} 
                                width={width} 
                                height={height} 
                                marginBottom={6} 
                                manhwa={item} />
                        }
                        estimatedItemSize={estimatedItemSize}
                        ListFooterComponent={
                            <>
                                {
                                    loading && hasResults &&
                                    <View style={{width: '100%', paddingVertical: 22, alignItems: "center", justifyContent: "center"}} >
                                        <ActivityIndicator size={32} color={Colors.white} />
                                    </View> 
                                }
                            </>
                        }
                        drawDistance={hp(100)}
                        onEndReached={onEndReached}
                        scrollEventThrottle={4}
                        onEndReachedThreshold={2}/>
                    :
                    <FlatList
                        keyboardShouldPersistTaps={'always'}
                        ref={ref as any}
                        data={manhwas}
                        numColumns={numColumns}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => 
                            <ManhwaCover 
                                showChaptersPreview={showChaptersPreview} 
                                shouldShowChapterDate={shouldShowChapterDate} 
                                width={width} 
                                height={height} 
                                marginBottom={6} 
                                manhwa={item} />
                        }
                        initialNumToRender={4}
                        onEndReached={onEndReached}
                        scrollEventThrottle={4}
                        onEndReachedThreshold={3}
                        ListFooterComponent={
                            <>
                                {
                                    loading && hasResults &&
                                    <View style={{width: '100%', paddingVertical: 22, alignItems: "center", justifyContent: "center"}} >
                                        <ActivityIndicator size={32} color={Colors.white} />
                                    </View> 
                                }
                            </>
                        }
                    />
            }
        </View>
    )
}

export default ManhwaList

const styles = StyleSheet.create({})