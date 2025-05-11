import { 
    Platform, 
    StyleSheet
} from 'react-native'
import { ChapterImage } from '@/helpers/types'
import { wp } from '@/helpers/util'
import FastImage from 'react-native-fast-image';
import React from 'react'


interface ManhwaImageProps {
    image: ChapterImage
}


const MAX_WIDTH = Platform.OS === "web" ? wp(50) : wp(100)


const ManhwaImage = ({image}: ManhwaImageProps) => {

    const width = image.width < MAX_WIDTH ? image.width : MAX_WIDTH;
    const height = width * (image.height / image.width)

    return (
        <FastImage
            style={{ width, height, alignSelf: "center"}}
            source={{ uri: image.image_url, priority: FastImage.priority.normal }}            
            resizeMode={FastImage.resizeMode.contain}/>
    )
}

export default ManhwaImage

const styles = StyleSheet.create({})