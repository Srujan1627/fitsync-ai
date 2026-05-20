import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import GlassCard from '../components/GlassCard';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import Skeleton from '../components/Skeleton';

const StatRing = ({ label, value, unit, color, icon }: any) => (
  <View style={styles.statContainer}>
    <View style={[styles.ringOuter, { borderColor: color }]}>
      <Ionicons name={icon} size={24} color={color} style={styles.statIcon} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const DashboardScreen = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const fetchStats = async () => {
    try {
      const response = await api.get('/workouts/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );


  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Skeleton width={120} height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="80%" height={32} />
          </View>
          <Skeleton width={48} height={48} borderRadius={24} />
        </View>

        <Skeleton width="100%" height={160} borderRadius={24} style={{ marginBottom: 32 }} />

        <Skeleton width={140} height={24} style={{ marginBottom: 20 }} />
        
        <View style={styles.statsGrid}>
          <View style={[styles.statContainer, { borderColor: 'transparent', backgroundColor: 'rgba(28, 28, 30, 0.2)' }]}>
            <Skeleton width={80} height={80} borderRadius={40} style={{ marginBottom: 16 }} />
            <Skeleton width={60} height={16} />
          </View>
          <View style={[styles.statContainer, { borderColor: 'transparent', backgroundColor: 'rgba(28, 28, 30, 0.2)' }]}>
            <Skeleton width={80} height={80} borderRadius={40} style={{ marginBottom: 16 }} />
            <Skeleton width={60} height={16} />
          </View>
          <View style={[styles.statContainer, { borderColor: 'transparent', backgroundColor: 'rgba(28, 28, 30, 0.2)' }]}>
            <Skeleton width={80} height={80} borderRadius={40} style={{ marginBottom: 16 }} />
            <Skeleton width={60} height={16} />
          </View>
          <View style={[styles.statContainer, { borderColor: 'transparent', backgroundColor: 'rgba(28, 28, 30, 0.2)' }]}>
            <Skeleton width={80} height={80} borderRadius={40} style={{ marginBottom: 16 }} />
            <Skeleton width={60} height={16} />
          </View>
        </View>
      </ScrollView>
    );
  }


  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</Text>
            <Text style={styles.greeting}>Ready to sweat, <Text style={{color: colors.primary}}>{user?.name.split(' ')[0]}</Text>?</Text>
          </View>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color={colors.background} />
          </View>
        </View>

        <GlassCard style={styles.scoreCard} intensity={30}>
          <LinearGradient
            colors={[colors.secondary, '#FF5E3A']}
            style={styles.scoreGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          />
          <Text style={styles.scoreTitle}>Activity Ring</Text>
          <Text style={styles.scoreValue}>{stats?.fitnessScore || 0}<Text style={{fontSize: 24}}>/100</Text></Text>
          <Text style={styles.scoreDesc}>Keep crushing your goals!</Text>
        </GlassCard>

        <Text style={styles.sectionTitle}>Daily Metrics</Text>
        <View style={styles.statsGrid}>
          <StatRing label="Move" value={stats?.dailyCalories || 0} unit="KCAL" color={colors.secondary} icon="flame" />
          <StatRing label="Exercise" value={stats?.dailyDuration || 0} unit="MIN" color={colors.primary} icon="stopwatch" />
          <StatRing label="Steps" value={stats?.stepCount || 0} unit="STEPS" color={colors.tertiary} icon="footsteps" />
          <StatRing label="Hydrate" value={stats?.waterIntake || 0} unit="ML" color="#00BFFF" icon="water" />
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 50,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 1,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCard: {
    paddingVertical: 32,
    marginBottom: 32,
    position: 'relative',
    alignItems: 'center',
  },
  scoreGradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.15,
  },
  scoreTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -2,
  },
  scoreDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statContainer: {
    width: '47%',
    backgroundColor: 'rgba(28, 28, 30, 0.4)',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  ringOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIcon: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  statUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default DashboardScreen;
