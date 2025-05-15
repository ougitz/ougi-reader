import { 
    ActivityIndicator,
    StyleSheet, 
    TextInput, 
    Platform, 
    ScrollView, 
    Pressable, 
    KeyboardAvoidingView,
    Text, 
    View, 
    FlatList
} from 'react-native'
import { spReportBug } from '@/lib/supabase';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AppStyle } from '@/styles/AppStyles';
import { Colors } from '@/constants/Colors';
import EmptyFooter from '../EmptyFooter';
import { router } from 'expo-router';
import { hp } from '@/helpers/util';
import { useState } from 'react'
import Toast from '../Toast';
import * as yup from 'yup';
import React from 'react'



type BugType = "ImagesOutOfOrder" | "MissingImages" | "Broken" | "Other" 


const BUT_TYPE_LIST: BugType[] = [
    "Other",
    "Broken",
    "ImagesOutOfOrder",
    "MissingImages"
]


const schema = yup.object().shape({  
    title: yup
        .string()
        .min(3, 'Min 3 characters')
        .max(256, 'Max 256 characters')
        .required('Title is required'),
    descr: yup
        .string()
        .max(1024),
    bugType: yup
        .string()
        .max(32)
});


interface FormData {
    title: string
    descr: string
    bugType: BugType
}


const BugItem = ({item, isSelected, onChange}: {item: BugType, isSelected: boolean, onChange: (b: BugType) => any}) => {
    
    const onPress = () => {
        onChange(item)
    }    

    return (
        <Pressable 
        onPress={onPress}
        style={{
            height: 42, 
            alignItems: "center", 
            justifyContent: "center", 
            paddingHorizontal: 12, 
            borderRadius: 4,
            marginRight: 10,
            backgroundColor: isSelected ? Colors.BugReportColor : Colors.gray }} >
            <Text style={AppStyle.textRegular} >{item}</Text>
        </Pressable>
    )
}

const BugTypeSelector = ({value, onChange}: {value: BugType, onChange: (b: BugType) => any}) => {
    return (
        <View style={{width: '100%', height: 52}} >
            <FlatList
                data={BUT_TYPE_LIST}
                horizontal={true}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => <BugItem isSelected={value == item} item={item} onChange={onChange} />}
            />
        </View>
    )
}


const BugReportForm = ({title}: {title: string | undefined | null}) => {
        
    const [isLoading, setLoading] = useState(false)
    
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            title: title ? title: '',
            descr: '',
            bugType: 'Other'
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        setLoading(true)
        await spReportBug(
            form_data.title, 
            form_data.descr.trim() == '' ? null : form_data.descr.trim(), 
            form_data.bugType
        )
        Toast.show({title: "Thank You!", message: '', type: "success"})
        setLoading(false)
        router.back()
    };

  return (
    <KeyboardAvoidingView style={{flex: 1, gap: 20}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <ScrollView style={{flex: 1}} >
            
            {/* Title */}
            <Text style={AppStyle.inputHeaderText}>Title</Text>
            <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={AppStyle.input}
                    autoCapitalize="sentences"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.title && (<Text style={AppStyle.error}>{errors.title.message}</Text>)}

            {/* BugType */}
            <Controller
                name="bugType"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <BugTypeSelector  value={value} onChange={onChange} />
                )}
            />
            {errors.bugType && (<Text style={AppStyle.error}>{errors.bugType.message}</Text>)}
            
            {/* Description */}
            <View style={{flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "center", alignSelf: 'flex-start'}} >
                <Text style={AppStyle.inputHeaderText}>Description</Text>
                <Text style={[AppStyle.textRegular, {fontSize: 12, color: Colors.neonRed}]}>optional</Text>
            </View>
            <Controller
                name="descr"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={[AppStyle.input, {height: hp(25), paddingVertical: 10, textAlignVertical: 'top'}]}                    
                    multiline={true}
                    autoCapitalize="sentences"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.descr && (<Text style={AppStyle.error}>{errors.descr.message}</Text>)}            
    
            {/* Report Button */}
            <Pressable onPress={handleSubmit(onSubmit)} style={[AppStyle.formButton, {backgroundColor: Colors.BugReportColor}]} >
                {
                    isLoading ? 
                    <ActivityIndicator size={32} color={Colors.backgroundColor} /> :
                    <Text style={AppStyle.formButtonText} >Report</Text>
                }
            </Pressable>

            <EmptyFooter height={40} />
            
        </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default BugReportForm
