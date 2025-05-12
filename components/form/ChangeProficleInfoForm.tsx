import { 
    ActivityIndicator,
    TextInput, 
    Platform, 
    ScrollView, 
    Pressable, 
    KeyboardAvoidingView,
    Text
} from 'react-native'
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuthState } from '@/store/authState';
import { AppStyle } from '@/styles/AppStyles';
import { Colors } from '@/constants/Colors';
import { useState } from 'react'
import Toast from '../Toast';
import * as yup from 'yup';
import React from 'react'


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
            <Text style={AppStyle.inputHeaderText}>Username</Text>
            <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={AppStyle.input}                    
                    autoComplete='name'
                    autoCapitalize='none'                    
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.name && (<Text style={AppStyle.error}>{errors.name.message}</Text>)}
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
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                )}
            />
            {errors.email && (<Text style={AppStyle.error}>{errors.email.message}</Text>)}
        
            {/* Login Button */}
            <Pressable onPress={handleSubmit(onSubmit)} style={AppStyle.formButton} >
                {
                    isLoading ? 
                    <ActivityIndicator size={32} color={Colors.white} /> :
                    <Text style={AppStyle.formButtonText} >Save</Text>
                }
            </Pressable>

        </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default ChangeProfileInfoForm
