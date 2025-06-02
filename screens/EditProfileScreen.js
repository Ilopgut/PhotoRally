import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from '../FirebaseConfig';

export default function EditProfileScreen({ navigation }) {
  const auth = getAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Schema de validación (solo nombre)
  const EditProfileSchema = Yup.object().shape({
    name: Yup.string().required('Nombre requerido'),
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserData({
            name: user.displayName || userDoc.data().name || '',
            email: user.email || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'No se pudo cargar la información del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values, { setSubmitting }) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Usuario no autenticado');
        return;
      }

      // Actualizar el displayName en Firebase Auth
      await updateProfile(user, {
        displayName: values.name
      });

      // Actualizar documento en Firestore
      const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
      await updateDoc(userDocRef, {
        name: values.name,
      });

      Alert.alert(
        'Éxito',
        'Perfil actualizado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate("Home")
          }
        ]
      );

    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Error al actualizar el perfil');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Error al cargar el perfil</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Formik
            initialValues={{
              name: userData.name,
            }}
            validationSchema={EditProfileSchema}
            onSubmit={handleSave}
            enableReinitialize={true}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <>
                {/* Avatar placeholder */}
                <View style={styles.imageContainer}>
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileInitial}>{getInitial(values.name)}</Text>
                  </View>
                  <TouchableOpacity style={styles.editIcon}>
                    <Ionicons name="camera" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Campo Nombre */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre"
                    placeholderTextColor="#A0A0A0"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    editable={!isSubmitting}
                  />
                  {errors.name && touched.name && (
                    <Text style={styles.error}>{errors.name}</Text>
                  )}
                </View>

                {/* Email solo lectura */}
                <View style={styles.inputContainer}>
                  <View style={styles.emailReadOnly}>
                    <Text style={styles.emailText}>{userData.email}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Ionicons name="save" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6C7CE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6C7CE7',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#0F0F23',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  error: {
    color: '#E63946',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  emailReadOnly: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    opacity: 0.7,
  },
  emailLabel: {
    color: '#A0A0A0',
    fontSize: 12,
    marginBottom: 5,
  },
  emailText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C7CE7',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#4a4a5a',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
});