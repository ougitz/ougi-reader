import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppConstants } from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';
import { useAuthState } from '@/store/authState';
import { spUpdateManhwaReadingStatus } from '@/lib/supabase';
import Toast, { ToastNotLogged } from './Toast';
import { dbGetManhwaReadingStatus, dbUpdateManhwaReadingStatus } from '@/lib/database';
import { useSQLiteContext } from 'expo-sqlite';


const AddToLibray = ({manhwa_id}: {manhwa_id: number}) => {

    const db = useSQLiteContext()
    const { session } = useAuthState()

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState<string>('None')
    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState(
        AppConstants.READING_STATUS.map(i => {return {label: i, value: i}})
    )

    const dbValue = useRef('')

    const init = useCallback(async () => {
        await dbGetManhwaReadingStatus(db, manhwa_id)
            .then(value => {
                if (!value) { return }
                dbValue.current = value
                setValue(value)
            })        
    }, [])

    useEffect(
        () => {
            init()
        },
        []
    )

    const onChangeValue = async (value: string | null) => {
        if (!session) {
            ToastNotLogged()
            return
        }
        if (!value || value == dbValue.current) { return }
        setLoading(true)
        await dbUpdateManhwaReadingStatus(db, manhwa_id, value)
        spUpdateManhwaReadingStatus(session.user.id, manhwa_id, value)
        setLoading(false)
    }

    return (
        <View style={{width: '100%', height: 52}} >
            {
                loading ?
                <View style={{width: '100%', height: 52, backgroundColor: Colors.orange, borderRadius: 4, alignItems: "center", justifyContent: "flex-start"}} >
                    <ActivityIndicator size={32} color={Colors.white} />
                </View>
                :
                <DropDownPicker
                    open={open}
                    style={{height: 52, backgroundColor: Colors.orange}}
                    dropDownContainerStyle={{backgroundColor: Colors.gray}}
                    labelStyle={{color: Colors.backgroundColor}}                
                    textStyle={{fontFamily: "LeagueSpartan_400Regular", fontSize: 18}}
                    showArrowIcon={false}
                    placeholder='Add To Library'
                    placeholderStyle={{color: Colors.backgroundColor, fontSize: 18, fontFamily: "LeagueSpartan_400Regular"}}
                    value={value as any}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    listMode='SCROLLVIEW'
                    theme="DARK"                
                    onChangeValue={onChangeValue}
                    multiple={false}
                    mode="SIMPLE"
                />
            }
        </View>
    )
}

export default AddToLibray

const styles = StyleSheet.create({})