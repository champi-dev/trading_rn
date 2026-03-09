import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

export default function GlassCard({ children, style, className }: Props) {
  return (
    <View className={`bg-surface-glass rounded-2xl p-4 border border-border-subtle overflow-hidden ${className || ''}`} style={style}>
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}
