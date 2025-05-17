import { Platform } from 'react-native'
import { wp } from '@/helpers/util'
import React, { memo } from 'react'
import { Image } from 'expo-image'


interface ManhwaImageProps {
    originalWidth: number
    originalHeight: number
    imageUrl: string
}


const MAX_WIDTH = Platform.OS === "web" ? wp(50) : wp(100)


const ManhwaImageComponent = ({originalWidth, originalHeight, imageUrl}: ManhwaImageProps) => {
    
    const width = originalWidth < MAX_WIDTH ? originalWidth : MAX_WIDTH
    const height = width * (originalHeight / originalWidth)    
    console.log(imageUrl)
    
    return (
        <Image
            style={{ width: width, height: height}}
            source={imageUrl}
            contentFit='contain'/>
    )
}


const areEqual = (
  prevProps: ManhwaImageProps,
  nextProps: ManhwaImageProps
) => prevProps.imageUrl === nextProps.imageUrl


export const ManhwaImage = memo(ManhwaImageComponent, areEqual)


export default ManhwaImage

