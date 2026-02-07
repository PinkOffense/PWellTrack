import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme';

interface DatePickerInputProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function DatePickerInput({ label, value, onChange, placeholder = 'YYYY-MM-DD', required }: DatePickerInputProps) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  // For web, use native date input
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
        <View style={styles.inputRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} style={styles.icon} />
          <input
            type="date"
            value={value}
            onChange={(e: any) => onChange(e.target.value)}
            style={{
              flex: 1,
              fontSize: 16,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              color: colors.textPrimary,
              fontFamily: 'inherit',
            }}
          />
        </View>
      </View>
    );
  }

  // For native: modal with date input
  const handleConfirm = () => {
    if (tempDate && /^\d{4}-\d{2}-\d{2}$/.test(tempDate)) {
      onChange(tempDate);
    }
    setShow(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
      <TouchableOpacity style={styles.inputRow} onPress={() => { setTempDate(value); setShow(true); }}>
        <Ionicons name="calendar-outline" size={20} color={colors.primary} style={styles.icon} />
        <Text style={[styles.valueText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={show} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShow(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{label}</Text>
            <TextInput
              style={styles.modalInput}
              value={tempDate}
              onChangeText={setTempDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.placeholder}
              keyboardType="numbers-and-punctuation"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShow(false)} style={styles.modalBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm} style={[styles.modalBtn, styles.confirmBtn]}>
                <Text style={styles.confirmText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primaryLight + '12', borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, height: 52,
    borderWidth: 1, borderColor: colors.border,
  },
  icon: { marginRight: spacing.sm },
  valueText: { flex: 1, fontSize: 16, color: colors.textPrimary },
  placeholderText: { color: colors.placeholder },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.xl, width: 300 },
  modalTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  modalInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
    padding: spacing.md, fontSize: 18, color: colors.textPrimary, textAlign: 'center',
    letterSpacing: 2,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.lg, gap: spacing.md },
  modalBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  cancelText: { fontSize: fontSize.md, color: colors.textMuted },
  confirmBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.md },
  confirmText: { fontSize: fontSize.md, color: colors.white, fontWeight: '600' },
});
