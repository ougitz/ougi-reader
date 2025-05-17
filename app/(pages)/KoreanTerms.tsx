import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import ReturnButton from '@/components/button/ReturnButton'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import React, { useCallback, useEffect, useState } from 'react'
import { KoreanTerm } from '@/helpers/types'
import { spGetKoreanTerms } from '@/lib/supabase'


const Term = ({term, meaning}: {term: string, meaning: string}) => {
    return (
        <View style={{width: '100%', padding: 8, borderRadius: 4, backgroundColor: Colors.gray, alignItems: "flex-start", justifyContent: "flex-start", gap: 10}} >
            <Text style={[AppStyle.textHeader, {color: Colors.translationColor, fontSize: 24}]}>{term}</Text>
            <Text style={AppStyle.textRegular}>{meaning}</Text>
        </View>
    )
}


const KoreanTerms = () => {

    const [terms, setTerms] = useState<KoreanTerm[]>([])
    const [loading, setLoading] = useState(false)

    const init = useCallback(async () => {
        setLoading(true)
        await spGetKoreanTerms()
            .then(values => setTerms(values))
        setLoading(false)
    }, [])

    useEffect(() => {
        init()
    }, [])

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Korean Terms' titleColor={Colors.translationColor} >
                <ReturnButton color={Colors.translationColor} />
            </TopBar>
            <ScrollView style={{flex: 1}} >
                {
                    loading ? 
                    <ActivityIndicator size={32} color={Colors.translationColor} /> :
                    <View style={{width: '100%', gap: 20, marginBottom: 42}} >
                        {
                            terms.map((item, index) => <Term key={index} term={item.term} meaning={item.meaning} />)
                        }
                    </View>
                }
            </ScrollView>
        </SafeAreaView>
    )
}

export default KoreanTerms
