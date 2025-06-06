import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';

import Menu from '../components/Menu';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from '../FirebaseConfig';

// Esquema de validación con Yup
const validationSchema = Yup.object({
  title: Yup.string()
    .required('El título es obligatorio')
    .min(3, 'El título debe tener al menos 3 caracteres'),
  description: Yup.string()
    .required('La descripción es obligatoria')
    .min(10, 'La descripción debe tener al menos 10 caracteres'),
  max_photos_per_user: Yup.number()
    .required('Máximo de fotos es obligatorio')
    .min(1, 'Debe permitir al menos 1 foto')
    .max(50, 'Máximo 50 fotos por usuario'),
  max_votes_per_user: Yup.number()
    .required('Máximo de votos es obligatorio')
    .min(1, 'Debe permitir al menos 1 voto')
    .max(100, 'Máximo 100 votos por usuario'),
});

export default function EditRallyInfoScreen({navigation}){
    const [rallyInfo, setRallyInfo] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [saving, setSaving] = useState(false);

    const routes = [
        'GalleryScreen',
        'ProfileScreen',
        'HomeScreen',
    ];

    useEffect(() => {
        const fetchRallyInfo = async () => {
            try{
                const rallyDocRef = doc(FIRESTORE_DB, 'rally_config', 'rallyEjemplo');
                const rallyDoc = await getDoc(rallyDocRef);

                if (rallyDoc.exists()) {
                    const data = rallyDoc.data();
                    setRallyInfo({
                        created_at: data.created_at,
                        description: data.description,
                        is_active: data.is_active,
                        max_photos_per_user: data.max_photos_per_user,
                        max_votes_per_user: data.max_votes_per_user,
                        registration_end: data.registration_end,
                        registration_start: data.registration_start,
                        submission_end: data.submission_end,
                        submission_start: data.submission_start,
                        title: data.title,
                        voting_end: data.voting_end,
                        voting_start: data.voting_start,
                    });
                } else {
                    setErrorMessage("No se encontró la configuración del rally");
                }
            }catch(error){
                console.error('Error:', error);
                setErrorMessage("Parece que ha habido un problema. Por favor, inténtelo más tarde.");
            }
        };
        fetchRallyInfo();
    },[]);

    const handleSave = async (values) => {
        try {
            setSaving(true);
            const rallyDocRef = doc(FIRESTORE_DB, 'rally_config', 'rallyEjemplo');

            await updateDoc(rallyDocRef, {
                title: values.title,
                description: values.description,
                is_active: values.is_active,
                max_photos_per_user: parseInt(values.max_photos_per_user),
                max_votes_per_user: parseInt(values.max_votes_per_user),
            });

            Alert.alert('Éxito', 'La información del rally se ha actualizado correctamente');

            // Actualizar el estado local
            setRallyInfo(prev => ({
                ...prev,
                ...values,
                max_photos_per_user: parseInt(values.max_photos_per_user),
                max_votes_per_user: parseInt(values.max_votes_per_user),
            }));

            navigation.navigate('Home');
        } catch (error) {
            console.error('Error al guardar:', error);
            Alert.alert('Error', 'No se pudo guardar la información');
        } finally {
            setSaving(false);
        }
    };

    if (errorMessage) {
        return (
            <View style={styles.container}>
                <StatusBar/>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
                <Menu routes={routes} />
            </View>
        );
    }

    if (!rallyInfo) {
        return (
            <View style={styles.container}>
                <StatusBar/>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingContent}>Cargando...</Text>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar/>
            <Menu routes={routes} />
            <ScrollView style={styles.scrollContainer}>
                <Text style={styles.headerTitle}>Editar Rally</Text>
                <Formik
                    initialValues={{
                        title: rallyInfo.title || '',
                        description: rallyInfo.description || '',
                        is_active: rallyInfo.is_active || false,
                        max_photos_per_user: rallyInfo.max_photos_per_user?.toString() || '5',
                        max_votes_per_user: rallyInfo.max_votes_per_user?.toString() || '10',
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSave}
                >
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
                        <View style={styles.form}>
                            {/* Título */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Título</Text>
                                <TextInput
                                    style={styles.input}
                                    value={values.title}
                                    onChangeText={handleChange('title')}
                                    onBlur={handleBlur('title')}
                                    placeholder="Título del rally"
                                    placeholderTextColor="#666"
                                />
                                {touched.title && errors.title && (
                                    <Text style={styles.errorText}>{errors.title}</Text>
                                )}
                            </View>

                            {/* Descripción */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Descripción</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={values.description}
                                    onChangeText={handleChange('description')}
                                    onBlur={handleBlur('description')}
                                    placeholder="Descripción del rally"
                                    placeholderTextColor="#666"
                                    multiline
                                    numberOfLines={4}
                                />
                                {touched.description && errors.description && (
                                    <Text style={styles.errorText}>{errors.description}</Text>
                                )}
                            </View>

                            {/* Máximo de fotos */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Máximo de fotos por usuario</Text>
                                <TextInput
                                    style={styles.input}
                                    value={values.max_photos_per_user}
                                    onChangeText={handleChange('max_photos_per_user')}
                                    onBlur={handleBlur('max_photos_per_user')}
                                    placeholder="5"
                                    placeholderTextColor="#666"
                                    keyboardType="numeric"
                                />
                                {touched.max_photos_per_user && errors.max_photos_per_user && (
                                    <Text style={styles.errorText}>{errors.max_photos_per_user}</Text>
                                )}
                            </View>

                            {/* Máximo de votos */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Máximo de votos por usuario</Text>
                                <TextInput
                                    style={styles.input}
                                    value={values.max_votes_per_user}
                                    onChangeText={handleChange('max_votes_per_user')}
                                    onBlur={handleBlur('max_votes_per_user')}
                                    placeholder="10"
                                    placeholderTextColor="#666"
                                    keyboardType="numeric"
                                />
                                {touched.max_votes_per_user && errors.max_votes_per_user && (
                                    <Text style={styles.errorText}>{errors.max_votes_per_user}</Text>
                                )}
                            </View>

                            {/* Botón Guardar */}
                            <TouchableOpacity
                                style={[styles.saveButton, saving && styles.disabledButton]}
                                onPress={handleSubmit}
                                disabled={saving}
                            >
                                <Text style={styles.saveButtonText}>
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Formik>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F23',
    },
    scrollContainer: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingTop: 10,
        backgroundColor: '#1a1a1a',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        marginTop:20,
    },
    form: {
        padding: 20,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: '#666',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContent: {
        fontSize: 18,
        color: '#fff',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 14,
        marginTop: 5,
    },
});