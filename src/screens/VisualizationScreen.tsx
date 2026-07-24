import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, useWindowDimensions,
  TextInput, TouchableOpacity, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useVisualization } from '../features/visualization/hooks/useVisualization';
import { BarChart } from '../features/visualization/components/BarChart';
import { GraphCanvas } from '../features/visualization/components/GraphCanvas';
import { TreeCanvas } from '../features/visualization/components/TreeCanvas';
import { TrieCanvas } from '../features/visualization/components/TrieCanvas';
import { MatrixGrid } from '../features/visualization/components/MatrixGrid';
import { PlaybackControls } from '../features/visualization/components/PlaybackControls';
import { ComplexityPanel } from '../features/visualization/components/ComplexityPanel';
import { ExpandableVizSheet } from '../features/visualization/components/ExpandableVizSheet';
import { getAlgorithmInputConfig } from '../features/visualization/utils/inputConfig';

type Props = { algorithmId: string };

export function VisualizationScreen({ algorithmId }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [sheetOpen, setSheetOpen] = useState(false);
  const {
    algorithm, currentStep, currentStepIndex, totalSteps,
    isPlaying, speed,
    customInput, searchTargetInput, kmpText, kmpPattern, trieWordsInput, bstTargetInput,
    play, pause, stepForward, stepBack, reset,
    setSpeed, randomize, setCustomInput, setSearchTargetInput,
    setKmpText, setKmpPattern, setTrieWordsInput, setBstTargetInput,
    applyAllInputs, goToStep,
  } = useVisualization(algorithmId);

  const inputConfig = useMemo(
    () => (algorithm ? getAlgorithmInputConfig(algorithmId, algorithm.category) : getAlgorithmInputConfig('bubble-sort', 'SORTING')),
    [algorithmId, algorithm],
  );

  if (!algorithm) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Algorithm not found</Text>
      </View>
    );
  }

  const vizWidth = width - 32;
  const vizHeight = 240;
  const canExpand = inputConfig.expandableViz || !!currentStep?.trieNodes || !!currentStep?.treeRoot;

  function renderViz(w: number, h: number) {
    if (!currentStep) return <Text style={styles.placeholder}>Press Apply, then Play</Text>;
    if (currentStep.trieNodes?.length) {
      return <TrieCanvas nodes={currentStep.trieNodes} width={w} height={h} expanded={sheetOpen} />;
    }
    if (currentStep.graphState) {
      return <GraphCanvas graphState={currentStep.graphState} width={w} height={h} />;
    }
    if (currentStep.treeRoot !== undefined) {
      return <TreeCanvas root={currentStep.treeRoot} width={w} height={h} />;
    }
    if (currentStep.matrix) {
      return <MatrixGrid matrix={currentStep.matrix} highlightCells={currentStep.highlightCells} />;
    }
    if (currentStep.board) {
      return <BacktrackingBoard board={currentStep.board} tryingPos={currentStep.tryingPosition} />;
    }
    if (currentStep.array) {
      return <BarChart step={currentStep} width={w} height={h} />;
    }
    return <Text style={styles.placeholder}>{currentStep.message}</Text>;
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.algorithmName}>{algorithm.name}</Text>
            <Text style={styles.category}>{algorithm.category.replace(/_/g, ' ')}</Text>
          </View>
          <View style={[styles.diffBadge, { backgroundColor: difficultyColor(algorithm.difficulty) + '22' }]}>
            <Text style={[styles.diffText, { color: difficultyColor(algorithm.difficulty) }]}>{algorithm.difficulty}</Text>
          </View>
        </View>

        <View style={styles.vizContainer}>
          {renderViz(vizWidth, vizHeight)}
          {canExpand && (
            <Pressable style={styles.expandBtn} onPress={() => setSheetOpen(true)}>
              <Ionicons name="expand" size={18} color="#FFFFFF" />
              <Text style={styles.expandText}>Expand</Text>
            </Pressable>
          )}
        </View>

        <PlaybackControls
          isPlaying={isPlaying}
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
          speed={speed}
          onPlay={play}
          onPause={pause}
          onStepBack={stepBack}
          onStepForward={stepForward}
          onReset={reset}
          onSpeedChange={setSpeed}
          onSliderChange={goToStep}
        />

        <View style={styles.inputSection}>
          <Text style={styles.inputSectionTitle}>Input Parameters</Text>

          {inputConfig.fields.includes('array') && (
            <Field label="Array (comma-separated numbers)">
              <TextInput
                style={styles.textInput}
                value={customInput}
                onChangeText={setCustomInput}
                placeholder="e.g. 5, 2, 8, 1, 9"
                placeholderTextColor="#6B6B8A"
                keyboardType="numbers-and-punctuation"
              />
            </Field>
          )}

          {inputConfig.fields.includes('searchTarget') && (
            <Field label="Search target (number in array)">
              <TextInput
                style={styles.textInput}
                value={searchTargetInput}
                onChangeText={setSearchTargetInput}
                placeholder="e.g. 43"
                placeholderTextColor="#6B6B8A"
                keyboardType="number-pad"
              />
            </Field>
          )}

          {inputConfig.fields.includes('bstTarget') && (
            <Field label="BST search value">
              <TextInput
                style={styles.textInput}
                value={bstTargetInput}
                onChangeText={setBstTargetInput}
                placeholder="Value to find in tree"
                placeholderTextColor="#6B6B8A"
                keyboardType="number-pad"
              />
            </Field>
          )}

          {inputConfig.fields.includes('kmpText') && (
            <Field label="Text / haystack">
              <TextInput
                style={styles.textInput}
                value={kmpText}
                onChangeText={setKmpText}
                placeholder="ABABDABACDABABCABAB"
                placeholderTextColor="#6B6B8A"
                autoCapitalize="characters"
              />
            </Field>
          )}

          {inputConfig.fields.includes('kmpPattern') && (
            <Field label="Pattern / needle">
              <TextInput
                style={styles.textInput}
                value={kmpPattern}
                onChangeText={setKmpPattern}
                placeholder="ABABCABAB"
                placeholderTextColor="#6B6B8A"
                autoCapitalize="characters"
              />
            </Field>
          )}

          {inputConfig.fields.includes('trieWords') && (
            <Field label="Words to insert (comma or space separated)">
              <TextInput
                style={styles.textInput}
                value={trieWordsInput}
                onChangeText={setTrieWordsInput}
                placeholder="CAT, CAR, CARD, DOG"
                placeholderTextColor="#6B6B8A"
                autoCapitalize="characters"
              />
            </Field>
          )}

          <View style={styles.inputActions}>
            <TouchableOpacity onPress={applyAllInputs} style={styles.applyBtn}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.applyBtnText}>Apply & Run</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={randomize} style={styles.randomBtn}>
              <Text style={styles.randomBtnText}>🎲 Random</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.panelContainer}>
          <ComplexityPanel
            algorithm={algorithm}
            stepMessage={currentStep?.message ?? 'Configure inputs and press Apply'}
            comparisons={currentStep?.comparisons ?? 0}
            swaps={currentStep?.swaps ?? 0}
          />
        </View>
      </ScrollView>

      <ExpandableVizSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={algorithm.name}
      >
        {renderViz(width - 32, height * 0.65)}
      </ExpandableVizSheet>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.inputLabel}>{label}</Text>
      {children}
    </View>
  );
}

