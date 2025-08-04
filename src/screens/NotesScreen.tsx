import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useNotesStore } from '../state/notesStore';

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { templates, completedNotes } = useNotesStore();

  const pendingNotes = completedNotes.filter(note => !note.submitted);
  const submittedNotes = completedNotes.filter(note => note.submitted);

  const renderTemplate = ({ item }) => (
    <Pressable
      onPress={() => navigation.navigate('NoteForm' as never, { templateId: item.id } as never)}
      className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm border border-gray-100"
    >
      <View className="flex-row items-center">
        <Text className="text-3xl mr-3">{item.icon}</Text>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{item.title}</Text>
          <Text className="text-sm text-gray-500 mt-1">
            {item.fields.length} fields • Tap to fill out
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#007AFF" />
      </View>
    </Pressable>
  );

  const renderCompletedNote = ({ item }) => (
    <View className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-800">{item.templateTitle}</Text>
          <Text className="text-sm text-gray-500 mt-1">
            {new Date(item.timestamp).toLocaleDateString()} at{' '}
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${item.submitted ? 'bg-green-100' : 'bg-yellow-100'}`}>
          <Text className={`text-xs font-medium ${item.submitted ? 'text-green-800' : 'text-yellow-800'}`}>
            {item.submitted ? 'Submitted ✅' : 'Pending ⏳'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Notes</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Fill out forms and submit to dashboard
        </Text>
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <View>
            {/* Available Templates */}
            <View className="mt-6">
              <Text className="text-lg font-semibold text-gray-800 px-4 mb-4">
                Available Forms
              </Text>
              <FlatList
                data={templates}
                renderItem={renderTemplate}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>

            {/* Recent Notes */}
            {completedNotes.length > 0 && (
              <View className="mt-6">
                <Text className="text-lg font-semibold text-gray-800 px-4 mb-4">
                  Recent Notes ({completedNotes.length})
                </Text>
                
                {pendingNotes.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-base font-medium text-yellow-700 px-4 mb-2">
                      Pending Submission ({pendingNotes.length})
                    </Text>
                    <FlatList
                      data={pendingNotes}
                      renderItem={renderCompletedNote}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                    />
                  </View>
                )}

                {submittedNotes.length > 0 && (
                  <View>
                    <Text className="text-base font-medium text-green-700 px-4 mb-2">
                      Submitted ({submittedNotes.length})
                    </Text>
                    <FlatList
                      data={submittedNotes.slice(0, 5)} // Show last 5
                      renderItem={renderCompletedNote}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                    />
                  </View>
                )}
              </View>
            )}

            {completedNotes.length === 0 && (
              <View className="mx-4 mt-12 p-8 bg-white rounded-xl items-center">
                <Text className="text-6xl mb-4">📝</Text>
                <Text className="text-lg font-medium text-gray-800 text-center">
                  No notes yet
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-2">
                  Select a form above to get started
                </Text>
              </View>
            )}
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}