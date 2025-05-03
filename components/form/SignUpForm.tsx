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


const schema = yup.object().shape({  
    name: yup
        .string()
        .min(3, 'Username must be at least 3 characters')        
        .max(30, 'Max 30 characters')
        .required('Username is required'),
    email: yup
        .string()
        .email('Please enter a valid email')
        .required('Email is required'),
    password: yup
        .string()
        .min(3, 'Password must be at least 3 characters')
        .required('Password is required'),  
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Password must be the same')
        .required('Password is required')
});

interface FormData {
    name: string
    email: string
    password: string
    confirmPassword: string
}


const SignUpForm = () => {

    const [isLoading, setLoading] = useState(false)
    
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {            
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        },
    });
    
    const onSubmit = async (form_data: FormData) => {
        setLoading(true)

        const error = await spCreateUser(
            form_data.email.trim(),
            form_data.password.trim(),
            form_data.name.trim()
        )

        if (error) {
            console.log(error, error.code)
            switch (error.code) {
                case "weak_password":
                    ToastWeakPassword()
                    break
                default:
                    ToastError(error.message)
                    break
            }
        } else {
            ToastSuccess()
            router.replace("/(auth)/SignIn")
        }

        await supabase.auth.signOut()
        
        setLoading(false)
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
            
            {/* Password */}
            <Text style={styles.inputHeaderText}>Password</Text>
            <Controller
                name="password"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.password && (<Text style={styles.error}>{errors.password.message}</Text>)}

            {/* Confirm Password */}
            <Text style={styles.inputHeaderText}>Confirm password</Text>
            <Controller
                name="confirmPassword"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.confirmPassword && (<Text style={styles.error}>{errors.confirmPassword.message}</Text>)}
    
            {/* Login Button */}
            <Pressable onPress={handleSubmit(onSubmit)} style={styles.formButton} >
                {
                    isLoading ? 
                    <ActivityIndicator size={32} color={Colors.white} /> :
                    <Text style={styles.formButtonText} >Register</Text>
                }
            </Pressable>

        <View style={{flexDirection: "row", marginTop: 20, gap: 4}} >
            <Text style={{color: Colors.white, fontSize: 14}} >Already Have an Account?</Text> 
            <Pressable onPress={() => router.replace("/(auth)/SignIn")}  hitSlop={{left: 10, top: 10, bottom: 10, right: 10}} >
                <Text style={{textDecorationLine: "underline", fontWeight: "bold", color: Colors.white, fontSize: 14}} >
                    Sign In
                </Text> 
            </Pressable>
        </View>
        </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default SignUpForm

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
        backgroundColor: Colors.orange
    },
    formButtonText: {
        color: Colors.white,
        fontSize: 22,
        fontFamily: "LeagueSpartan_400Regular",
    }
})