import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Switch } from 'react-native';
import { CreateRoomInput, RoomCategory } from '../../../types/studyroom.types';

interface CreateRoomModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: CreateRoomInput) => Promise<void>;
}

const CATEGORIES: RoomCategory[] = ['SORTING','SEARCHING','GRAPH','TREE','DYNAMIC_PROGRAMMING','GREEDY','BACKTRACKING','GENERAL','INTERVIEW_PREP'];

export function CreateRoomModal({ visible, onClose, onSubmit }: CreateRoomModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RoomCategory>('GENERAL');
  const [maxMembers, setMaxMembers] = useState('50');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function validate(): boolean {
    if (name.trim().length < 3) { setError('Name must be at least 3 characters'); return false; }
    if (name.trim().length > 80) { setError('Name must be under 80 characters'); return false; }
    const max = parseInt(maxMembers);
    if (isNaN(max) || max < 2 || max > 200) { setError('Max members must be 2–200'); return false; }
    return true;
  }

  async function handleSubmit() {
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), category, maxMembers: parseInt(maxMembers), isPrivate });
      setName(''); setDescription(''); setCategory('GENERAL'); setMaxMembers('50'); setIsPrivate(false);
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Failed to create room');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancelBtn}>Cancel</Text></TouchableOpacity>
          <Text style={styles.title}>Create Study Room</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <Text style={[styles.createBtn, loading && styles.createBtnDisabled]}>
              {loading ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} contentContainerStyle={{ gap: 16, paddingBottom: 40 }}>
          <View style={styles.field}>
            <Text style={styles.label}>Room Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Graph Theory Study Group" placeholderTextColor="#9E9EB8" maxLength={80} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="What will you study?" placeholderTextColor="#9E9EB8" multiline numberOfLines={3} maxLength={200} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity key={cat} onPress={() => setCategory(cat)}
                    style={[styles.categoryChip, cat === category && styles.categoryChipActive]}>
                    <Text style={[styles.categoryChipText, cat === category && styles.categoryChipTextActive]}>
                      {cat.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Max Members</Text>
            <TextInput style={[styles.input, { width: 80 }]} value={maxMembers} onChangeText={setMaxMembers} keyboardType="numeric" maxLength={3} />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.label}>Private Room</Text>
            <Switch value={isPrivate} onValueChange={setIsPrivate} trackColor={{ true: '#6C63FF', false: '#2A2A4A' }} thumbColor="#FFFFFF" />
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A2A4A' },
  cancelBtn: { color: '#9E9EB8', fontSize: 16 },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  createBtn: { color: '#6C63FF', fontSize: 16, fontWeight: '700' },
  createBtnDisabled: { opacity: 0.5 },
  form: { padding: 16 },
  field: { gap: 8 },
  label: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  input: { backgroundColor: '#1E1E2E', color: '#FFFFFF', borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#2A2A4A' },
  textArea: { height: 80, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#2A2A4A', marginBottom: 4 },
  categoryChipActive: { backgroundColor: '#6C63FF' },
  categoryChipText: { color: '#9E9EB8', fontSize: 12 },
  categoryChipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorText: { color: '#FF4757', fontSize: 13, textAlign: 'center' },
});
