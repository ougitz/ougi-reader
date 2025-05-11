import { StyleSheet, Text, View } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import React, { useState } from 'react'
import { Colors } from '@/constants/Colors'
import { AppConstants } from '@/constants/AppConstants'


interface ReadingStatusPickerProps {
    onChangeValue: (v: any) => void
    defaultValue?: string
}


const ReadingStatusPicker = ({
    onChangeValue,
    defaultValue = 'Completed'
}: ReadingStatusPickerProps) => {

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(defaultValue)
    const [items, setItems] = useState(
        AppConstants.READING_STATUS.map(i => {return {label: i, value: i}})
    )

    return (
        <DropDownPicker
            open={open}
            style={{height: 52, backgroundColor: Colors.libraryColor, borderRadius: 4}}
            dropDownContainerStyle={{backgroundColor: Colors.gray}}
            labelStyle={{color: Colors.backgroundColor}}                
            textStyle={{fontFamily: "LeagueSpartan_400Regular", fontSize: 18}}
            placeholder='Reading Status'
            placeholderStyle={{color: Colors.backgroundColor, fontSize: 18, fontFamily: "LeagueSpartan_400Regular"}}
            value={value as any}
            showArrowIcon={false}
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
    )
}

export default ReadingStatusPicker

const styles = StyleSheet.create({})