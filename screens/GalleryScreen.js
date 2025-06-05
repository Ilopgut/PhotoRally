import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Menu from '../components/Menu';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, increment } from 'firebase/firestore';
import { FIRESTORE_DB } from '../FirebaseConfig';
import CloudinaryService from '../services/CloudinaryService';

const numColumns = 2;
const screenWidth = Dimensions.get('window').width;
const imageSize = screenWidth / numColumns - 15;

export default function GalleryScreen({ navigation }) {
  const auth = getAuth();
  const [userRole, setUserRole] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [photoTitle, setPhotoTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const routes = ['LoginScreen', 'SignUpScreen', 'HomeScreen', 'ProfileScreen', 'RankingScreen'];

  useEffect(() => {
    fetchUserRole();
    fetchPhotos();
  }, []);

  const fetchUserRole = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role);
      }
    }
  };

  const fetchPhotos = async () => {
    try {
      const photosRef = collection(FIRESTORE_DB, 'photos');
      const photosSnapshot = await getDocs(photosRef);
      const photosData = photosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Mostrar solo fotos aprobadas
      setPhotos(photosData);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setUploadModalVisible(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage || !photoTitle.trim()) {
      Alert.alert('Error', 'Selecciona una imagen y añade un título');
      return;
    }

    setUploading(true);
    try {
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', user.uid));
      const userName = userDoc.data().name || 'Usuario';

      // Subir imagen a Cloudinary
      const uploadResult = await CloudinaryService.uploadImage(selectedImage, user.uid);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Guardar en Firestore
      await addDoc(collection(FIRESTORE_DB, 'photos'), {
        photo_id: `photo_${Date.now()}`,
        title: photoTitle.trim(),
        image_url: uploadResult.url,
        user_id: user.uid,
        user_name: userName,
        vote_count: 0,
        created_at: new Date(),
      });

      // Actualizar contador de fotos del usuario
      await updateDoc(doc(FIRESTORE_DB, 'users', user.uid), {
        photos_submitted: increment(1)
      });

      Alert.alert('Éxito', 'Foto subida correctamente');
      setUploadModalVisible(false);
      setSelectedImage(null);
      setPhotoTitle('');
      fetchPhotos();

    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

const renderPhoto = ({ item }) => {
  return (
    <TouchableOpacity
      style={styles.photoContainer}
      onPress={() => navigation.navigate('PhotoDetail', { photo: item })}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.photo}
        defaultSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
      />
    </TouchableOpacity>
  );
};

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Menu routes={routes} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C7CE7" />
          <Text style={styles.loadingText}>Cargando fotos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Menu routes={routes} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Galería de Fotos</Text>
        <Text style={styles.headerSubtitle}>{photos.length} fotos</Text>
      </View>

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={renderPhoto}
        numColumns={numColumns}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {userRole === 'participant' && (
        <TouchableOpacity style={styles.fab} onPress={pickImage}>
          <Ionicons name="camera" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Modal de subida */}
      <Modal
        visible={uploadModalVisible}
        transparent={true}
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Subir Foto</Text>
              <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            )}

            <TextInput
              style={styles.input}
              placeholder="Título de la foto"
              placeholderTextColor="#A0A0A0"
              value={photoTitle}
              onChangeText={setPhotoTitle}
              maxLength={50}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setUploadModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                onPress={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.uploadButtonText}>Subir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    marginTop: 5,
  },
  listContent: {
    padding: 12,
    paddingBottom: 100,
  },
  photoContainer: {
    margin: 3,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  photo: {
    width: imageSize,
    height: imageSize,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
  },
  voteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  voteCount: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  photoTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C7CE7',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#2a2a3a',
    color: '#fff',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6C7CE7',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6C7CE7',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#6C7CE7',
    marginLeft: 10,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#4a4a5a',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});