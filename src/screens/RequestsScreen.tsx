import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRequestsStore } from '../state/requestsStore';

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { requestTypes, submittedRequests, getActiveRequests, getCompletedRequests } = useRequestsStore();

  const activeRequests = getActiveRequests();
  const completedRequests = getCompletedRequests();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meal': return { bg: 'bg-orange-100', text: 'text-orange-800' };
      case 'maintenance': return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'supplies': return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'support': return { bg: 'bg-purple-100', text: 'text-purple-800' };
      case 'transport': return { bg: 'bg-red-100', text: 'text-red-800' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' };
      case 'approved': return { bg: 'bg-blue-100', text: 'text-blue-800', icon: '✅' };
      case 'in_progress': return { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🔄' };
      case 'completed': return { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' };
      case 'cancelled': return { bg: 'bg-red-100', text: 'text-red-800', icon: '❌' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '❓' };
    }
  };

  const renderRequestType = ({ item }) => {
    const colors = getCategoryColor(item.category);
    
    return (
      <Pressable
        onPress={() => navigation.navigate('RequestForm' as never, { requestTypeId: item.id } as never)}
        className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm border border-gray-100"
      >
        <View className="flex-row items-center">
          <View className={`w-14 h-14 ${colors.bg} rounded-xl items-center justify-center mr-4`}>
            <Text className="text-2xl">{item.icon}</Text>
          </View>
          
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-lg font-semibold text-gray-800">
                {item.name}
              </Text>
              {item.requiresApproval && (
                <View className="bg-amber-100 px-2 py-1 rounded-full">
                  <Text className="text-amber-800 text-xs font-medium">Approval Required</Text>
                </View>
              )}
            </View>
            
            <Text className="text-sm text-gray-500 mb-2">
              {item.description}
            </Text>
            
            <Text className="text-xs text-gray-400">
              Est. {item.estimatedTime}
            </Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color="#007AFF" />
        </View>
      </Pressable>
    );
  };

  const renderSubmittedRequest = ({ item }) => {
    const statusColors = getStatusColor(item.status);
    
    return (
      <View className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm border border-gray-100">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Text className="text-2xl mr-3">{item.icon}</Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800">
                  {item.requestTypeName}
                </Text>
                <Text className="text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleDateString()} at{' '}
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
            
            {item.description && (
              <Text className="text-sm text-gray-600 mb-3">
                {item.description}
              </Text>
            )}
            
            <View className="flex-row items-center justify-between">
              <View className={`${statusColors.bg} px-3 py-1 rounded-full`}>
                <Text className={`text-xs font-medium ${statusColors.text}`}>
                  {statusColors.icon} {item.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              
              {item.assignedTo && (
                <Text className="text-xs text-gray-500">
                  Assigned: {item.assignedTo}
                </Text>
              )}
            </View>
            
            {item.estimatedCompletion && item.status === 'in_progress' && (
              <Text className="text-xs text-gray-500 mt-2">
                Est. completion: {new Date(item.estimatedCompletion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Requests</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Submit requests for services and track progress
        </Text>
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <View>
            {/* Active Requests */}
            {activeRequests.length > 0 && (
              <View className="mt-6">
                <Text className="text-lg font-semibold text-gray-800 px-4 mb-4">
                  🔄 Active Requests ({activeRequests.length})
                </Text>
                <FlatList
                  data={activeRequests}
                  renderItem={renderSubmittedRequest}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* Available Request Types */}
            <View className="mt-6">
              <Text className="text-lg font-semibold text-gray-800 px-4 mb-4">
                📝 New Request
              </Text>
              <FlatList
                data={requestTypes}
                renderItem={renderRequestType}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>

            {/* Recent Completed Requests */}
            {completedRequests.length > 0 && (
              <View className="mt-6">
                <Text className="text-lg font-semibold text-gray-800 px-4 mb-4">
                  ✅ Recent History ({completedRequests.length})
                </Text>
                <FlatList
                  data={completedRequests.slice(0, 3)} // Show last 3
                  renderItem={renderSubmittedRequest}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            )}

            {submittedRequests.length === 0 && (
              <View className="mx-4 mt-12 p-8 bg-white rounded-xl items-center">
                <Text className="text-6xl mb-4">📋</Text>
                <Text className="text-lg font-medium text-gray-800 text-center">
                  No requests yet
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-2">
                  Select a service above to make your first request
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