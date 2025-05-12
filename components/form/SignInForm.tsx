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
    spFetchUser    
} from '@/lib/supabase';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react'
import { dbPopulateReadingStatusTable } from '@/lib/database';
import * as yup from 'yup';
import React from 'react'
import { useAuthState } from '@/store/authState';
import { ToastError, ToastSuccess } from '@/helpers/ToastMessages';
import { useSQLiteContext } from 'expo-sqlite';
import { AppStyle } from '@/styles/AppStyles';

const schema = yup.object().shape({  
    email: yup
        .string()
        .email('Please enter a valid email')
        .required('Email is required'),
    password: yup
        .string()
        .min(3, 'Password must be at least 3 characters')
        .required('Password is required'),  
});


interface FormData {
    email: string
    password: string
}


const SignInForm = () => {
    
    const db = useSQLiteContext()
    const { login } = useAuthState()  
    const [isLoading, setLoading] = useState(false)
    
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {            
            email: '',
            password: '',            
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        setLoading(true)

        const { error } = await supabase.auth.signInWithPassword({
            email: form_data.email,
            password: form_data.password
        })

        if (error) {
            ToastError(error.message)
            setLoading(false)
            return
        }
    
        const session = await spGetSession()

        if (!session) {
            ToastError('server error')            
            setLoading(false)
            return
        }

        await spFetchUser(session.user.id)    
            .then(user => {
                if (!user) {
                    console.log("error fetching user in sign in", session.user.id)
                } else {
                    login(user, session)
                }
            })

        dbPopulateReadingStatusTable(db, session.user.id)

        setLoading(false)
        ToastSuccess()
        router.replace("/(pages)/Home")
    };

  return (
    <KeyboardAvoidingView style={{width: '100%', gap: 20}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <ScrollView style={{width: '100%'}} >
            {/* Email */}
            <Text style={AppStyle.inputHeaderText}>Email</Text>
            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={AppStyle.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete='email'                    
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.email && (<Text style={AppStyle.error}>{errors.email.message}</Text>)}
            
            {/* Password */}
            <Text style={AppStyle.inputHeaderText}>Password</Text>
            <Controller
                name="password"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={AppStyle.input}                    
                    secureTextEntry
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.password && (<Text style={AppStyle.error}>{errors.password.message}</Text>)}
    
            {/* Login Button */}
            <Pressable onPress={handleSubmit(onSubmit)} style={AppStyle.formButton} >
                {
                    isLoading ? 
                    <ActivityIndicator size={32} color={Colors.backgroundColor} /> :
                    <Text style={AppStyle.formButtonText} >Login</Text>
                }
            </Pressable>
        <View style={{flexDirection: "row", marginTop: 20, gap: 4}} >
            <Text style={{color: Colors.white, fontSize: 14}} >Don't Have an Account?</Text> 
            <Pressable onPress={() => router.replace("/(auth)/SignUp")}  hitSlop={{left: 10, top: 10, bottom: 10, right: 10}} >
                <Text style={{textDecorationLine: "underline", fontWeight: "bold", color: Colors.white, fontSize: 14}} >Sign Up</Text> 
            </Pressable>
        </View>
        </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default SignInForm
