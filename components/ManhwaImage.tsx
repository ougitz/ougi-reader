import { 
    Platform, 
    StyleSheet, 
    View 
} from 'react-native'
import { ChapterImage } from '@/helpers/types'
import { wp } from '@/helpers/util'
import { Image } from 'expo-image'
import React from 'react'


interface ManhwaImageProps {
    image: ChapterImage
}


const MAX_WIDTH = Platform.OS === "web" ? wp(50) : wp(100)


const ManhwaImage = ({image}: ManhwaImageProps) => {

    const width = image.width < MAX_WIDTH ? image.width : MAX_WIDTH;
    const height = width * (image.height / image.width)

    return (
        <View style={{width, height, alignSelf: "center"}} >
            <Image 
                source={image.image_url} 
                style={{width, height}} 
                contentFit='cover' 
                cachePolicy={'disk'}/>
        </View>
    )
}

export default ManhwaImage

const styles = StyleSheet.create({})