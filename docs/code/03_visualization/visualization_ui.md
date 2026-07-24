# Visualization UI Components
**Files:**
- `src/features/visualization/components/BarChart.tsx`
- `src/features/visualization/components/GraphCanvas.tsx`
- `src/features/visualization/components/PlaybackControls.tsx`
- `src/features/visualization/components/ComplexityPanel.tsx`
- `app/algorithm/[id].tsx` (Visualization Screen)

---

## BarChart.tsx
> **Deps:** `react-native-svg`

```tsx
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import { VisualizationStep } from '../../../types/algorithm.types';

interface BarChartProps {
  step: VisualizationStep;
  width: number;
  height: number;
}

const COLORS = {
  default:   '#6C63FF',   // purple
  comparing: '#FFB347',   // orange
  swapping:  '#FF4757',   // red
  sorted:    '#43C59E',   // green
  pivot:     '#FF6584',   // pink
  found:     '#43C59E',   // green (for searching)
  checking:  '#FFB347',   // orange (for searching)
};

export function BarChart({ step, width, height }: BarChartProps) {
  if (!step.array || step.array.length === 0) return null;

  const arr = step.array;
  const n = arr.length;
  const maxVal = Math.max(...arr);
  const barWidth = (width - 20) / n;
  const padding = 2;
  const chartHeight = height - 40;  // Leave space for labels

  function getBarColor(index: number): string {
    if (step.sorted?.includes(index)) return COLORS.sorted;
    if (index === step.pivotIndex)    return COLORS.pivot;
    if (step.swapping?.includes(index)) return COLORS.swapping;
    if (step.comparing?.includes(index)) return COLORS.comparing;
    if (index === step.found) return COLORS.found;
    return COLORS.default;
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {arr.map((val, i) => {
          const barH = Math.max(4, (val / maxVal) * chartHeight);
          const x = 10 + i * barWidth + padding;
          const y = chartHeight - barH;
          const color = getBarColor(i);
          const bw = barWidth - padding * 2;

          return (
            <G key={i}>
              <Rect
                x={x}
                y={y}
                width={bw}
                height={barH}
                rx={3}
                fill={color}
                opacity={step.sorted?.includes(i) ? 1 : 0.9}
              />
              {/* Show value if bar is wide enough */}
              {bw > 20 && (
                <SvgText
                  x={x + bw / 2}
                  y={y - 4}
                  fontSize={10}
                  fill="#FFFFFF"
                  textAnchor="middle"
                >
                  {val}
                </SvgText>
              )}
              {/* Index label */}
              <SvgText
                x={x + bw / 2}
                y={height - 4}
                fontSize={9}
                fill="#9E9EB8"
                textAnchor="middle"
              >
                {i}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
```

---

## GraphCanvas.tsx
> **Deps:** `@shopify/react-native-skia`

```tsx
import React from 'react';
import { Canvas, Circle, Line, Paint, Text, useFont, Group } from '@shopify/react-native-skia';
import { GraphState, GraphNode, GraphEdge } from '../../../types/algorithm.types';

interface GraphCanvasProps {
  graphState: GraphState;
  width: number;
  height: number;
}

const NODE_COLORS: Record<GraphNode['state'], string> = {
  default:   '#6C63FF',
  visiting:  '#FFB347',
  visited:   '#FF4757',
  processed: '#43C59E',
  path:      '#FF6584',
};

const EDGE_COLORS: Record<GraphEdge['state'], string> = {
  default: '#3A3A5A',
  active:  '#FFB347',
  inMST:   '#43C59E',
  path:    '#FF6584',
};

export function GraphCanvas({ graphState, width, height }: GraphCanvasProps) {
  const NODE_RADIUS = 26;

  return (
    <Canvas style={{ width, height, backgroundColor: '#1A1A2E', borderRadius: 12 }}>
      {/* Draw edges first (behind nodes) */}
      {graphState.edges.map((edge, i) => {
        const fromNode = graphState.nodes.find(n => n.id === edge.from);
        const toNode   = graphState.nodes.find(n => n.id === edge.to);
        if (!fromNode || !toNode) return null;
        const color = EDGE_COLORS[edge.state];
        return (
          <Group key={`edge-${i}`}>
            <Line
              p1={{ x: fromNode.x, y: fromNode.y }}
              p2={{ x: toNode.x,   y: toNode.y }}
              color={color}
              strokeWidth={edge.state === 'active' || edge.state === 'path' ? 3 : 1.5}
            />
            {/* Edge weight label */}
            {edge.weight !== undefined && (
              <Text
                x={(fromNode.x + toNode.x) / 2 - 8}
                y={(fromNode.y + toNode.y) / 2 - 4}
                text={String(edge.weight)}
                color="#FFB347"
              />
            )}
          </Group>
        );
      })}

      {/* Draw nodes */}
      {graphState.nodes.map((node) => {
        const color = NODE_COLORS[node.state];
        return (
          <Group key={`node-${node.id}`}>
            {/* Node circle */}
            <Circle cx={node.x} cy={node.y} r={NODE_RADIUS} color={color} />
            {/* Node border */}
            <Circle cx={node.x} cy={node.y} r={NODE_RADIUS} color="rgba(255,255,255,0.2)" style="stroke" strokeWidth={2} />
            {/* Node label */}
            <Text x={node.x - 7} y={node.y + 5} text={node.label} color="#FFFFFF" />
            {/* Distance (Dijkstra) */}
            {node.distance !== undefined && node.distance !== Infinity && (
              <Text x={node.x - 12} y={node.y - NODE_RADIUS - 4} text={`d=${node.distance}`} color="#FFB347" />
            )}
          </Group>
        );
      })}
    </Canvas>
  );
}
```

