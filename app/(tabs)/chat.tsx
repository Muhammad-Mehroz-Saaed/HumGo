import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRide } from '@/context/RideContext';
import { useAuth } from '@/context/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Dimensions, Shadows } from '@/constants/theme';
import { secureLog } from '@/utils/security';

export default function ChatScreen() {
  const { matchId, tripId } = useLocalSearchParams<{ matchId?: string; tripId?: string }>();
  const { matches, messages, addMessage, listenToMessages } = useRide();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);
  const hasScrolledToBottom = useRef(false);

  const match = useMemo(() => matches.find((m) => m.id === matchId), [matches, matchId]);
  const chatMessages = useMemo(
    () => messages.filter((m) => (matchId ? m.matchId === matchId : tripId ? m.matchId === tripId : false)),
    [messages, matchId, tripId]
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatMessages.length > 0 && !isLoading) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: !hasScrolledToBottom.current });
        hasScrolledToBottom.current = true;
      }, 100);
    }
  }, [chatMessages.length, isLoading]);

  useEffect(() => {
    const targetId = (matchId as string) || (tripId as string);
    if (!targetId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const unsub = listenToMessages(targetId);
      setTimeout(() => setIsLoading(false), 1000);
      return () => unsub?.();
    } catch (err) {
      setError('Failed to load messages.');
      setIsLoading(false);
      secureLog.error('Message listener error', err);
    }
  }, [listenToMessages, matchId, tripId]);

  const handleSend = async () => {
    const targetId = (matchId as string) || (tripId as string);
    if (!targetId || !user || !text.trim() || isSending) return;

    const messageText = text.trim();
    setText('');
    setIsSending(true);
    setError(null);

    try {
      addMessage(targetId, user.id, messageText);
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      setText(messageText);
      setError('Failed to send message');
      Alert.alert('Send Failed', 'Could not send your message.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: () => handleSend() },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Check for user authentication
  if (!user) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.emptyIcon}>
          <MaterialIcons name="account-circle" size={48} color={Colors.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>Not logged in</Text>
        <Text style={styles.emptySubtitle}>Please log in to access chat</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => router.replace('/(tabs)/login')} activeOpacity={0.8}>
          <Text style={styles.backLinkText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state
  if (isLoading && !match) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading messages…</Text>
      </View>
    );
  }

  // No match or trip ID provided - show empty state
  if (!matchId && !tripId) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.emptyIcon}>
          <MaterialIcons name="chat-bubble-outline" size={48} color={Colors.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>No active ride or match</Text>
        <Text style={styles.emptySubtitle}>Book a ride first to chat with other riders</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => router.replace('/(tabs)/home')} activeOpacity={0.8}>
          <MaterialIcons name="directions-car" size={18} color={Colors.primary} />
          <Text style={styles.backLinkText}>Book a ride</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Match ID provided but match not found
  if (matchId && !match && !isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.emptyIcon}>
          <MaterialIcons name="error-outline" size={48} color={Colors.warning} />
        </View>
        <Text style={styles.emptyTitle}>Match not found</Text>
        <Text style={styles.emptySubtitle}>This match may have expired or been cancelled</Text>
        <TouchableOpacity style={styles.backLink} onPress={handleBack} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back" size={18} color={Colors.primary} />
          <Text style={styles.backLinkText}>Back to matches</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const headerSubtitle = match
    ? `${match.riders} rider${match.riders > 1 ? 's' : ''} • ${match.distanceKm.toFixed(1)} km`
    : 'Group chat for this trip';

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      keyboardVerticalOffset={0}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle} numberOfLines={1}>Chat with riders</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{headerSubtitle}</Text>
          </View>
          <View style={styles.headerRight}>
            <MaterialIcons name="more-vert" size={24} color={Colors.textSecondary} />
          </View>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error-outline" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Messages List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>Loading messages…</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={chatMessages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              if (!hasScrolledToBottom.current && chatMessages.length > 0) {
                listRef.current?.scrollToEnd({ animated: false });
                hasScrolledToBottom.current = true;
              }
            }}
            renderItem={({ item }) => {
              const isMine = item.senderId === user?.id;
              return (
                <View style={[styles.messageRow, { justifyContent: isMine ? 'flex-end' : 'flex-start' }]}>
                  {!isMine && (
                    <View style={styles.avatar}>
                      <MaterialIcons name="person" size={14} color={Colors.primary} />
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      isMine ? styles.bubbleMine : styles.bubbleOther,
                    ]}
                  >
                    {!isMine && (
                      <Text style={styles.senderLabel}>Rider</Text>
                    )}
                    <Text style={[styles.messageText, { color: isMine ? Colors.textInverse : Colors.textPrimary }]}>
                      {item.text}
                    </Text>
                    <View style={styles.timestampRow}>
                      <Text style={[styles.timestamp, { color: isMine ? 'rgba(255,255,255,0.7)' : Colors.textTertiary }]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      {isMine && (
                        <MaterialIcons name="done" size={14} color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />
                      )}
                    </View>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <View style={styles.emptyChatIcon}>
                  <MaterialIcons name="chat-bubble-outline" size={40} color={Colors.textTertiary} />
                </View>
                <Text style={styles.emptyChatTitle}>Start the conversation</Text>
                <Text style={styles.emptyChatText}>
                  Send a message to coordinate pickup and split the fare
                </Text>
              </View>
            }
          />
        )}

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + Spacing.sm }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textTertiary}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
              editable={!isSending}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!text.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!text.trim() || isSending}
            activeOpacity={0.8}
          >
            {isSending ? (
              <ActivityIndicator color={Colors.textInverse} size="small" />
            ) : (
              <MaterialIcons name="send" size={20} color={Colors.textInverse} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FEE2E2',
    borderRadius: BorderRadius.md,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: Spacing.xs,
    alignItems: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 18,
  },
  bubbleMine: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.inputBackground,
    borderBottomLeftRadius: 4,
  },
  senderLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.primary,
    marginBottom: 2,
  },
  messageText: {
    fontSize: Typography.fontSize.base,
    lineHeight: 20,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: Spacing.xs,
  },
  timestamp: {
    fontSize: Typography.fontSize.xs,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  backLinkText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.primary,
  },
  emptyChat: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.lg,
  },
  emptyChatIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyChatTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyChatText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  textInput: {
    minHeight: 40,
    maxHeight: 100,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textTertiary,
    opacity: 0.5,
  },
});
