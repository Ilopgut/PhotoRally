import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Menu from '../components/Menu';

const loginValidationSchema = Yup.object().shape({
  email: Yup.string().email('Correo inválido').required('Requerido'),
  password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Requerido'),
});

export default function LoginScreen() {

  const routes = [
  'SignUpScreen',
  'GalleryScreen',
  'ProfileScreen',
  'UploadPhotoScreen',
  'RankingScreen'];

  return (
    <View style={styles.container}>
      <Menu routes={routes} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.body}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Iniciar Sesión</Text>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginValidationSchema}
            onSubmit={(values) => {
              console.log(values);
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
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

                <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                  <Text style={styles.buttonText}>Entrar</Text>
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
    color: '#333',
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