---

## TreeCanvas.tsx
> **Deps:** `@shopify/react-native-skia`

```tsx
import React from 'react';
import { Canvas, Circle, Line, Text, Group } from '@shopify/react-native-skia';
import { TreeNode } from '../../../types/algorithm.types';

interface TreeCanvasProps {
  root: TreeNode | undefined;
  width: number;
  height: number;
}

const NODE_COLORS: Record<TreeNode['state'], string> = {
  default:  '#6C63FF',
  visiting: '#FFB347',
  visited:  '#43C59E',
  found:    '#FF6584',
};

function drawTree(node: TreeNode | undefined): JSX.Element[] {
  if (!node) return [];
  const elements: JSX.Element[] = [];
  const nx = node.x ?? 200;
  const ny = node.y ?? 40;

  // Draw edges to children
  if (node.left && node.left.x !== undefined) {
    elements.push(
      <Line key={`l-${node.id}`} p1={{ x: nx, y: ny }} p2={{ x: node.left.x, y: node.left.y! }} color="#3A3A5A" strokeWidth={1.5} />
    );
  }
  if (node.right && node.right.x !== undefined) {
    elements.push(
      <Line key={`r-${node.id}`} p1={{ x: nx, y: ny }} p2={{ x: node.right.x, y: node.right.y! }} color="#3A3A5A" strokeWidth={1.5} />
    );
  }

  // Recurse
  elements.push(...drawTree(node.left));
  elements.push(...drawTree(node.right));

  // Draw node on top
  const color = NODE_COLORS[node.state];
  elements.push(
    <Group key={`node-${node.id}`}>
      <Circle cx={nx} cy={ny} r={22} color={color} />
      <Text x={nx - (node.value >= 10 ? 10 : 6)} y={ny + 5} text={String(node.value)} color="#FFFFFF" />
    </Group>
  );

  return elements;
}

export function TreeCanvas({ root, width, height }: TreeCanvasProps) {
  return (
    <Canvas style={{ width, height, backgroundColor: '#1A1A2E', borderRadius: 12 }}>
      {drawTree(root)}
    </Canvas>
  );
}
```

---

## MatrixGrid.tsx

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface MatrixGridProps {
  matrix: number[][];
  highlightCells?: [number, number][];
  rowLabels?: string[];
  colLabels?: string[];
}

