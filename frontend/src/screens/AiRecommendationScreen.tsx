import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import GlassCard from '../components/GlassCard';
import api from '../services/api';
import Skeleton from '../components/Skeleton';

const AiRecommendationScreen = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get('/ai/recommendations');
        setRecommendations(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <Skeleton width={150} height={34} style={{ marginBottom: 12 }} />
          <Skeleton width="75%" height={16} />
        </View>

        <View style={{ gap: 20 }}>
          <View style={[styles.card, { borderColor: 'transparent', backgroundColor: 'rgba(28, 28, 30, 0.2)', minHeight: 180, padding: 24, borderRadius: 24 }]}>
            <View style={[styles.cardHeader, { marginBottom: 16 }]}>
              <Skeleton width={180} height={20} />
              <Skeleton width={80} height={24} borderRadius={12} />
            </View>
            <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="90%" height={14} style={{ marginBottom: 20 }} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Skeleton width={80} height={32} borderRadius={12} />
              <Skeleton width={80} height={32} borderRadius={12} />
            </View>
          </View>

          <View style={[styles.card, { borderColor: 'transparent', backgroundColor: 'rgba(28, 28, 30, 0.2)', minHeight: 180, padding: 24, borderRadius: 24 }]}>
            <View style={[styles.cardHeader, { marginBottom: 16 }]}>
              <Skeleton width={150} height={20} />
              <Skeleton width={80} height={24} borderRadius={12} />
            </View>
            <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="60%" height={14} style={{ marginBottom: 20 }} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Skeleton width={80} height={32} borderRadius={12} />
              <Skeleton width={80} height={32} borderRadius={12} />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }


  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Coach</Text>
          <Text style={styles.subtitle}>Personalized training just for you.</Text>
        </View>

        {recommendations.map((rec, index) => {
          // Assign different gradient colors based on index to look dynamic
          const gradients: [string, string][] = [
            [colors.secondary, '#FF5E3A'],
            [colors.primary, '#A3CC00'],
            [colors.tertiary, '#00A2FF']
          ];
          const grad = gradients[index % gradients.length];


          return (
            <GlassCard key={index} style={styles.card} intensity={30}>
              <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                  <Ionicons name="flash" size={24} color={grad[0]} style={{marginRight: 8}} />
                  <Text style={styles.workoutTitle}>{rec.title}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{rec.difficulty.toUpperCase()}</Text>
                </View>
              </View>
              
              <Text style={styles.reasonText}>{rec.reason}</Text>
              
              <View style={styles.metaData}>
                <View style={styles.metaBadge}>
                  <Ionicons name="time" size={16} color={colors.textPrimary} style={{marginRight: 4}} />
                  <Text style={styles.metaText}>{rec.duration}</Text>
                </View>
                <View style={styles.metaBadge}>
                  <Ionicons name="flame" size={16} color={colors.textPrimary} style={{marginRight: 4}} />
                  <Text style={styles.metaText}>{rec.calories}</Text>
                </View>
              </View>
              <LinearGradient
                colors={grad}
                style={styles.cardAccent}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              />
            </GlassCard>
          );
        })}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 40,
    marginTop: 60,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 8,
  },
  card: {
    marginBottom: 20,
    padding: 24,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  reasonText: {
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: '500',
  },
  metaData: {
    flexDirection: 'row',
    gap: 12,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  metaText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  cardAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  }
});

export default AiRecommendationScreen;
