import { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

export const Input = forwardRef<TextInput, TextInputProps>(function Input(props, ref) {
  return <TextInput ref={ref} placeholderTextColor="#6B6B8A" {...props} style={[styles.input, props.style]} />;
});

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#1E1E2E',
    color: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
});