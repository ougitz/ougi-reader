import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { dbGetItems } from '@/database/db'
import GenreModel from '@/database/models/GenreModel'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'


const GenreGrid = () => {

    const [genres, setGenres] = useState<string[]>([])

    const init = async () => {
        if (genres.length > 0) { return }
        
        await dbGetItems<GenreModel>('genres')
            .then(values => {
                if (values) {
                    setGenres([...values.map(i => i.genre)])
                }
            })
    }

    useEffect(
        useCallback(() => {
            init()
        }, []),
        []
    )

    const onPress = (genre: string) => {
        router.navigate({pathname: '/(pages)/ManhwaByGenre', params: {genre}})
    }

    return (
        <View style={styles.container} >
            <Text style={AppStyle.textHeader}>Genres</Text>
            <FlatList
                data={genres}
                keyExtractor={(item, index) => index.toString()}
                horizontal={true}
                renderItem={({item, index}) => 
                    <Pressable onPress={() => onPress(item)} style={styles.button} >
                        <Text style={AppStyle.textRegular}>{item}</Text>
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