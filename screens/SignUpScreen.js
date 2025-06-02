import React from 'react';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../FirebaseConfig';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import Menu from '../components/Menu';

export default function SignUpScreen({navigation}) {
  const routes = ['HomeScreen', 'LoginScreen', 'GalleryScreen', 'ProfileScreen', 'UploadPhotoScreen', 'RankingScreen'];

  const [registrationError,setRegistrationError] = useState('');

  const SignUpSchema = Yup.object().shape({
    username: Yup.string().required('Usuario requerido'),
    email: Yup.string().email('Email inválido').required('Email requerido'),
    password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Contraseña requerida'),
  });

  const handleSignUp = async (values, { setSubmitting }) => {
    setRegistrationError('');
    const email = values.email.trim().toLowerCase();

    try {
      // 1. Verificar si el usuario ya existe en la colección 'users'
      const q = query(collection(FIRESTORE_DB, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setRegistrationError('Este correo ya está registrado. Intenta iniciar sesión o usa otro correo.');
        return;
      }

      // 2. Intentar crear el usuario en Firebase Auth
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, values.password);
      } catch (authError) {
        if (authError.code === 'auth/email-already-in-use') {
          // El usuario ya existe en Auth pero no en la colección -> inconsistencia
          const tempUser = await signInWithEmailAndPassword(FIREBASE_AUTH, email, values.password);
          userCredential = tempUser;
        } else {
          throw authError;
        }
      }

      const user = userCredential.user;

      // 3. Actualizar displayName si fue creado recientemente
      await updateProfile(user, { displayName: values.username });

      // 4. Crear documento en Firestore
      const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: email,
        name: values.username,
        photos_submitted: 0,
        votes_given: 0,
        role: 'participant',
        is_active: true,
      });

      Alert.alert('Registro exitoso', 'Bienvenido, ' + values.username);
      navigation.navigate('Home');

    } catch (error) {
      console.error('Error en el registro:', error);

      if (error.code === 'auth/email-already-in-use') {
        setRegistrationError('Este correo ya está en uso. Intenta iniciar sesión.');
      } else {
        setRegistrationError('Ocurrió un error durante el registro. Intenta más tarde.');
      }
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <View style={styles.container}>
      <Menu routes={routes} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.body}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Registro</Text>

          <Formik
            initialValues={{ username: '', email: '', password: '' }}
            validationSchema={SignUpSchema}
            onSubmit={handleSignUp}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <View style={styles.form}>
                <TextInput
                  placeholder="Usuario"
                  placeholderTextColor="#aaa"
                  style={styles.input}
                  onChangeText={handleChange('username')}
                  onBlur={handleBlur('username')}
                  value={values.username}
                  editable={!isSubmitting}
                />
                {errors.username && touched.username && <Text style={styles.error}>{errors.username}</Text>}

                <TextInput
                  placeholder="Correo electrónico"
                  placeholderTextColor="#aaa"
                  style={styles.input}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSubmitting}
                />
                {errors.email && touched.email && <Text style={styles.error}>{errors.email}</Text>}

                <TextInput
                  placeholder="Contraseña"
                  placeholderTextColor="#aaa"
                  style={styles.input}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  secureTextEntry
                  editable={!isSubmitting}
                />
                {errors.password && touched.password && <Text style={styles.error}>{errors.password}</Text>}

                {registrationError && <Text style={styles.error}>Error al registrarse: {registrationError}</Text>}
                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
                  <Text style={styles.buttonText}>{isSubmitting ? 'Registrando...' : 'Registrarse'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: 'white',
  },
  form: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#1a1a1a',
    color: '#fff',
  },
  error: {
    color: '#E63946',
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#5459AC',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
