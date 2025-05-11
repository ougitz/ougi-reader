import { 
    ActivityIndicator,
    StyleSheet, 
    TextInput, 
    Platform, 
    ScrollView, 
    Pressable, 
    KeyboardAvoidingView,
    Text, 
    View 
} from 'react-native'
import { 
    supabase, 
    spGetSession, 
    spFetchUser,    
    spReportBug
} from '@/lib/supabase';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react'
import * as yup from 'yup';
import React from 'react'
import { ToastSuccess } from '@/helpers/ToastMessages';
import { hp } from '@/helpers/util';
import Toast from '../Toast';

const schema = yup.object().shape({  
    title: yup
        .string()
        .min(3, 'Min 3 characters')
        .max(256, 'Max 256 characters')
        .required('Title is required'),
    descr: yup
        .string()
        .max(1024)
        .required("Description is required.")
});


interface FormData {
    title: string
    descr: string
}


const BugReportForm = ({title}: {title: string | undefined | null}) => {
        
    const [isLoading, setLoading] = useState(false)
    
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {            
            title: title ? title: '',
            descr: ''
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        setLoading(true)
        await spReportBug(form_data.title, form_data.descr)
        Toast.show({title: "Thank You!", message: '', type: "success"})
        setLoading(false)
        router.back()
    };

  return (
    <KeyboardAvoidingView style={{flex: 1, gap: 20}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <ScrollView style={{flex: 1}} >
            {/* Email */}
            <Text style={styles.inputHeaderText}>Title</Text>
            <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={styles.input}
                    autoCapitalize="sentences"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.title && (<Text style={styles.error}>{errors.title.message}</Text>)}
            
            {/* Password */}
            <Text style={styles.inputHeaderText}>Description</Text>
            <Controller
                name="descr"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={[styles.input, {height: hp(25), paddingVertical: 10, textAlignVertical: 'top'}]}                    
                    multiline={true}
                    autoCapitalize="sentences"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.descr && (<Text style={styles.error}>{errors.descr.message}</Text>)}
    
            {/* Login Button */}
            <Pressable onPress={handleSubmit(onSubmit)} style={styles.formButton} >
                {
                    isLoading ? 
                    <ActivityIndicator size={32} color={Colors.white} /> :
                    <Text style={styles.formButtonText} >Report</Text>
                }
            </Pressable>
        </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default BugReportForm

const styles = StyleSheet.create({
    input: {
        backgroundColor: Colors.gray1,
        borderRadius: 4,
        height: 50,
        fontSize: 18,
        paddingHorizontal: 10,
        color: Colors.white,
        fontFamily: "LeagueSpartan_400Regular",
        marginBottom: 10,        
    },
    inputHeaderText: {
        color: Colors.white,
        fontSize: 20,
        fontFamily: "LeagueSpartan_400Regular",
        marginBottom: 10
    },
    error: {
        color: Colors.neonRed,
        alignSelf: "flex-start",
        fontSize: 16,
        fontFamily: "LeagueSpartan_200ExtraLight"
    },
    formButton: {
        width: '100%',
        marginTop: 10,
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        borderRadius: 4,
        backgroundColor: Colors.orange
    },
    formButtonText: {
        color: Colors.white,
        fontSize: 22,
        fontFamily: "LeagueSpartan_400Regular",
    }
})