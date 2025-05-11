import { dbGetManhwaReadingStatus, dbUpdateManhwaReadingStatus } from '@/lib/database';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import DropDownPicker from 'react-native-dropdown-picker';
import { spUpdateManhwaReadingStatus } from '@/lib/supabase';
import { AppConstants } from '@/constants/AppConstants';
import { useAuthState } from '@/store/authState';
import Toast, { ToastNotLogged } from './Toast';
import { useSQLiteContext } from 'expo-sqlite';
import { Colors } from '@/constants/Colors';


const AddToLibray = ({manhwa_id}: {manhwa_id: number}) => {

    const db = useSQLiteContext()
    const { session } = useAuthState()

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState<string>()
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
        await dbUpdateManhwaReadingStatus(db, manhwa_id, value)
        spUpdateManhwaReadingStatus(session.user.id, manhwa_id, value)
    }

    return (
        <View style={{flex: 1, height: 52}} >
            <DropDownPicker
                open={open}
                style={{height: 52, borderRadius: 4, backgroundColor: Colors.orange}}
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
        </View>
    )
}

export default AddToLibray

const styles = StyleSheet.create({})