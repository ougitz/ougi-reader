import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { AppStyle } from '@/styles/AppStyles'
import React, { useCallback, useEffect, useRef } from 'react'
import { spUpdateManhwaViews } from '@/lib/supabase'
import { useReadingState } from '@/store/readingStore'


const Manhwa = () => {

  const { manhwa } = useReadingState()

  const countView = useRef(false)

  const init = async () => {
    if (countView.current == false) {
      await spUpdateManhwaViews(manhwa?.manhwa_id)
    }
  }

  useEffect(
    useCallback(() => {

    }, []),
    []
  )

  return (
    <SafeAreaView style={AppStyle.safeArea} >

    </SafeAreaView>
  )
}

export default Manhwa

const styles = StyleSheet.create({})