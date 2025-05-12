import { SQLiteProvider } from 'expo-sqlite';
import { dbMigrate } from '@/lib/database';
import { View, StatusBar } from 'react-native'
import { Colors } from '@/constants/Colors'
import Toast from '@/components/Toast'
import { Stack } from 'expo-router'
import React from 'react'


const _layout = () => {
  return (
      <View style={{flex: 1, backgroundColor: Colors.backgroundColor}} >
        <SQLiteProvider databaseName='ougi_reader.db' onInit={dbMigrate} >
          <StatusBar hidden={true} backgroundColor={Colors.backgroundColor} />
          <Stack>
              <Stack.Screen name='index' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/Home' options={{headerShown: false}} />
              <Stack.Screen name='(auth)/SignIn' options={{headerShown: false}} />
              <Stack.Screen name='(auth)/SignUp' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/Manhwa' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/Chapter' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/Account' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/ReadHistory' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/Library' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/SearchManhwa' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/MostView' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/LastUpdate' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/ManhwaByGenre' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/ManhwaByAuthor' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/KoreanTerms' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/Donate' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/BugReport' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/Disclaimer' options={{headerShown: false}} />
              <Stack.Screen name='(pages)/RequestManhwa' options={{headerShown: false}} />
          </Stack>
          <Toast.Component/>
        </SQLiteProvider>
      </View>
  )
}

export default _layout
