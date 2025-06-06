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
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from '../FirebaseConfig';
import CloudinaryService from '../services/CloudinaryService';

export default function EditProfileScreen({ navigation }) {
  const auth = getAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

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
          const data = {
            name: user.displayName || userDoc.data().name || '',
            email: user.email || '',
            profileImageUrl: userDoc.data().profileImageUrl || null,
          };
          setUserData(data);
          setCurrentImageUrl(data.profileImageUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'No se pudo cargar la información del usuario');
    } finally {
      setLoading(false);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cámara', onPress: () => pickImage('camera') },
        { text: 'Galería', onPress: () => pickImage('gallery') },
        ...(currentImageUrl ? [{ text: 'Eliminar foto', onPress: deleteImage, style: 'destructive' }] : [])
      ]
    );
  };

  const pickImage = async (source) => {
    try {
      setImageLoading(true);

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Error al seleccionar la imagen');
    } finally {
      setImageLoading(false);
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const uploadResult = await CloudinaryService.uploadImage(imageUri, user.uid);

      if (uploadResult.success) {
        // Actualizar Firestore
        const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
        await updateDoc(userDocRef, {
          profileImageUrl: uploadResult.url,
        });

        setCurrentImageUrl(uploadResult.url);
        Alert.alert('Éxito', 'Imagen actualizada correctamente');
      } else {
        Alert.alert('Error', 'Error al subir la imagen: ' + uploadResult.error);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Error al procesar la imagen');
    }
  };

  const deleteImage = async () => {
    try {
      setImageLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      // Actualizar Firestore (eliminar URL)
      const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
      await updateDoc(userDocRef, {
        profileImageUrl: null,
      });

      setCurrentImageUrl(null);
      Alert.alert('Éxito', 'Imagen eliminada correctamente');
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Error', 'Error al eliminar la imagen');
    } finally {
      setImageLoading(false);
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

  const renderProfileImage = (name) => {
    if (imageLoading) {
      return (
        <View style={styles.profileImagePlaceholder}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      );
    }

    if (currentImageUrl) {
      const optimizedUrl = CloudinaryService.getOptimizedUrl(currentImageUrl, 100, 100);
      return (
        <Image
          source={{ uri: optimizedUrl }}
          style={styles.profileImage}
        />
      );
    } else {
      return (
        <View style={styles.profileImagePlaceholder}>
          <Text style={styles.profileInitial}>{getInitial(name)}</Text>
        </View>
      );
    }
  };

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
      <StatusBar/>

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
                {/* Avatar */}
                <TouchableOpacity
                  style={styles.imageContainer}
                  onPress={showImagePicker}
                  disabled={imageLoading}
                >
                  {renderProfileImage(values.name)}
                  <View style={styles.editIcon}>
                    <Ionicons name="camera" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>

                <Text style={styles.imageHint}>Toca para cambiar tu foto</Text>

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
                  style={[styles.saveButton, (isSubmitting || imageLoading) && styles.saveButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting || imageLoading}
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
    paddingTop:20,
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
    marginBottom: 10,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  imageHint: {
    textAlign: 'center',
    color: '#A0A0A0',
    fontSize: 12,
    marginBottom: 30,
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