import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useNotesStore, NoteField } from '../state/notesStore';

export default function NoteFormScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const { getTemplate, addCompletedNote, submitNote } = useNotesStore();

  const templateId = route.params?.templateId;
  const template = getTemplate(templateId);
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!template) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-gray-500">Template not found</Text>
      </View>
    );
  }

  const updateField = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const validateForm = () => {
    const requiredFields = template.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.id]?.toString().trim());
    
    if (missingFields.length > 0) {
      Alert.alert(
        'Missing Required Fields',
        `Please fill out: ${missingFields.map(f => f.label).join(', ')}`,
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const saveDraft = () => {
    if (Object.keys(formData).length === 0) {
      Alert.alert('No Data', 'Please fill out at least one field before saving.', [{ text: 'OK' }]);
      return;
    }

    addCompletedNote({
      templateId: template.id,
      templateTitle: template.title,
      data: formData,
      submitted: false,
    });

    Alert.alert(
      'Draft Saved',
      'Your note has been saved as a draft. You can submit it later.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const submitForm = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate submission delay
    setTimeout(() => {
      addCompletedNote({
        templateId: template.id,
        templateTitle: template.title,
        data: formData,
        submitted: true,
      });

      setIsSubmitting(false);
      Alert.alert(
        'Note Submitted!',
        'Your note has been sent to the dashboard successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1500);
  };

  const renderField = (field: NoteField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <View key={field.id} className="mb-6">
            <Text className="text-base font-medium text-gray-800 mb-2">
              {field.label}
              {field.required && <Text className="text-red-500"> *</Text>}
            </Text>
            <TextInput
              value={value}
              onChangeText={(text) => updateField(field.id, text)}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              keyboardType={field.type === 'number' ? 'numeric' : 'default'}
              className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-base"
            />
          </View>
        );

      case 'textarea':
        return (
          <View key={field.id} className="mb-6">
            <Text className="text-base font-medium text-gray-800 mb-2">
              {field.label}
              {field.required && <Text className="text-red-500"> *</Text>}
            </Text>
            <TextInput
              value={value}
              onChangeText={(text) => updateField(field.id, text)}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-base min-h-[100px]"
            />
          </View>
        );

      case 'select':
        return (
          <View key={field.id} className="mb-6">
            <Text className="text-base font-medium text-gray-800 mb-2">
              {field.label}
              {field.required && <Text className="text-red-500"> *</Text>}
            </Text>
            <View className="space-y-2">
              {field.options?.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => updateField(field.id, option)}
                  className={`flex-row items-center p-3 rounded-lg border ${
                    value === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <View className={`w-5 h-5 rounded-full border-2 mr-3 ${
                    value === option ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                  }`}>
                    {value === option && (
                      <View className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </View>
                  <Text className={`text-base ${value === option ? 'text-blue-800' : 'text-gray-800'}`}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case 'checkbox':
        return (
          <View key={field.id} className="mb-6">
            <View className="flex-row items-center">
              <Switch
                value={!!value}
                onValueChange={(newValue) => updateField(field.id, newValue)}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
              />
              <Text className="text-base font-medium text-gray-800 ml-3">
                {field.label}
                {field.required && <Text className="text-red-500"> *</Text>}
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
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
              {template.icon} {template.title}
            </Text>
          </View>
        </View>
      </View>

      {/* Form */}
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {template.fields.map(renderField)}
      </ScrollView>

      {/* Actions */}
      <View className="bg-white px-4 py-4 border-t border-gray-200" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row space-x-3">
          <Pressable
            onPress={saveDraft}
            className="flex-1 bg-gray-100 py-4 rounded-lg"
          >
            <Text className="text-center text-base font-semibold text-gray-700">
              Save Draft
            </Text>
          </Pressable>
          
          <Pressable
            onPress={submitForm}
            disabled={isSubmitting}
            className={`flex-1 py-4 rounded-lg ${
              isSubmitting ? 'bg-gray-300' : 'bg-blue-500'
            }`}
          >
            <Text className="text-center text-base font-semibold text-white">
              {isSubmitting ? 'Submitting...' : 'Submit to Dashboard'}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}