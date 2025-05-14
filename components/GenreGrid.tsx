import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import { dbReadGenres } from '@/lib/database'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import { Genre } from '@/helpers/types'
import { router } from 'expo-router'


const GenreGrid = () => {

    const db = useSQLiteContext()
    const [genres, setGenres] = useState<Genre[]>([])

    const init = useCallback(async () => {
        await dbReadGenres(db).then(values => setGenres(values))
    }, [])

    useEffect(
        () => {
            init()
        },
        []
    )

    const onPress = (genre: Genre) => {
        router.navigate({
            pathname: '/(pages)/ManhwaByGenre', 
            params: {
                genre: genre.genre,
                genre_id: genre.genre_id
            }
        })
    }

    return (
        <View style={styles.container} >
            <FlatList
                data={genres}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                horizontal={true}
                renderItem={({item, index}) => 
                    <Pressable onPress={() => onPress(item)} style={styles.button} >
                        <Text style={AppStyle.textRegular}>{item.genre}</Text>
                    </Pressable>
                }
            />
        </View>
    )
}

export default GenreGrid

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 10
    },
    button: {
        paddingHorizontal: 10,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        backgroundColor: Colors.gray,
        marginRight: 10
    }   
})