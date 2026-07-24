// app/study-room/[id].tsx
// Updated to use ERD-aligned ChatMessage type (timestamp bigint, type field)

import React, { useRef, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../../src/features/study-rooms/hooks/useChat';
import { usePresence } from '../../src/features/study-rooms/hooks/usePresence';
import { useRoom } from '../../src/features/study-rooms/hooks/useRooms';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { Avatar } from '../../src/shared/components/Avatar';
import { ChatMessage } from '../../src/types/studyroom.types';
import { formatDistanceToNow } from 'date-fns';

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const listRef = useRef<FlatList>(null);
  const user = useAuthStore(s => s.user);

  const { room, members, isMember, join, leave } = useRoom(id);
  const { messages, loading, sending, sendMessage } = useChat(id);
  const { onlineUsers, onlineCount } = usePresence(id);

  async function handleSend() {
    if (!input.trim() || !isMember) return;
    const content = input;
    const replyId = replyTo?.id;
    const replyContent = replyTo?.content;
    setInput('');
    setReplyTo(null);
    try {
      await sendMessage(content, replyId, replyContent);
    } catch {
      Alert.alert('Failed to send', 'Please try again.');
    }
  }

  React.useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  function renderMessage({ item, index }: { item: ChatMessage; index: number }) {
    const isOwn = item.userId === user?.id;
    const prevMsg = messages[index - 1];
    const showAvatar = !prevMsg || prevMsg.userId !== item.userId;

    // Format timestamp for display
    let timeAgo = '';
    try {
      timeAgo = formatDistanceToNow(
        typeof item.timestamp === 'number' ? new Date(item.timestamp) : new Date(item.createdAt),
        { addSuffix: true }
      );
    } catch {
      timeAgo = '';
    }

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => {
          if (isOwn) {
            Alert.alert('Message', item.content, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reply', onPress: () => setReplyTo(item) },
            ]);
          } else {
            setReplyTo(item);
          }
        }}
      >
        <View style={[styles.msgRow, isOwn && styles.msgRowOwn]}>
          {!isOwn && showAvatar && (
            <Avatar name={item.userName} size={32} style={styles.msgAvatar} />
          )}
          {!isOwn && !showAvatar && <View style={{ width: 32 + 8 }} />}

          <View style={[styles.bubble, isOwn && styles.bubbleOwn]}>
            {showAvatar && !isOwn && (
              <Text style={styles.senderName}>{item.userName}</Text>
            )}
            {item.replyToId && (
              <View style={styles.replyPreview}>
                <Text style={styles.replyText} numberOfLines={1}>
                  ↩ {item.replyToContent ?? 'Replying to message'}
                </Text>
              </View>
            )}
            {item.type === 'CODE' ? (
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>{item.content}</Text>
              </View>
            ) : (
              <Text style={styles.msgText}>{item.content}</Text>
            )}
            <Text style={styles.msgTime}>{timeAgo}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (!room) return null;

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>
          <Text style={styles.onlineCount}>
            {onlineCount} online · {room.memberCount} members
          </Text>
        </View>
        {isMember && (
          <TouchableOpacity
            style={styles.leaveBtn}
            onPress={() =>
              Alert.alert('Leave Room', 'Leave this study room?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Leave', style: 'destructive', onPress: () => { leave(); router.back(); } },
              ])
            }
          >
            <Ionicons name="exit-outline" size={22} color="#FF4757" />
          </TouchableOpacity>
        )}
        <View style={styles.membersBtn}>
          <Ionicons name="people" size={22} color="#6C63FF" />
          <Text style={styles.membersBtnText}>{room.memberCount}</Text>
        </View>
      </View>

      {/* Online presence strip */}
      {onlineUsers.length > 0 && (
        <View style={styles.presenceRow}>
          {onlineUsers.slice(0, 8).map(u => (
            <Avatar key={u.userId} name={u.userName} size={28} style={styles.presenceAvatar} />
          ))}
          <Text style={styles.presenceText}>{onlineUsers.length} online</Text>
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Messages list */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            loading ? null : (
              <View style={styles.emptyChat}>
                <Ionicons name="chatbubble-outline" size={48} color="#2A2A4A" />
                <Text style={styles.emptyChatText}>No messages yet. Say hello!</Text>
              </View>
            )
          }
        />

        {/* Join banner */}
        {!isMember && (
          <View style={styles.joinBanner}>
            <Text style={styles.joinText}>Join this room to chat</Text>
            <TouchableOpacity style={styles.joinBtn} onPress={() => join()}>
              <Text style={styles.joinBtnText}>Join Room</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Reply bar */}
        {replyTo && (
          <View style={styles.replyBar}>
            <Text style={styles.replyBarText} numberOfLines={1}>
              ↩ Replying to {replyTo.userName}: {replyTo.content}
            </Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Ionicons name="close" size={18} color="#9E9EB8" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        {isMember && (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.messageInput}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor="#6B6B8A"
              multiline
              maxLength={4000}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              onPress={handleSend}
              style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
              disabled={!input.trim() || sending}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderBottomWidth: 1, borderBottomColor: '#2A2A4A', gap: 10,
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  roomName: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  onlineCount: { color: '#9E9EB8', fontSize: 12 },
  leaveBtn: { padding: 4 },
  membersBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#2A2A4A', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
  },
  membersBtnText: { color: '#6C63FF', fontWeight: '600' },
  presenceRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6, gap: 4, backgroundColor: '#1E1E2E',
  },
  presenceAvatar: { marginLeft: -6 },
  presenceText: { color: '#9E9EB8', fontSize: 11, marginLeft: 8 },
  messageList: { padding: 12, gap: 4, paddingBottom: 8 },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyChatText: { color: '#6B6B8A', fontSize: 14 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 },
  msgRowOwn: { flexDirection: 'row-reverse' },
  msgAvatar: { marginBottom: 4 },
  bubble: {
    maxWidth: '75%', backgroundColor: '#1E1E2E',
    borderRadius: 16, borderBottomLeftRadius: 4, padding: 10, gap: 4,
  },
  bubbleOwn: { backgroundColor: '#6C63FF', borderBottomLeftRadius: 16, borderBottomRightRadius: 4 },
  senderName: { color: '#6C63FF', fontSize: 12, fontWeight: '700' },
  replyPreview: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6,
    padding: 6, borderLeftWidth: 2, borderLeftColor: '#FF6584',
  },
  replyText: { color: '#9E9EB8', fontSize: 11 },
  codeBlock: { backgroundColor: '#0D1117', borderRadius: 8, padding: 8 },
  codeText: { color: '#79C0FF', fontFamily: 'monospace', fontSize: 12 },
  msgText: { color: '#FFFFFF', fontSize: 14, lineHeight: 20 },
  msgTime: { color: 'rgba(255,255,255,0.4)', fontSize: 10, alignSelf: 'flex-end' },
  joinBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: '#1E1E2E', borderTopWidth: 1, borderTopColor: '#2A2A4A',
  },
  joinText: { color: '#9E9EB8', fontSize: 14 },
  joinBtn: { backgroundColor: '#6C63FF', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  joinBtnText: { color: '#FFFFFF', fontWeight: '700' },
  replyBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 10, backgroundColor: '#1E1E2E', borderTopWidth: 1, borderTopColor: '#2A2A4A',
  },
  replyBarText: { flex: 1, color: '#9E9EB8', fontSize: 12 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 10,
    backgroundColor: '#1E1E2E', borderTopWidth: 1, borderTopColor: '#2A2A4A',
  },
  messageInput: {
    flex: 1, backgroundColor: '#2A2A4A', color: '#FFFFFF',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#6C63FF', borderRadius: 50,
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});