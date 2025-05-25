import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState('María González');
  const [email, setEmail] = useState('usuarioEjemplo@gmail.com');
  const [photo, setPhoto] = useState('https://via.placeholder.com/100');

  const handleSave = () => {
    // Lógica para guardar los cambios
    navigation.goBack();
  };

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

      <View style={styles.content}>
        <TouchableOpacity style={styles.imageContainer}>
          <Image source={{ uri: photo }} style={styles.profileImage} />
          <View style={styles.editIcon}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor="#A0A0A0"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor="#A0A0A0"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="save" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    padding: 20,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6C7CE7',
    borderRadius: 12,
    padding: 4,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
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
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
