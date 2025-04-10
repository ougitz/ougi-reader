import { View, StatusBar } from 'react-native'
import { Colors } from '@/constants/Colors'
import Toast from '@/components/Toast'
import { Stack } from 'expo-router'
import React from 'react'


const _layout = () => {
  return (
      <View style={{flex: 1, backgroundColor: Colors.backgroundColor}} >
        <StatusBar hidden={true} backgroundColor={Colors.backgroundColor} />
        <Stack>
            <Stack.Screen name='index' options={{headerShown: false}} />
            <Stack.Screen name='(pages)/Home' options={{headerShown: false}} />
            <Stack.Screen name='(auth)/SignIn' options={{headerShown: false}} />
            <Stack.Screen name='(auth)/SignUp' options={{headerShown: false}} />
            <Stack.Screen name='(pages)/Manhwa' options={{headerShown: false}} />
            <Stack.Screen name='(pages)/Account' options={{headerShown: false}} />
            <Stack.Screen name='(pages)/ReadHistory' options={{headerShown: false}} />
            <Stack.Screen name='(pages)/Library' options={{headerShown: false}} />
            <Stack.Screen name='(pages)/SearchManhwa' options={{headerShown: false}} />
        </Stack>
        <Toast.Component/>
      </View>
  )
}

export default _layout