import { 
    ActivityIndicator, 
    Platform, 
    StyleSheet, 
    View 
} from 'react-native'
import { ChapterImage } from '@/helpers/types'
import React, { useState } from 'react'
import { wp } from '@/helpers/util'
import { Image } from 'expo-image'


interface ManhwaImageProps {
    image: ChapterImage
}


const MAX_WIDTH = Platform.OS === "web" ? wp(50) : wp(100)

const ManhwaImage = ({image}: ManhwaImageProps) => {

    const width = image.width < MAX_WIDTH ? image.width : MAX_WIDTH;
    const height = width * (image.height / image.width)
    const [loading, setLoading] = useState(false)    

    return (
        <View style={{width, height, alignSelf: "center"}} >
            <ActivityIndicator animating={true} size={32} color="#fff" style={{display: loading ? 'flex' : 'none'}} />
            <Image
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                source={image.image_url}
                style={{width, height}}
                contentFit='cover'
            />
        </View>
    )
}

export default ManhwaImage

const styles = StyleSheet.create({})