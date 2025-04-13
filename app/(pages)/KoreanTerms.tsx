import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { AppStyle } from '@/styles/AppStyles'
import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/ReturnButton'
import { Colors } from '@/constants/Colors'


const A = `
    - Manhwa [만화] : Korean term for comics and print cartoons.
    - Manhwaga [만화가] : The author or artist of a Manhwa.
    - Aeni [애니] : South Korean animation.
    - Webtoon [웹툰] : A type of digital comic that originated in South Korea.
`


const Term = ({term, meaning}: {term: string, meaning: string}) => {
    return (
        <View style={{width: '100%', padding: 8, backgroundColor: Colors.gray, borderRadius: 4, alignItems: "flex-start", justifyContent: "flex-start", gap: 10}} >
            <Text style={[AppStyle.textHeader, {fontSize: 24}]}>{term}</Text>
            <Text style={AppStyle.textRegular}>{meaning}</Text>
        </View>
    )
}

const KoreanTerms = () => {
  return (
    <SafeAreaView style={AppStyle.safeArea} >
        <TopBar title='Korean Terms'>
            <ReturnButton/>
        </TopBar>
        <ScrollView style={{flex: 1}} >
            <View style={{width: '100%', gap: 20, marginBottom: 42}} >                
                <Term term='Manhwa [만화]' meaning='Korean term for comics and print cartoons.' />
                <Term term='Manhwaga [만화가]' meaning='The author or artist of a Manhwa.' />
                <Term term='Aeni [애니]' meaning='South Korean animation.' />
                <Term term='Webtoon [웹툰]' meaning='A type of digital comic that originated in South Korea.' />
                
                <View style={{width: '100%', height: 2, backgroundColor: Colors.white}} />
                
                <Text style={AppStyle.textHeader}>Used by females</Text>
                <Term term='Eonni [언니]' meaning='older sister, older female.' />
                <Term term='Oppa [오빠]' meaning='older brother, older male.' />
                
                <Text style={AppStyle.textHeader}>Used by males</Text>
                <Term term='Nuna [누나]' meaning='older sister, older female.' />
                <Term term='Hyeong [형]' meaning='older brother, older male.' />
                
                <View style={{width: '100%', height: 2, backgroundColor: Colors.white}} />

                <Text style={AppStyle.textHeader}>Other</Text>
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

const styles = StyleSheet.create({})