function BacktrackingBoard({ board, tryingPos }: { board: (number | null)[][]; tryingPos?: [number, number] }) {
  const n = board.length;
  const cellSize = Math.min(40, 280 / n);
  return (
    <View style={{ flexDirection: 'column', gap: 2, alignItems: 'center', marginVertical: 8 }}>
      {board.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: 2 }}>
          {row.map((cell, c) => {
            const isTrying = tryingPos && tryingPos[0] === r && tryingPos[1] === c;
            const hasQueen = cell === 1;
            return (
              <View key={c} style={{
                width: cellSize, height: cellSize, borderRadius: 4,
                backgroundColor: hasQueen ? '#43C59E' : isTrying ? '#FFB347' : ((r + c) % 2 === 0 ? '#2A2A4A' : '#1A1A2E'),
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ color: '#FFFFFF', fontSize: cellSize * 0.5 }}>{hasQueen ? '♛' : cell != null && cell !== 1 ? String(cell) : ''}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function difficultyColor(d: string): string {
  if (d === 'BEGINNER') return '#43C59E';
  if (d === 'INTERMEDIATE') return '#FFB347';
  return '#FF4757';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#121212' },
  errorText: { color: '#FF4757' },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  algorithmName: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  category: { color: '#6B6B8A', fontSize: 12, marginTop: 2 },
  diffBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  diffText: { fontSize: 12, fontWeight: '600' },
  vizContainer: { borderRadius: 16, overflow: 'hidden', minHeight: 240, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  placeholder: { color: '#6B6B8A', padding: 20, textAlign: 'center' },
  expandBtn: {
    position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#6C63FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  expandText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  inputSection: { gap: 10, backgroundColor: '#1E1E2E', borderRadius: 16, padding: 14 },
  inputSectionTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  field: { gap: 6 },
  inputLabel: { color: '#9E9EB8', fontSize: 12, fontWeight: '600' },
  textInput: {
    backgroundColor: '#2A2A4A', color: '#FFFFFF', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, borderWidth: 1, borderColor: '#3A3A5A',
  },
  inputActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  applyBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#6C63FF', borderRadius: 12, paddingVertical: 12,
  },
  applyBtnText: { color: '#FFFFFF', fontWeight: '700' },
  randomBtn: { backgroundColor: '#2A2A4A', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  randomBtnText: { color: '#FFFFFF', fontSize: 13 },
  panelContainer: { minHeight: 280 },
});
