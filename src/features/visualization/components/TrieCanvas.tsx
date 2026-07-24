import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { TrieVizNode } from '../../../types/algorithm.types';

interface TrieCanvasProps {
  nodes: TrieVizNode[];
  width: number;
  height: number;
  expanded?: boolean;
}

const NODE_COLORS: Record<TrieVizNode['state'], string> = {
  default: '#6C63FF',
  visiting: '#FFB347',
  visited: '#43C59E',
  found: '#FF6584',
};

export function TrieCanvas({ nodes, width, height, expanded = false }: TrieCanvasProps) {
  const scale = expanded ? 1.4 : 1;
  const nodeR = expanded ? 22 : 16;
  const fontSize = expanded ? 13 : 11;

  const edges = nodes
    .filter((n) => n.parentId)
    .map((n) => {
      const parent = nodes.find((p) => p.id === n.parentId);
      if (!parent) return null;
      return (
        <Line
          key={`e-${n.id}`}
          x1={parent.x * scale}
          y1={parent.y * scale}
          x2={n.x * scale}
          y2={n.y * scale}
          stroke="#4A4A6A"
          strokeWidth={expanded ? 2 : 1.5}
        />
      );
    });

  const nodeEls = nodes.map((n) => (
    <G key={n.id}>
      <Circle
        cx={n.x * scale}
        cy={n.y * scale}
        r={nodeR}
        fill={NODE_COLORS[n.state]}
        stroke={n.isEnd ? '#FFFFFF' : 'rgba(255,255,255,0.15)'}
        strokeWidth={n.isEnd ? 2.5 : 1}
      />
      <SvgText
        x={n.x * scale}
        y={n.y * scale + fontSize / 3}
        fill="#FFFFFF"
        fontSize={fontSize}
        fontWeight="bold"
        textAnchor="middle"
      >
        {n.char}
      </SvgText>
    </G>
  ));

  return (
    <View style={[styles.container, { width, height: expanded ? height : Math.min(height, 280) }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Svg width={Math.max(width, 400 * scale)} height={Math.max(height, 320 * scale)}>
            {edges}
            {nodeEls}
          </Svg>
        </ScrollView>
      </ScrollView>
      <View style={styles.legend}>
        <LegendDot color="#6C63FF" label="Node" />
        <LegendDot color="#43C59E" label="Visited" />
        <LegendDot color="#FFB347" label="Active" />
        <Text style={styles.legendHint}>Bold ring = end of word</Text>
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#2A2A4A',
    alignItems: 'center',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#9E9EB8', fontSize: 10 },
  legendHint: { color: '#6B6B8A', fontSize: 10, marginLeft: 'auto' },
});
