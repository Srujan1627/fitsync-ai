import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Animated, Platform, Modal, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import GlassCard from '../components/GlassCard';
import Skeleton from '../components/Skeleton';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import { showAlert } from '../utils/alert';


const EXERCISE_TYPES = [
  { name: 'Walking', met: 3.8, icon: 'walk-outline' },
  { name: 'Running', met: 9.8, icon: 'fitness-outline' },
  { name: 'Cycling', met: 7.5, icon: 'bicycle-outline' },
  { name: 'Skipping', met: 11.0, icon: 'flash-outline' },
  { name: 'Pushups', met: 8.0, icon: 'barbell-outline' },
  { name: 'Yoga', met: 3.0, icon: 'body-outline' },
];

const AnalyticsScreen = () => {
  const { user } = useAuthStore();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'calories' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Edit Workout States
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editType, setEditType] = useState('Walking');
  const [editDuration, setEditDuration] = useState('');
  const [editSteps, setEditSteps] = useState('');
  const [editCalculatedCalories, setEditCalculatedCalories] = useState('0');
  const [editLoading, setEditLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const fetchWorkouts = async () => {
    try {
      const response = await api.get('/workouts');
      setWorkouts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
    }, [])
  );


  // Dynamically calculate calories burned during edits in real-time
  useEffect(() => {
    if (!selectedWorkout) return;
    
    const activeEx = EXERCISE_TYPES.find(ex => ex.name === editType);
    const mins = Number(editDuration) || 0;
    const stepsCount = Number(editSteps) || 0;
    const userWeight = user?.weight || 70;

    if (!activeEx || mins <= 0) {
      setEditCalculatedCalories('0');
      return;
    }

    // Standard metabolic MET formula: (MET * 3.5 * weight) / 200 * duration_in_mins
    let metBurn = (activeEx.met * 3.5 * userWeight / 200) * mins;
    
    // Supplement walking/running calculations using steps walked (approx. 0.04 kcal per step)
    if ((editType === 'Walking' || editType === 'Running') && stepsCount > 0) {
      metBurn += stepsCount * 0.04;
    }

    setEditCalculatedCalories(Math.round(metBurn).toString());
    
    // Trigger preview pulsing scale animation
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.spring(pulseAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, [editType, editDuration, editSteps, selectedWorkout, user]);

  const handleEditWorkout = (workout: any) => {
    // Safely clear background element focus on Web to satisfy Chrome's ARIA specification
    if (Platform.OS === 'web') {
      try {
        (document.activeElement as any)?.blur();
      } catch (e) {
        // Fallback silently if document is not defined
      }
    }
    
    setSelectedWorkout(workout);
    setEditType(workout.type);
    setEditDuration(workout.duration.toString());
    setEditSteps((workout.steps || 0).toString());
    setEditCalculatedCalories(workout.caloriesBurned.toString());
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    if (Platform.OS === 'web') {
      try {
        (document.activeElement as any)?.blur();
      } catch (e) {
        // Safe fallback
      }
    }
    setIsEditModalVisible(false);
  };

  const handleUpdate = async () => {
    if (!editDuration || Number(editDuration) <= 0) {
      showAlert('Details Missing', 'Please enter a valid workout duration.');
      return;
    }

    setEditLoading(true);
    try {
      await api.put(`/workouts/${selectedWorkout._id}`, {
        type: editType,
        duration: Number(editDuration),
        steps: Number(editSteps) || 0,
        caloriesBurned: Number(editCalculatedCalories),
      });

      // Instantly refresh list data
      await fetchWorkouts();
      closeEditModal();
      showAlert('Success', 'Workout details updated successfully!');

    } catch (err) {
      console.error(err);
      showAlert('Update Failed', 'Failed to update workout log on the server.');
    } finally {
      setEditLoading(false);
    }
  };


  if (loading) {

    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <Skeleton width={140} height={34} style={{ marginBottom: 12 }} />
          <Skeleton width="60%" height={16} />
        </View>

        {/* Pulse Stats Cards */}
        <Skeleton width="100%" height={120} borderRadius={24} style={{ marginBottom: 24 }} />

        {/* Pulse Visual Graph */}
        <Skeleton width="100%" height={220} borderRadius={24} style={{ marginBottom: 32 }} />

        {/* Pulse Filters */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <Skeleton width={80} height={36} borderRadius={18} />
          <Skeleton width={80} height={36} borderRadius={18} />
          <Skeleton width={80} height={36} borderRadius={18} />
        </View>

        {/* Pulse Workout Log List */}
        <View style={{ gap: 12 }}>
          <Skeleton width="100%" height={64} borderRadius={16} />
          <Skeleton width="100%" height={64} borderRadius={16} />
          <Skeleton width="100%" height={64} borderRadius={16} />
        </View>
      </ScrollView>
    );
  }

  // Categories list based on dataset + defaults
  const categories = ['All', 'HIIT', 'Running', 'Strength', 'Yoga', 'Cardio'];

  // Handle Filtering & Searching
  const filteredWorkouts = workouts.filter((workout) => {
    const matchesSearch = workout.type.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' ||
      workout.type.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  // Handle Sorting
  const sortedWorkouts = [...filteredWorkouts].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'calories') {
      comparison = a.caloriesBurned - b.caloriesBurned;
    } else if (sortBy === 'duration') {
      comparison = a.duration - b.duration;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Aggregated Stats
  const totalWorkouts = workouts.length;
  const totalCalories = workouts.reduce((acc, curr) => acc + curr.caloriesBurned, 0);
  const totalDuration = workouts.reduce((acc, curr) => acc + curr.duration, 0);
  const avgCalories = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
  const maxCalories = workouts.length > 0 ? Math.max(...workouts.map(w => w.caloriesBurned)) : 0;

  // Prepare data for visual trend line (last 7 workouts)
  const chartWorkouts = [...workouts].reverse().slice(-7);
  const maxChartCal = chartWorkouts.length > 0 ? Math.max(...chartWorkouts.map(w => w.caloriesBurned)) : 100;

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Unlock deep insights into your physical progress.</Text>
        </View>

        {/* Aggregate Cards */}
        <GlassCard style={styles.summaryCard} intensity={25}>
          <LinearGradient
            colors={['rgba(0, 229, 255, 0.1)', 'transparent']}
            style={styles.summaryGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          />
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.statBadgeIcon, { backgroundColor: 'rgba(0, 229, 255, 0.15)' }]}>
                <Ionicons name="barbell" size={20} color={colors.tertiary} />
              </View>
              <Text style={styles.summaryValue}>{totalWorkouts}</Text>
              <Text style={styles.summaryLabel}>LOGS</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.statBadgeIcon, { backgroundColor: 'rgba(255, 42, 84, 0.15)' }]}>
                <Ionicons name="flame" size={20} color={colors.secondary} />
              </View>
              <Text style={styles.summaryValue}>{totalCalories}</Text>
              <Text style={styles.summaryLabel}>KCAL BURNED</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.statBadgeIcon, { backgroundColor: 'rgba(204, 255, 0, 0.15)' }]}>
                <Ionicons name="time" size={20} color={colors.primary} />
              </View>
              <Text style={styles.summaryValue}>{totalDuration}</Text>
              <Text style={styles.summaryLabel}>MINUTES</Text>
            </View>
          </View>
        </GlassCard>

        {/* visual trend graph */}
        <Text style={styles.sectionTitle}>Workout Burn Trend</Text>
        <GlassCard style={styles.chartCard} intensity={15}>
          {chartWorkouts.length === 0 ? (
            <View style={styles.emptyChart}>
              <Ionicons name="stats-chart-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyChartText}>No logs to display chart data.</Text>
            </View>
          ) : (
            <View>
              <View style={styles.chartTitleContainer}>
                <Text style={styles.chartTitle}>Recent Performance</Text>
                <Text style={styles.chartSub}>Calories Burned (kcal)</Text>
              </View>
              <View style={styles.chartBody}>
                {chartWorkouts.map((w, idx) => {
                  const barHeight = Math.max(10, Math.round((w.caloriesBurned / maxChartCal) * 120));
                  return (
                    <View key={w._id || idx} style={styles.chartCol}>
                      <View style={styles.barWrapper}>
                        <Text style={styles.barValue}>{w.caloriesBurned}</Text>
                        <View style={[styles.bar, { height: barHeight }]}>
                          <LinearGradient
                            colors={[colors.secondary, '#FF5E3A']}
                            style={StyleSheet.absoluteFillObject}
                          />
                        </View>
                      </View>
                      <Text style={styles.barLabel} numberOfLines={1}>
                        {w.type.split(' ')[0]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </GlassCard>

        {/* Secondary Stats Grid */}
        <View style={styles.metaStatsGrid}>
          <View style={styles.metaStatCard}>
            <Text style={styles.metaStatLabel}>Avg Duration</Text>
            <Text style={styles.metaStatVal}>{avgDuration} min</Text>
          </View>
          <View style={styles.metaStatCard}>
            <Text style={styles.metaStatLabel}>Avg Calories</Text>
            <Text style={styles.metaStatVal}>{avgCalories} kcal</Text>
          </View>
          <View style={styles.metaStatCard}>
            <Text style={styles.metaStatLabel}>Peak Single Burn</Text>
            <Text style={[styles.metaStatVal, { color: colors.secondary }]}>{maxCalories} kcal</Text>
          </View>
        </View>

        {/* Interactive Filters and Sorting */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Workout History</Text>
          
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search history..."
              placeholderTextColor={colors.textTertiary}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Categories Horizontal Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.catPill,
                  selectedCategory === cat && styles.catPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.catText,
                    selectedCategory === cat && styles.catTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sorting controls */}
          <View style={styles.sortingContainer}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            <View style={styles.sortRow}>
              {(['date', 'calories', 'duration'] as const).map((criteria) => (
                <TouchableOpacity
                  key={criteria}
                  onPress={() => {
                    if (sortBy === criteria) {
                      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(criteria);
                      setSortOrder('desc');
                    }
                  }}
                  style={[styles.sortButton, sortBy === criteria && styles.sortButtonActive]}
                >
                  <Text style={[styles.sortButtonText, sortBy === criteria && styles.sortButtonTextActive]}>
                    {criteria.toUpperCase()}
                  </Text>
                  {sortBy === criteria && (
                    <Ionicons
                      name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                      size={12}
                      color={colors.background}
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Workout list logs */}
        <View style={styles.historyList}>
          {sortedWorkouts.map((workout, index) => (
            <TouchableOpacity 
              key={workout._id || index} 
              style={styles.historyItem}
              onPress={() => handleEditWorkout(workout)}
            >
              <View style={styles.historyIcon}>
                <Ionicons 
                  name={workout.type.toLowerCase().includes('run') ? 'walk' : workout.type.toLowerCase().includes('yoga') ? 'body' : 'barbell'} 
                  size={20} 
                  color={colors.primary} 
                />
              </View>
              <View style={styles.historyText}>
                <Text style={styles.historyType}>{workout.type}</Text>
                <Text style={styles.historyDate}>
                  {new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
              <View style={styles.historyStats}>
                <Text style={styles.historyStatValue}>{workout.caloriesBurned} kcal</Text>
                <Text style={styles.historyStatSub}>{workout.duration} min</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          {sortedWorkouts.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="trail-sign-outline" size={32} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No matching workouts found.</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </ScrollView>

    {/* Elegant Glassmorphic Edit Workout Modal */}
    <Modal
      visible={isEditModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeEditModal}
    >
      <View style={styles.modalOverlay}>
        <GlassCard intensity={45} style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Log</Text>
            <TouchableOpacity onPress={closeEditModal}>

              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Live estimated calorie display */}
            <View style={styles.modalCalorieDisplay}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: 'center' }}>
                <Ionicons name="flame" size={28} color={colors.secondary} />
                <Text style={styles.modalCalorieVal}>{editCalculatedCalories}</Text>
                <Text style={styles.modalCalorieLabel}>EST. KCAL BURN</Text>
              </Animated.View>
            </View>

            {/* Exercise Category selection in grid */}
            <Text style={styles.modalSectionLabel}>Exercise Type</Text>
            <View style={styles.modalGrid}>
              {EXERCISE_TYPES.map((ex) => {
                const isSelected = editType === ex.name;
                return (
                  <TouchableOpacity
                    key={ex.name}
                    style={[
                      styles.modalGridItem,
                      isSelected && styles.modalGridItemActive,
                    ]}
                    onPress={() => setEditType(ex.name)}
                  >
                    <Ionicons 
                      name={ex.icon as any} 
                      size={20} 
                      color={isSelected ? colors.background : colors.textPrimary} 
                    />
                    <Text style={[
                      styles.modalGridItemText,
                      isSelected && styles.modalGridItemTextActive,
                    ]}>
                      {ex.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Input fields */}
            <InputField
              label="Duration (MINUTES)"
              placeholder="e.g. 45"
              value={editDuration}
              onChangeText={setEditDuration}
              keyboardType="numeric"
            />

            {(editType === 'Walking' || editType === 'Running') && (
              <View style={{ marginTop: 12 }}>
                <InputField
                  label="Steps Walked"
                  placeholder="e.g. 6000"
                  value={editSteps}
                  onChangeText={setEditSteps}
                  keyboardType="numeric"
                />
              </View>
            )}

            <PrimaryButton
              title="Update Log"
              onPress={handleUpdate}
              isLoading={editLoading}
              style={styles.modalUpdateButton}
            />
          </ScrollView>
        </GlassCard>
      </View>
    </Modal>
    </>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 60,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 8,
  },
  summaryCard: {
    marginBottom: 32,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  summaryGradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  statBadgeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  chartCard: {
    padding: 20,
    marginBottom: 24,
  },
  emptyChart: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    color: colors.textTertiary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
  },
  chartTitleContainer: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chartSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chartBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  chartCol: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 140,
    width: '100%',
  },
  barValue: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  bar: {
    width: 14,
    borderRadius: 7,
    overflow: 'hidden',
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
    marginTop: 8,
    width: '100%',
    textAlign: 'center',
  },
  metaStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 32,
  },
  metaStatCard: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 30, 0.3)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  metaStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  metaStatVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  filterSection: {
    marginBottom: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  catScroll: {
    marginBottom: 16,
  },
  catContent: {
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  catPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  catTextActive: {
    color: colors.background,
    fontWeight: '800',
  },
  sortingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  sortButtonActive: {
    backgroundColor: colors.textPrimary,
  },
  sortButtonText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  sortButtonTextActive: {
    color: colors.background,
  },
  historyList: {
    backgroundColor: 'rgba(28, 28, 30, 0.4)',
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  historyText: {
    flex: 1,
  },
  historyType: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyDate: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 4,
  },
  historyStats: {
    alignItems: 'flex-end',
  },
  historyStatValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  historyStatSub: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  // Modal Overlay and Custom Sheets
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    maxHeight: '90%',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 42, 84, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  modalScroll: {
    paddingBottom: 20,
  },
  modalCalorieDisplay: {
    backgroundColor: 'rgba(255, 42, 84, 0.1)',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 42, 84, 0.15)',
  },
  modalCalorieVal: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
    textShadowColor: 'rgba(255, 42, 84, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  modalCalorieLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  modalGridItem: {
    width: '31%',
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  modalGridItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalGridItemText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalGridItemTextActive: {
    color: colors.background,
    fontWeight: '800',
  },
  modalUpdateButton: {
    marginTop: 24,
  },
});

export default AnalyticsScreen;

