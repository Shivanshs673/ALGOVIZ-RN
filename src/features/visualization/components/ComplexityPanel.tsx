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
      <View style={styles.messageBar}>
        <Text style={styles.messageText} numberOfLines={2}>{stepMessage}</Text>
        <View style={styles.counters}>
          <Text style={styles.counterText}>↔ {comparisons}</Text>
          <Text style={styles.counterText}>⇄ {swaps}</Text>
        </View>
      </View>

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

      <ScrollView style={styles.content}>
        {activeTab === 'description' && (
          <View style={styles.padded}>
            <Text style={styles.bodyText}>{algorithm.description}</Text>
            {algorithm.applications && algorithm.applications.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Applications</Text>
                {algorithm.applications.map((app, i) => (
                  <Text key={i} style={styles.bulletText}>• {app}</Text>
                ))}
              </>
            )}
            {algorithm.tags && algorithm.tags.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagRow}>
                  {algorithm.tags.map((tag, i) => (
                    <View key={i} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                  ))}
                </View>
              </>
            )}
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
