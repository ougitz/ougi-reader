import { 
    Pressable, 
    StyleProp, 
    StyleSheet, 
    Text, 
    View, 
    ViewStyle 
} from 'react-native'
import ManhwaStatusComponent from './ManhwaStatusComponent';
import { AppConstants } from '@/constants/AppConstants';
import { AppStyle } from '@/styles/AppStyles';
import { Colors } from '@/constants/Colors';
import { Chapter } from '@/model/Chapter';
import { Manhwa } from '@/model/Manhwa';
import ChapterLink from './ChapterLink';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { dbReadLast3Chapters } from '@/lib/database';
import { useSQLiteContext } from 'expo-sqlite';



interface ManhwaCoverProps {
    manhwa: Manhwa
    width?: number
    height?: number
    marginRight?: number
    marginBottom?: number
    styleProp?: StyleProp<ViewStyle>
    showChaptersPreview?: boolean
    shouldShowChapterDate?: boolean
}


const ManhwaCover = ({
    manhwa, 
    width = AppConstants.ManhwaCoverDimension.width, 
    height = AppConstants.ManhwaCoverDimension.height, 
    marginRight = 10,
    marginBottom = 0,
    styleProp = false,
    showChaptersPreview = true,
    shouldShowChapterDate = true    
}: ManhwaCoverProps) => {
    
    const db = useSQLiteContext()
    const [chapters, setChapters] = useState<Chapter[]>([])
    
    const manhwaStatusColor = manhwa.status == "Completed" ? 
        Colors.orange : 
        Colors.neonRed
    
    const onPress = () => {
        router.navigate({
            pathname: '/(pages)/Manhwa', 
            params: {manhwa_id: manhwa.manhwa_id}
        })
    }

    const init = async () => {
        if (showChaptersPreview) {
            await dbReadLast3Chapters(db, manhwa.manhwa_id)
                .then(values => setChapters(values))
        }
    }
    
    useEffect(
        () => {
            init()
        },
        []
    )

    return (
        <Pressable style={[{width, marginRight, marginBottom}, styleProp]} onPress={onPress} >
            <Image 
                source={manhwa.cover_image_url} 
                contentFit='cover'
                style={[{borderRadius: 22, width, height}]}/>
            <View style={styles.container} >
                <Text numberOfLines={1} style={[AppStyle.textRegular, {fontSize: 20}]}>{manhwa.title}</Text>
                {
                    showChaptersPreview && 
                    chapters.map(
                        (item) => 
                            <ChapterLink 
                                shouldShowChapterDate={shouldShowChapterDate} 
                                key={item.chapter_num} 
                                manhwa={manhwa} 
                                chapter={item} />
                )}
            </View>
            <ManhwaStatusComponent
                style={{position: 'absolute', left: 10, top: 10,}}
                status={manhwa.status}
                paddingHorizontal={10}
                paddingVertical={8}
                fontSize={12}
                backgroundColor={manhwaStatusColor}
                borderRadius={22}
            />
        </Pressable>
    )
}

export default ManhwaCover

const styles = StyleSheet.create({    
    container: {
        paddingVertical: 10,  
        width: '100%',
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4        
    },
    shadow: {
        shadowColor: 'black',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 5    
    }
})