export function MatrixGrid({ matrix, highlightCells = [], rowLabels, colLabels }: MatrixGridProps) {
  function isHighlighted(r: number, c: number): boolean {
    return highlightCells.some(([hr, hc]) => hr === r && hc === c);
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* Column labels */}
        {colLabels && (
          <View style={styles.row}>
            <View style={[styles.cell, styles.headerCell]} />
            {colLabels.map((label, c) => (
              <View key={c} style={[styles.cell, styles.headerCell]}>
                <Text style={styles.headerText}>{label}</Text>
              </View>
            ))}
          </View>
        )}
        {matrix.map((row, r) => (
          <View key={r} style={styles.row}>
            {rowLabels && (
              <View style={[styles.cell, styles.headerCell]}>
                <Text style={styles.headerText}>{rowLabels[r] ?? r}</Text>
              </View>
            )}
            {row.map((val, c) => (
              <View key={c} style={[styles.cell, isHighlighted(r, c) && styles.highlightedCell]}>
                <Text style={[styles.cellText, isHighlighted(r, c) && styles.highlightedText]}>
                  {val === Infinity ? '∞' : String(val)}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  cell: { width: 40, height: 40, borderWidth: 0.5, borderColor: '#3A3A5A', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1A2E' },
  headerCell: { backgroundColor: '#2A2A4A' },
  headerText: { color: '#9E9EB8', fontSize: 11, fontWeight: '600' },
  cellText: { color: '#FFFFFF', fontSize: 12 },
  highlightedCell: { backgroundColor: '#FFB347' },
  highlightedText: { color: '#1A1A2E', fontWeight: 'bold' },
});
```

---

## PlaybackControls.tsx

```tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
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
  return (
    <View style={styles.container}>
      {/* Step counter */}
      <Text style={styles.stepCounter}>{currentStep + 1} / {totalSteps}</Text>

      {/* Progress slider */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={Math.max(0, totalSteps - 1)}
        step={1}
        value={currentStep}
        minimumTrackTintColor="#6C63FF"
        maximumTrackTintColor="#3A3A5A"
        thumbTintColor="#6C63FF"
        onValueChange={onSliderChange}
      />

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
  container: { backgroundColor: '#1E1E2E', borderRadius: 16, padding: 16, gap: 8 },
  stepCounter: { color: '#9E9EB8', fontSize: 12, textAlign: 'center' },
  slider: { width: '100%', height: 30 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  iconBtn: { padding: 10 },
  playBtn: { backgroundColor: '#6C63FF', borderRadius: 50, width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  speedContainer: { flexDirection: 'row', gap: 4, marginLeft: 8 },
  speedBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#2A2A4A' },
  speedBtnActive: { backgroundColor: '#6C63FF' },
  speedText: { color: '#9E9EB8', fontSize: 11 },
  speedTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
});
```

---

## ComplexityPanel.tsx

```tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Algorithm } from '../../../types/algorithm.types';

interface ComplexityPanelProps {
  algorithm: Algorithm;
  stepMessage: string;
  comparisons: number;
  swaps: number;
}

type Tab = 'description' | 'pseudocode' | 'complexity';

export function ComplexityPanel({ algorithm, stepMessage, comparisons, swaps }: ComplexityPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('description');

  return (
    <View style={styles.container}>
      {/* Step message bar */}
      <View style={styles.messageBar}>
        <Text style={styles.messageText} numberOfLines={2}>{stepMessage}</Text>
        <View style={styles.counters}>
          <Text style={styles.counterText}>↔ {comparisons}</Text>
          <Text style={styles.counterText}>⇄ {swaps}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['description', 'pseudocode', 'complexity'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      <ScrollView style={styles.content}>
        {activeTab === 'description' && (
          <View style={styles.padded}>
            <Text style={styles.bodyText}>{algorithm.description}</Text>
            <Text style={styles.sectionTitle}>Applications</Text>
            {algorithm.applications.map((app, i) => (
              <Text key={i} style={styles.bulletText}>• {app}</Text>
            ))}
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagRow}>
              {algorithm.tags.map((tag, i) => (
                <View key={i} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
              ))}
            </View>
          </View>
        )}
        {activeTab === 'pseudocode' && (
          <View style={[styles.padded, styles.codeBox]}>
            <Text style={styles.codeText}>{algorithm.pseudocode}</Text>
          </View>
        )}
        {activeTab === 'complexity' && (
          <View style={styles.padded}>
            <Text style={styles.sectionTitle}>Time Complexity</Text>
            <ComplexityRow label="Best"    value={algorithm.timeComplexity.best}    color="#43C59E" />
            <ComplexityRow label="Average" value={algorithm.timeComplexity.average} color="#FFB347" />
            <ComplexityRow label="Worst"   value={algorithm.timeComplexity.worst}   color="#FF4757" />
            <Text style={styles.sectionTitle}>Space Complexity</Text>
            <ComplexityRow label="Space" value={algorithm.spaceComplexity} color="#6C63FF" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ComplexityRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.complexityRow}>
      <Text style={styles.complexityLabel}>{label}:</Text>
      <View style={[styles.complexityBadge, { backgroundColor: color + '22' }]}>
        <Text style={[styles.complexityValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E2E', borderRadius: 16 },
  messageBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#2A2A4A' },
  messageText: { flex: 1, color: '#FFFFFF', fontSize: 13 },
  counters: { flexDirection: 'row', gap: 12, marginLeft: 8 },
  counterText: { color: '#6C63FF', fontSize: 12, fontWeight: '600' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2A2A4A' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#6C63FF' },
  tabText: { color: '#9E9EB8', fontSize: 13 },
  activeTabText: { color: '#6C63FF', fontWeight: '600' },
  content: { flex: 1 },
  padded: { padding: 16, gap: 8 },
  bodyText: { color: '#CCCCDD', fontSize: 14, lineHeight: 22 },
  sectionTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginTop: 12 },
  bulletText: { color: '#CCCCDD', fontSize: 13, lineHeight: 20 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#2A2A4A', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { color: '#9E9EB8', fontSize: 11 },
  codeBox: { backgroundColor: '#0D0D1A', borderRadius: 8 },
  codeText: { color: '#43C59E', fontSize: 12, fontFamily: 'monospace', lineHeight: 20 },
  complexityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  complexityLabel: { color: '#9E9EB8', width: 60, fontSize: 13 },
  complexityBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  complexityValue: { fontSize: 13, fontWeight: '700' },
});
```

---

## Visualization Screen — app/algorithm/[id].tsx

```tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVisualization } from '../../src/features/visualization/hooks/useVisualization';
import { BarChart } from '../../src/features/visualization/components/BarChart';
import { GraphCanvas } from '../../src/features/visualization/components/GraphCanvas';
import { TreeCanvas } from '../../src/features/visualization/components/TreeCanvas';
import { MatrixGrid } from '../../src/features/visualization/components/MatrixGrid';
import { PlaybackControls } from '../../src/features/visualization/components/PlaybackControls';
import { ComplexityPanel } from '../../src/features/visualization/components/ComplexityPanel';

export default function VisualizationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const {
    algorithm, currentStep, currentStepIndex, totalSteps,
    isPlaying, speed, status, inputArray, customInput,
    play, pause, stepForward, stepBack, reset,
    setSpeed, randomize, setCustomInput, applyCustomInput, goToStep,
  } = useVisualization(id);

  if (!algorithm) return <View style={styles.center}><Text style={styles.errorText}>Algorithm not found</Text></View>;

  // Determine which visualization component to show
  function renderVisualization() {
    if (!currentStep) return null;
    const vizWidth = width - 32;
    const vizHeight = 220;

    // Graph algorithms
    if (currentStep.graphState) {
      return <GraphCanvas graphState={currentStep.graphState} width={vizWidth} height={vizHeight} />;
    }
    // Tree algorithms
    if (currentStep.treeRoot !== undefined) {
      return <TreeCanvas root={currentStep.treeRoot} width={vizWidth} height={vizHeight} />;
    }
    // DP matrix
    if (currentStep.matrix) {
      return <MatrixGrid matrix={currentStep.matrix} highlightCells={currentStep.highlightCells} />;
    }
    // Backtracking board
    if (currentStep.board) {
      return <BacktrackingBoard board={currentStep.board} tryingPos={currentStep.tryingPosition} />;
    }
    // Default: bar chart (sorting + searching)
    if (currentStep.array) {
      return <BarChart step={currentStep} width={vizWidth} height={vizHeight} />;
    }
    return null;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.algorithmName}>{algorithm.name}</Text>
          <View style={[styles.diffBadge, { backgroundColor: difficultyColor(algorithm.difficulty) + '22' }]}>
            <Text style={[styles.diffText, { color: difficultyColor(algorithm.difficulty) }]}>{algorithm.difficulty}</Text>
          </View>
        </View>

        {/* Visualization canvas */}
        <View style={styles.vizContainer}>
          {renderVisualization()}
        </View>

        {/* Playback controls */}
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

        {/* Custom input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Custom Input Array</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={customInput}
              onChangeText={setCustomInput}
              placeholder="e.g. 5, 2, 8, 1, 9"
              placeholderTextColor="#9E9EB8"
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={applyCustomInput} style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={randomize} style={styles.randomBtn}>
            <Text style={styles.randomBtnText}>🎲 Randomize</Text>
          </TouchableOpacity>
        </View>

        {/* Info panel */}
        <View style={styles.panelContainer}>
          <ComplexityPanel
            algorithm={algorithm}
            stepMessage={currentStep?.message ?? 'Press Play to start'}
            comparisons={currentStep?.comparisons ?? 0}
            swaps={currentStep?.swaps ?? 0}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Simple backtracking board (grid of cells)
function BacktrackingBoard({ board, tryingPos }: { board: (number | null)[][]; tryingPos?: [number, number] }) {
  const n = board.length;
  const cellSize = Math.min(40, 280 / n);
  return (
    <View style={{ flexDirection: 'column', gap: 2 }}>
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
                <Text style={{ color: '#FFFFFF', fontSize: cellSize * 0.5 }}>{hasQueen ? '♛' : ''}</Text>
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
  content: { padding: 16, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#FF4757' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  algorithmName: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  diffBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  diffText: { fontSize: 12, fontWeight: '600' },
  vizContainer: { borderRadius: 16, overflow: 'hidden', minHeight: 220, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center' },
  inputSection: { gap: 8 },
  inputLabel: { color: '#9E9EB8', fontSize: 13, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: 8 },
  textInput: { flex: 1, backgroundColor: '#1E1E2E', color: '#FFFFFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: '#2A2A4A' },
  applyBtn: { backgroundColor: '#6C63FF', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  applyBtnText: { color: '#FFFFFF', fontWeight: '600' },
  randomBtn: { alignSelf: 'flex-start', backgroundColor: '#2A2A4A', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  randomBtnText: { color: '#FFFFFF', fontSize: 13 },
  panelContainer: { height: 320 },
});
```
