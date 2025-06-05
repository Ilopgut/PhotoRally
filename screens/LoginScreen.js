import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../FirebaseConfig';
import Menu from '../components/Menu';

const loginValidationSchema = Yup.object().shape({
  email: Yup.string().email('Correo inválido').required('Requerido'),
  password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Requerido'),
});

export default function LoginScreen() {
  const navigation = useNavigation();
  const [authError, setAuthError] = useState('');

  const routes = [
    'HomeScreen',
    'SignUpScreen',
    'GalleryScreen',
    'ProfileScreen',
    'RankingScreen'
  ];

  const handleLogin = async (values, { setSubmitting }) => {
    setAuthError('');
    const email = values.email.trim().toLowerCase(); // Asegurarse que coincide con Firestore

    try {
      // Verificar si el usuario existe en Firestore
      const usersRef = collection(FIRESTORE_DB, 'users');
      const snapshot = await getDocs(usersRef);
      const userDoc = snapshot.docs.find(doc => doc.data().email?.toLowerCase() === email);

      if (!userDoc) {
        setAuthError('Este usuario no está registrado en el sistema.');
        return;
      }

      // Si existe, proceder a autenticar
      const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, values.password);
      const user = userCredential.user;

      // Actualizar el campo is_active
      const userRef = doc(FIRESTORE_DB, 'users', user.uid);
      await updateDoc(userRef, { is_active: true });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('Correo o contraseña incorrectos');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <View style={styles.container}>
      <Menu routes={routes} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.body}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Iniciar Sesión</Text>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginValidationSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <View style={styles.form}>
                <TextInput
                  placeholder="Correo electrónico"
                  placeholderTextColor="#aaa"
                  style={styles.input}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

                <TextInput
                  placeholder="Contraseña"
                  placeholderTextColor="#aaa"
                  style={styles.input}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  secureTextEntry
                />
                {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

                {authError !== '' && <Text style={styles.authError}>{authError}</Text>}

                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[styles.button, isSubmitting && { backgroundColor: '#aaa' }]}
                  disabled={isSubmitting}
                >
                  <Text style={styles.buttonText}>
                    {isSubmitting ? 'Entrando...' : 'Entrar'}
                  </Text>
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
  authError: {
    color: '#E63946',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
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
