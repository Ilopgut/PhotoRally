import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Menu from '../components/Menu';

export default function HomeScreen() {
  const routes = ['LoginScreen',
  'SignUpScreen',
  'GalleryScreen',
  'ProfileScreen',
  'UploadPhotoScreen',
  'RankingScreen',
  'EditProfileScreen'];

  // Datos reales del concurso - Firebase Database Structure
  const rallyConfig = {
    created_at: "18 de mayo de 2025, 12:00:00 a.m. UTC+2",
    description: "Rally de fotografía de temática naturaleza",
    is_active: true,
    max_photos_per_user: 3,
    max_votes_per_user: 5,
    registration_end: "25 de mayo de 2025, 12:00:00 a.m. UTC+2",
    registration_start: "24 de mayo de 2025, 12:00:00 a.m. UTC+2",
    rules: "reglas",
    submission_end: "27 de mayo de 2025, 12:00:00 a.m. UTC+2",
    submission_start: "26 de mayo de 2025, 12:00:00 a.m. UTC+2",
    title: "PhotoRally",
    voting_end: "29 de mayo de 2025, 12:00:00 a.m. UTC+2",
    voting_start: "28 de mayo de 2025, 12:00:00 a.m. UTC+2"
  };

  // Función para calcular días restantes
  const calculateDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Datos calculados para el dashboard
  const dashboardData = {
    activeContest: {
      title: rallyConfig.title,
      description: rallyConfig.description,
      daysLeft: calculateDaysRemaining(rallyConfig.voting_end),
      totalPhotos: 234, // Esto vendrá de Firebase en el futuro
      participants: 89   // Esto vendrá de Firebase en el futuro
    },
    recentPhotos: [
      { id: 1, url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", votes: 23, title: "Atardecer en la montaña" },
      { id: 2, url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400", votes: 18, title: "Bosque misterioso" },
      { id: 3, url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400", votes: 31, title: "Playa tropical" }
    ]
  };

  const contestRules = {
    theme: "Fotografía de Naturaleza",
    description: rallyConfig.description,
    rules: [
      `Máximo ${rallyConfig.max_photos_per_user} fotografías por participante`,
      `Máximo ${rallyConfig.max_votes_per_user} votos por usuario`,
      "Registro: 24-25 de mayo de 2025",
      "Envío de fotos: 26-27 de mayo de 2025",
      "Votación: 28-29 de mayo de 2025",
      "Temática: Naturaleza y paisajes"
    ]
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light"/>
      <Menu routes={routes} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección de Normas del Concurso */}
        <View style={styles.rulesContainer}>
          <View style={styles.rulesHeader}>
            <Ionicons name="document-text" size={24} color="#4ECDC4" style={styles.rulesIcon} />
            <Text style={styles.rulesTitle}>Normas del Concurso</Text>
          </View>

          <View style={styles.themeSection}>
            <Text style={styles.themeTitle}>{contestRules.theme}</Text>
            <Text style={styles.themeDescription}>{contestRules.description}</Text>
          </View>

          <View style={styles.rulesList}>
            {contestRules.rules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <View style={styles.ruleBullet}>
                  <Text style={styles.ruleNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
        </View>


        {/* Estadísticas del concurso */}
        <View style={styles.contestStatsContainer}>
          <Text style={styles.sectionTitle}>Estadísticas del Concurso</Text>
          <View style={styles.contestStatsGrid}>
            <View style={styles.contestStatItem}>
              <Ionicons name="images" size={20} color="#6C7CE7" />
              <View style={styles.contestStatText}>
                <Text style={styles.contestStatNumber}>{dashboardData.activeContest.totalPhotos}</Text>
                <Text style={styles.contestStatLabel}>Fotos Totales</Text>
              </View>
            </View>

            <View style={styles.contestStatItem}>
              <Ionicons name="people" size={20} color="#6C7CE7" />
              <View style={styles.contestStatText}>
                <Text style={styles.contestStatNumber}>{dashboardData.activeContest.participants}</Text>
                <Text style={styles.contestStatLabel}>Participantes</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fotos destacadas */}
        <View style={styles.featuredPhotosContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fotos Destacadas</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
            {dashboardData.recentPhotos.map((photo) => (
              <TouchableOpacity key={photo.id} style={styles.photoCard}>
                <Image source={{ uri: photo.url }} style={styles.photoImage} />
                <View style={styles.photoOverlay}>
                  <View style={styles.photoVotes}>
                    <Ionicons name="heart" size={14} color="#E74C3C" />
                    <Text style={styles.photoVotesText}>{photo.votes}</Text>
                  </View>
                </View>
                <Text style={styles.photoTitle} numberOfLines={2}>{photo.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  // Estilos para la sección de normas
  rulesContainer: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rulesIcon: {
    marginRight: 12,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  themeSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 8,
  },
  themeDescription: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
  },
  rulesList: {
    marginBottom: 15,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ruleBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  ruleNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F0F23',
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#D0D0D0',
    lineHeight: 20,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  // Estilos para el cronograma
  scheduleContainer: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  scheduleIcon: {
    marginRight: 12,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  scheduleList: {
    gap: 15,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
  },
  schedulePhase: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phaseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  phaseDate: {
    fontSize: 12,
    color: '#B0B0B0',
    marginRight: 10,
  },
  phaseStatus: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4ECDC4',
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  contestBanner: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  bannerIcon: {
    marginRight: 15,
  },
  bannerText: {
    flex: 1,
  },
  contestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
  },
  contestDescription: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 10,
  },
  contestStats: {
    flexDirection: 'row',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    fontSize: 12,
    color: '#E74C3C',
    marginLeft: 4,
    fontWeight: '600',
  },
  participateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C7CE7',
    paddingVertical: 12,
    borderRadius: 10,
  },
  participateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  statIcon: {
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#A0A0A0',
    textAlign: 'center',
  },
  contestStatsContainer: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  contestStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contestStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contestStatText: {
    marginLeft: 10,
  },
  contestStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  contestStatLabel: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  featuredPhotosContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  seeAllText: {
    color: '#6C7CE7',
    fontSize: 14,
    fontWeight: '600',
  },
  photosScroll: {
    paddingLeft: 20,
  },
  photoCard: {
    width: 150,
    marginRight: 15,
  },
  photoImage: {
    width: 150,
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  photoOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  photoVotes: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoVotesText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  photoTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  quickActionsContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#1a1a1a',
    width: '48%',
    alignItems: 'center',
    paddingVertical: 25,
    borderRadius: 12,
    marginBottom: 15,
  },
  actionIcon: {
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
});