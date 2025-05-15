import { 
    ActivityIndicator,    
    TextInput, 
    Platform, 
    ScrollView, 
    Pressable, 
    KeyboardAvoidingView,
    Text, 
    View    
} from 'react-native'
import { spRequestManhwa } from '@/lib/supabase';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AppStyle } from '@/styles/AppStyles';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { hp } from '@/helpers/util';
import { useState } from 'react'
import Toast from '../Toast';
import * as yup from 'yup';
import React from 'react'
import EmptyFooter from '../EmptyFooter';
import { ToastThankYouMessage } from '@/helpers/ToastMessages';


const schema = yup.object().shape({  
    manhwa_title: yup
        .string()
        .min(3, 'Min 3 characters')
        .max(256, 'Max 256 characters')
        .required('Manhwa name is required'),
    descr: yup
        .string()
        .max(1024)    
});


interface FormData {
    manhwa_title: string
    descr: string
}


const RequestManhwaForm = () => {
        
    const [isLoading, setLoading] = useState(false)
    
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema as any),
        defaultValues: {            
            manhwa_title: '',
            descr: ''
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        setLoading(true)
        const m = form_data.descr.trim() == '' ? null : form_data.descr.trim()
        await spRequestManhwa(form_data.manhwa_title, m)
        ToastThankYouMessage()
        setLoading(false)
        router.back()
    };

  return (
    <KeyboardAvoidingView style={{flex: 1, gap: 20}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <ScrollView style={{flex: 1}} >
            
            {/* Manhwa Name */}
            <Text style={AppStyle.inputHeaderText}>Name</Text>
            <Controller
                control={control}
                name="manhwa_title"
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={AppStyle.input}
                    autoCapitalize="words"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.manhwa_title && (<Text style={AppStyle.error}>{errors.manhwa_title.message}</Text>)}

            {/* Description */}
            <View style={{flexDirection: 'row', gap: 10, alignItems: "center", justifyContent: "center", alignSelf: 'flex-start'}} >
                <Text style={AppStyle.inputHeaderText}>Message</Text>
                <Text style={[AppStyle.textRegular, {fontSize: 12, color: Colors.requestManhwaColor}]}>optional</Text>
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
    
            {/* Request Button */}
            <Pressable onPress={handleSubmit(onSubmit)} style={[AppStyle.formButton, {backgroundColor: Colors.requestManhwaColor}]} >
                {
                    isLoading ? 
                    <ActivityIndicator size={32} color={Colors.backgroundColor} /> :
                    <Text style={AppStyle.formButtonText} >Request</Text>
                }
            </Pressable>
            
            <EmptyFooter/>

        </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default RequestManhwaForm
