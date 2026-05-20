import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/useAuthStore';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import GlassCard from '../components/GlassCard';
import api from '../services/api';
import { showAlert } from '../utils/alert';


const EXERCISE_TYPES = [
  { name: 'Walking', met: 3.8, icon: 'walk-outline' },
  { name: 'Running', met: 9.8, icon: 'fitness-outline' },
  { name: 'Cycling', met: 7.5, icon: 'bicycle-outline' },
  { name: 'Skipping', met: 11.0, icon: 'flash-outline' },
  { name: 'Pushups', met: 8.0, icon: 'barbell-outline' },
  { name: 'Yoga', met: 3.0, icon: 'body-outline' },
];

const WorkoutTrackingScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [selectedType, setSelectedType] = useState('Walking');
  const [duration, setDuration] = useState('');
  const [steps, setSteps] = useState('');
  const [calculatedCalories, setCalculatedCalories] = useState('0');
  const [loading, setLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Dynamically calculate calories burned in real-time
  useEffect(() => {
    const activeEx = EXERCISE_TYPES.find(ex => ex.name === selectedType);
    const mins = Number(duration) || 0;
    const stepsCount = Number(steps) || 0;
    const userWeight = user?.weight || 70; // Fallback to 70kg if missing

    if (!activeEx || mins <= 0) {
      setCalculatedCalories('0');
      return;
    }

    // Standard metabolic MET formula: (MET * 3.5 * weight) / 200 * duration_in_mins
    let metBurn = (activeEx.met * 3.5 * userWeight / 200) * mins;
    
    // Supplement walking/running calculations using steps walked (approx. 0.04 kcal per step)
    if ((selectedType === 'Walking' || selectedType === 'Running') && stepsCount > 0) {
      metBurn += stepsCount * 0.04;
    }

    const roundedKcal = Math.round(metBurn);
    setCalculatedCalories(roundedKcal.toString());

    // Trigger subtle visual pulse on update
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.spring(pulseAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

  }, [selectedType, duration, steps, user]);

  const handleSave = async () => {
    if (!duration || Number(duration) <= 0) {
      showAlert('Details Missing', 'Please enter a valid workout duration.');
      return;
    }

    // Synchronously calculate calories to prevent any asynchronous state lag
    const activeEx = EXERCISE_TYPES.find(ex => ex.name === selectedType);
    const mins = Number(duration) || 0;
    const stepsCount = Number(steps) || 0;
    const userWeight = user?.weight || 70;


    if (!activeEx) {
      showAlert('Error', 'Invalid exercise category selected.');
      return;
    }

    let metBurn = (activeEx.met * 3.5 * userWeight / 200) * mins;
    if ((selectedType === 'Walking' || selectedType === 'Running') && stepsCount > 0) {
      metBurn += stepsCount * 0.04;
    }
    const finalCalories = Math.round(metBurn);

    if (finalCalories <= 0) {
      showAlert('Invalid Workout', 'Estimated calories burned must be greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/workouts', {
        type: selectedType,
        duration: mins,
        steps: stepsCount,
        caloriesBurned: finalCalories,
      });

      setDuration('');
      setSteps('');
      showAlert('Workout Saved!', `Logged ${finalCalories} kcal for your ${selectedType} session.`);
      navigation.navigate('Dashboard');
    } catch (error) {
      showAlert('Error', 'Failed to save workout to cloud.');
    } finally {
      setLoading(false);
    }
  };



  const isCardio = selectedType === 'Walking' || selectedType === 'Running';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <Text style={styles.title}>Track Workout</Text>
            <Text style={styles.subtitle}>Select category & calculate automatic burn.</Text>
          </View>

          {/* Calorie Glow Highlight Card */}
          <GlassCard intensity={45} style={styles.glowCard}>
            <Animated.View style={[styles.glowRing, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="flame" size={32} color={colors.secondary} />
              <Text style={styles.glowKcalText}>{calculatedCalories}</Text>
              <Text style={styles.glowKcalLabel}>EST. KCAL BURNED</Text>
            </Animated.View>
            <Text style={styles.weightContext}>
              Calculated dynamically using weight: <Text style={{ color: colors.primary, fontWeight: '700' }}>{user?.weight || 70} kg</Text>
            </Text>
          </GlassCard>

          {/* Exercise Category Selection Grid */}
          <Text style={styles.sectionLabel}>Select Exercise</Text>
          <View style={styles.grid}>
            {EXERCISE_TYPES.map((ex) => {
              const isSelected = selectedType === ex.name;
              return (
                <TouchableOpacity
                  key={ex.name}
                  style={[
                    styles.gridItem,
                    isSelected && styles.gridItemActive,
                  ]}
                  onPress={() => setSelectedType(ex.name)}
                >
                  <Ionicons 
                    name={ex.icon as any} 
                    size={28} 
                    color={isSelected ? colors.background : colors.textPrimary} 
                  />
                  <Text style={[
                    styles.gridItemText,
                    isSelected && styles.gridItemTextActive,
                  ]}>
                    {ex.name}
                  </Text>
                  {isSelected && (
                    <View style={styles.activeDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Inputs Section */}
          <GlassCard intensity={30} style={styles.inputsCard}>
            <InputField
              label="Duration (MINUTES)"
              placeholder="Enter active minutes (e.g. 30)"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />

            {isCardio && (
              <Animated.View style={{ marginTop: 12 }}>
                <InputField
                  label="Steps Walked"
                  placeholder="Enter total steps (e.g. 5000)"
                  value={steps}
                  onChangeText={setSteps}
                  keyboardType="numeric"
                />
              </Animated.View>
            )}

            <PrimaryButton
              title="Save Daily Log"
              onPress={handleSave}
              isLoading={loading}
              style={styles.saveButton}
            />
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  header: {
    marginBottom: 28,
    marginTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 6,
  },
  glowCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 42, 84, 0.2)',
  },
  glowRing: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  glowKcalText: {
    fontSize: 54,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -2,
    marginVertical: 4,
    textShadowColor: 'rgba(255, 42, 84, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  glowKcalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 1.5,
  },
  weightContext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 12,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  gridItem: {
    width: '31%',
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  gridItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  gridItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 8,
  },
  gridItemTextActive: {
    color: colors.background,
    fontWeight: '800',
  },
  activeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background,
  },
  inputsCard: {
    padding: 20,
    marginBottom: 40,
  },
  saveButton: {
    marginTop: 20,
  },
});

export default WorkoutTrackingScreen;
