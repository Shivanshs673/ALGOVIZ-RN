import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlaybackSpeed } from '../../../types/algorithm.types';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: PlaybackSpeed;
  onPlay: () => void;
  onPause: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  onSliderChange: (value: number) => void;
}

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

export function PlaybackControls({
  isPlaying, currentStep, totalSteps, speed,
  onPlay, onPause, onStepBack, onStepForward, onReset, onSpeedChange, onSliderChange,
}: PlaybackControlsProps) {
  const [trackWidth, setTrackWidth] = React.useState(0);

  const handleTrackPress = (e: any) => {
    if (trackWidth <= 0 || totalSteps <= 1) return;
    const x = e.nativeEvent.locationX;
    const pct = Math.max(0, Math.min(1, x / trackWidth));
    const step = Math.round(pct * (totalSteps - 1));
    onSliderChange(step);
  };

  const progressPercent = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Step counter */}
      <Text style={styles.stepCounter}>{currentStep + 1} / {totalSteps}</Text>

      {/* Custom progress slider */}
      <TouchableWithoutFeedback onPress={handleTrackPress}>
        <View 
          style={styles.track} 
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        >
          <View style={[styles.fill, { width: `${progressPercent}%` }]} />
          <View style={[styles.thumb, { left: `${progressPercent}%` }]} />
        </View>
      </TouchableWithoutFeedback>

      {/* Controls row */}
      <View style={styles.controlsRow}>
        {/* Reset */}
        <TouchableOpacity onPress={onReset} style={styles.iconBtn}>
          <Ionicons name="refresh" size={22} color="#9E9EB8" />
        </TouchableOpacity>

        {/* Step back */}
        <TouchableOpacity onPress={onStepBack} style={styles.iconBtn} disabled={currentStep === 0}>
          <Ionicons name="play-skip-back" size={22} color={currentStep === 0 ? '#3A3A5A' : '#FFFFFF'} />
        </TouchableOpacity>

        {/* Play / Pause */}
        <TouchableOpacity onPress={isPlaying ? onPause : onPlay} style={styles.playBtn}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Step forward */}
        <TouchableOpacity onPress={onStepForward} style={styles.iconBtn} disabled={currentStep >= totalSteps - 1}>
          <Ionicons name="play-skip-forward" size={22} color={currentStep >= totalSteps - 1 ? '#3A3A5A' : '#FFFFFF'} />
        </TouchableOpacity>

        {/* Speed selector */}
        <View style={styles.speedContainer}>
          {SPEEDS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => onSpeedChange(s)}
              style={[styles.speedBtn, s === speed && styles.speedBtnActive]}
            >
              <Text style={[styles.speedText, s === speed && styles.speedTextActive]}>{s}×</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1E1E2E', borderRadius: 16, padding: 16, gap: 14 },
  stepCounter: { color: '#9E9EB8', fontSize: 12, textAlign: 'center' },
  track: {
    height: 6,
    backgroundColor: '#3A3A5A',
    borderRadius: 3,
    position: 'relative',
    marginVertical: 12,
    marginHorizontal: 8,
  },
  fill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#6C63FF',
    transform: [{ translateX: -8 }],
  },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  iconBtn: { padding: 10 },
  playBtn: { backgroundColor: '#6C63FF', borderRadius: 50, width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  speedContainer: { flexDirection: 'row', gap: 4, marginLeft: 8 },
  speedBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#2A2A4A' },
  speedBtnActive: { backgroundColor: '#6C63FF' },
  speedText: { color: '#9E9EB8', fontSize: 11 },
  speedTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
});
