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
import { supabase, spCreateUser } from '@/lib/supabase';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react'
import Toast from '../Toast';
import * as yup from 'yup';
import React from 'react'
import { ToastError, ToastSuccess, ToastWeakPassword } from '@/helpers/ToastMessages';
import { useAuthState } from '@/store/authState';


const schema = yup.object().shape({  
    name: yup
        .string()
        .min(3, 'Username must be at least 3 characters')        
        .max(30, 'Max 30 characters')
        .required('Username is required'),
    email: yup
        .string()
        .email('Please enter a valid email')
        .required('Email is required')    
});

interface FormData {
    name: string
    email: string
}


const ChangeProfileInfoForm = () => {

    const [isLoading, setLoading] = useState(false)
    const { user, session } = useAuthState()
    
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {            
            name: user ? user.username : '',
            email: session ? session.user.email! : ''
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        Toast.show({
            title: "Sorry", 
            message: 'At the moment, it is not possible to modify user data.',
            type: "error",
            duration: 3000
        })
    };

  return (
    <KeyboardAvoidingView style={{width: '100%', gap: 20}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <ScrollView style={{width: '100%'}} >
            {/* Name */}
            <Text style={styles.inputHeaderText}>Username</Text>
            <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={styles.input}                    
                    autoComplete='name'
                    autoCapitalize='none'                    
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.name && (<Text style={styles.error}>{errors.name.message}</Text>)}
            {/* Email */}
            <Text style={styles.inputHeaderText}>Email</Text>
            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={styles.input}                    
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.email && (<Text style={styles.error}>{errors.email.message}</Text>)}
        
            {/* Login Button */}
            <Pressable onPress={handleSubmit(onSubmit)} style={styles.formButton} >
                {
                    isLoading ? 
                    <ActivityIndicator size={32} color={Colors.white} /> :
                    <Text style={styles.formButtonText} >Save</Text>
                }
            </Pressable>

        </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default ChangeProfileInfoForm

const styles = StyleSheet.create({
    input: {
        backgroundColor: Colors.gray1,
        borderRadius: 4,
        height: 50,
        fontSize: 18,
        paddingHorizontal: 10,
        color: Colors.white,
        fontFamily: "LeagueSpartan_400Regular",
        marginBottom: 10
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
        backgroundColor: Colors.accountColor
    },
    formButtonText: {
        color: Colors.white,
        fontSize: 22,
        fontFamily: "LeagueSpartan_400Regular",
    }
})