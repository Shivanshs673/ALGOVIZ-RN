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
