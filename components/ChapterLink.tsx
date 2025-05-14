import { 
    StyleSheet, 
    Pressable, 
    Text, 
    ActivityIndicator, 
    ViewStyle 
} from 'react-native'
import { spFetchChapterList, spUpdateManhwaViews } from '@/lib/supabase'
import { useReadingState } from '@/store/manhwaReadingState'
import { formatTimestamp } from '@/helpers/util'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import { Chapter } from '@/model/Chapter'
import { Manhwa } from '@/model/Manhwa'
import { StyleProp } from 'react-native'
import React, { useRef, useState } from 'react'
import { router } from 'expo-router'


interface ChapterLinkProps {
    manhwa: Manhwa
    chapter: Chapter
    shouldShowChapterDate?: boolean    
    prefix?: string    
    style?: StyleProp<ViewStyle>
}

const ChapterLink = ({
    manhwa, 
    chapter,
    shouldShowChapterDate = true,    
    prefix = 'Chapter ',
    style
}: ChapterLinkProps) => {

    const { setChapterMap, setChapterNum } = useReadingState()
    const [loading, setLoading] = useState(false)
    const isActive = useRef(false)

    const onPress = async () => {
        if (isActive.current) { return }
        isActive.current = true
        setLoading(true)
        spUpdateManhwaViews(manhwa.manhwa_id)
        await spFetchChapterList(manhwa.manhwa_id)
            .then(values => setChapterMap(new Map(values.map(i => [i.chapter_num, i]))))
        setChapterNum(chapter.chapter_num)
        setLoading(false)
        isActive.current = false
        router.navigate({pathname: "/(pages)/Chapter", params: {manhwa_title: manhwa.title}})
    }

    return (
        <Pressable onPress={onPress} style={[styles.chapterLink, style]} >
            {
                loading ? 
                <ActivityIndicator size={20} color={Colors.white} /> :
                <>
                    <Text style={AppStyle.textRegular}>{prefix}{chapter.chapter_num}</Text>
                    {
                        shouldShowChapterDate && 
                        <Text style={[AppStyle.textRegular, {paddingRight: 20}]}>{formatTimestamp(chapter.created_at)}</Text>
                    }
                </>
            }
        </Pressable>
    )
}

export default ChapterLink

const styles = StyleSheet.create({
    chapterLink: {
        paddingVertical: 8,        
        borderRadius: 4,
        backgroundColor: Colors.backgroundColor,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20
    }
})