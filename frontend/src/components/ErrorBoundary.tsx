import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught an unhandled crash:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning-outline" size={64} color={colors.secondary} />
            </View>
            
            <Text style={styles.title}>System Interrupted</Text>
            <Text style={styles.subtitle}>
              FitSync AI encountered a rendering crash. We saved your secure state. You can try restarting.
            </Text>

            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Error Signature</Text>
              <Text style={styles.errorText}>
                {this.state.error?.toString() || 'Unknown React Native exception'}
              </Text>
              {this.state.errorInfo && this.state.errorInfo.componentStack && (
                <Text style={styles.stackText}>
                  {this.state.errorInfo.componentStack.slice(0, 300)}...
                </Text>
              )}
            </View>


            <TouchableOpacity style={styles.resetButton} onPress={this.handleReset}>
              <Ionicons name="refresh" size={20} color={colors.background} style={{ marginRight: 8 }} />
              <Text style={styles.resetButtonText}>Reload Interface</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 42, 84, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: '500',
  },
  errorCard: {
    width: '100%',
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 32,
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  errorText: {
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
    lineHeight: 20,
  },
  stackText: {
    color: colors.textTertiary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    marginTop: 8,
    lineHeight: 15,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 30,
  },
  resetButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ErrorBoundary;
