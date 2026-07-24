import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getConceptById, ConceptSection } from '../../src/features/learn/data/conceptsData';

export default function ConceptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const concept = getConceptById(id);

  if (!concept) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Concept not found</Text>
      </View>
    );
  }

  function renderSection(section: ConceptSection, index: number) {
    switch (section.type) {
      case 'text':
        return (
          <View key={index} style={styles.textSection}>
            {section.heading && <Text style={styles.sectionHeading}>{section.heading}</Text>}
            {section.body && <Text style={styles.bodyText}>{section.body}</Text>}
          </View>
        );
      case 'code':
        return (
          <View key={index} style={styles.codeSection}>
            {section.heading && <Text style={styles.sectionHeading}>{section.heading}</Text>}
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{section.code}</Text>
            </View>
          </View>
        );
      case 'table':
        return (
          <View key={index} style={styles.tableSection}>
            {section.heading && <Text style={styles.sectionHeading}>{section.heading}</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.table}>
                {section.tableHeaders && (
                  <View style={[styles.tableRow, styles.tableHeaderRow]}>
                    {section.tableHeaders.map((header, hIdx) => (
                      <View key={hIdx} style={[styles.tableCell, styles.tableHeaderCell]}>
                        <Text style={styles.tableHeaderCellText}>{header}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {section.tableRows?.map((row, rIdx) => (
                  <View key={rIdx} style={styles.tableRow}>
                    {row.map((cell, cIdx) => (
                      <View key={cIdx} style={styles.tableCell}>
                        <Text style={styles.tableCellText}>{cell}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        );
      case 'tip':
        return (
          <View key={index} style={[styles.callout, styles.tipCallout]}>
            {section.heading && <Text style={styles.calloutHeading}>{section.heading}</Text>}
            {section.body && <Text style={styles.calloutBody}>{section.body}</Text>}
          </View>
        );
      case 'warning':
        return (
          <View key={index} style={[styles.callout, styles.warningCallout]}>
            {section.heading && <Text style={styles.calloutHeading}>{section.heading}</Text>}
            {section.body && <Text style={styles.calloutBody}>{section.body}</Text>}
          </View>
        );
      default:
        return null;
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{concept.title}</Text>
          <Text style={styles.subtitle}>{concept.subtitle}</Text>
        </View>

        {concept.content.map(renderSection)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 16, gap: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#121212' },
  errorText: { color: '#FF4757' },
  header: { borderBottomWidth: 1, borderBottomColor: '#2A2A4A', paddingBottom: 16 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  subtitle: { color: '#9E9EB8', fontSize: 15, marginTop: 4 },
  textSection: { gap: 8 },
  sectionHeading: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  bodyText: { color: '#CCCCDD', fontSize: 14, lineHeight: 22 },
  codeSection: { gap: 8 },
  codeBox: { backgroundColor: '#0D0D1A', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#2A2A4A' },
  codeText: { color: '#43C59E', fontSize: 12, fontFamily: 'monospace', lineHeight: 18 },
  tableSection: { gap: 8 },
  table: { borderWidth: 1, borderColor: '#2A2A4A', borderRadius: 8, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2A2A4A' },
  tableHeaderRow: { backgroundColor: '#1E1E2E' },
  tableCell: { paddingHorizontal: 12, paddingVertical: 10, minWidth: 100, justifyContent: 'center' },
  tableHeaderCell: { },
  tableHeaderCellText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  tableCellText: { color: '#CCCCDD', fontSize: 12 },
  callout: { padding: 14, borderRadius: 10, borderWidth: 1, gap: 4 },
  tipCallout: { backgroundColor: '#43C59E15', borderColor: '#43C59E' },
  warningCallout: { backgroundColor: '#FF475715', borderColor: '#FF4757' },
  calloutHeading: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  calloutBody: { color: '#CCCCDD', fontSize: 13, lineHeight: 18 },
});