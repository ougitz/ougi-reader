import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import ReturnButton from '@/components/button/ReturnButton'
import { AppStyle } from '@/styles/AppStyles'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import React from 'react'


const Term = ({term, meaning}: {term: string, meaning: string}) => {
    return (
        <View style={{width: '100%', alignItems: "flex-start", justifyContent: "flex-start", gap: 10}} >
            <Text style={[AppStyle.textHeader, {fontSize: 24}]}>{term}</Text>
            <Text style={AppStyle.textRegular}>{meaning}</Text>
        </View>
    )
}


const KoreanTerms = () => {
  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Korean Terms' titleColor={Colors.translationColor} >
            <ReturnButton color={Colors.translationColor} />
        </TopBar>
        <ScrollView style={{flex: 1}} >
            <View style={{width: '100%', gap: 20, marginBottom: 42}} >
                
                <Term term='Unnie 언니' meaning='older sister, older female.' />
                <Term term='Oppa [오빠]' meaning='older brother, older male.' />
                            
                <Term term='Noona 누나' meaning='older sister, older female.' />
                <Term term='Hyung 형' meaning='older brother, older male.' />                
                
                <Term term='Ajumma [아줌마]' meaning='Aunt, middle-aged woman.' />
                <Term term='Sunbae [선배]' meaning='A senior or upperclassman in an organization, group, or school.' />
                <Term term='Seonsaengnim [선생님]' meaning='Teacher or Professor.' />
                <Term term='Abeoji [아버지]' meaning='Father.' />
                <Term term='Eomma [엄마]' meaning='Mom, Mommy.' />
                
            </View>
        </ScrollView>
    </SafeAreaView>
  )
}

export default KoreanTerms
