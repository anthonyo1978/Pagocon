import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useRequestsStore } from '../state/requestsStore';

export default function RequestFormScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const { requestTypes, submitRequest } = useRequestsStore();

  const requestTypeId = route.params?.requestTypeId;
  const requestType = requestTypes.find(type => type.id === requestTypeId);
  
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!requestType) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-gray-500">Request type not found</Text>
      </View>
    );
  }

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'text-green-800', bg: 'bg-green-50', border: 'border-green-200' },
    { value: 'medium', label: 'Medium Priority', color: 'text-blue-800', bg: 'bg-blue-50', border: 'border-blue-200' },
    { value: 'high', label: 'High Priority', color: 'text-orange-800', bg: 'bg-orange-50', border: 'border-orange-200' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-800', bg: 'bg-red-50', border: 'border-red-200' }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meal': return 'bg-orange-500';
      case 'maintenance': return 'bg-blue-500';
      case 'supplies': return 'bg-green-500';
      case 'support': return 'bg-purple-500';
      case 'transport': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please provide a description for your request.', [{ text: 'OK' }]);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission delay
    setTimeout(() => {
      submitRequest({
        requestTypeId: requestType.id,
        requestTypeName: requestType.name,
        icon: requestType.icon,
        description: description.trim(),
        priority,
        location: location.trim() || undefined
      });

      setIsSubmitting(false);
      
      const approvalMessage = requestType.requiresApproval 
        ? 'Your request has been submitted and is pending approval. You will receive updates as it progresses.'
        : 'Your request has been submitted successfully! You will receive updates as it progresses.';

      Alert.alert(
        'Request Submitted!',
        approvalMessage,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-semibold text-gray-800">
              New Request
            </Text>
          </View>
        </View>
      </View>

      {/* Request Type Info */}
      <View className="bg-gray-50 px-4 py-6 border-b border-gray-200">
        <View className="flex-row items-center">
          <View className={`w-16 h-16 ${getCategoryColor(requestType.category)} rounded-2xl items-center justify-center mr-4`}>
            <Text className="text-3xl">{requestType.icon}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800">
              {requestType.name}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              {requestType.description}
            </Text>
            <Text className="text-xs text-gray-500 mt-2">
              Estimated time: {requestType.estimatedTime}
            </Text>
            {requestType.requiresApproval && (
              <View className="bg-amber-100 px-2 py-1 rounded-full mt-2 self-start">
                <Text className="text-amber-800 text-xs font-medium">⚠️ Requires Approval</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Form */}
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-800 mb-2">
            Description <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Please describe your request in detail..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-base min-h-[100px]"
            maxLength={500}
          />
          <Text className="text-xs text-gray-500 mt-1">
            {description.length}/500 characters
          </Text>
        </View>

        {/* Location */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-800 mb-2">
            Location (Optional)
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., Room 12, Ward 3, Main lobby..."
            className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-base"
          />
        </View>

        {/* Priority */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-800 mb-3">
            Priority Level
          </Text>
          <View className="space-y-3">
            {priorityOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setPriority(option.value as any)}
                className={`flex-row items-center p-4 rounded-lg border-2 ${
                  priority === option.value
                    ? `${option.border} ${option.bg}`
                    : 'border-gray-200 bg-white'
                }`}
              >
                <View className={`w-5 h-5 rounded-full border-2 mr-3 ${
                  priority === option.value ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                }`}>
                  {priority === option.value && (
                    <View className="w-full h-full rounded-full bg-white scale-50" />
                  )}
                </View>
                <Text className={`text-base font-medium ${
                  priority === option.value ? option.color : 'text-gray-800'
                }`}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Info Box */}
        <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" className="mr-2 mt-1" />
            <View className="flex-1">
              <Text className="text-sm text-blue-800 font-medium mb-1">
                What happens next?
              </Text>
              <Text className="text-sm text-blue-700 leading-5">
                {requestType.requiresApproval
                  ? 'Your request will be reviewed by management before being assigned to the appropriate team. You will receive updates via the app.'
                  : 'Your request will be automatically assigned to the appropriate team. You will receive updates as work progresses.'
                }
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="bg-white px-4 py-4 border-t border-gray-200" style={{ paddingBottom: insets.bottom + 16 }}>
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || !description.trim()}
          className={`py-4 rounded-lg ${
            isSubmitting || !description.trim() ? 'bg-gray-300' : 'bg-blue-500'
          }`}
        >
          <Text className="text-center text-base font-semibold text-white">
            {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}