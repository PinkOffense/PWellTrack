import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, fontSize } from '../theme';

interface DatePickerInputProps {
  label: string;
  value: string; // YYYY-MM-DD or YYYY-MM-DDTHH:MM
  onChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
  mode?: 'date' | 'datetime';
}

export function DatePickerInput({ label, value, onChange, placeholder, required, mode = 'date' }: DatePickerInputProps) {
  const { t } = useTranslation();
  const defaultPlaceholder = mode === 'datetime' ? 'YYYY-MM-DDTHH:MM' : 'YYYY-MM-DD';
  const actualPlaceholder = placeholder ?? defaultPlaceholder;
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  // For web, use native date/datetime-local input
  if (Platform.OS === 'web') {
    const inputType = mode === 'datetime' ? 'datetime-local' : 'date';
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
        <View style={styles.inputRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} style={styles.icon} />
          <input
            type={inputType}
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
  const datePattern = mode === 'datetime'
    ? /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/
    : /^\d{4}-\d{2}-\d{2}$/;

  const handleConfirm = () => {
    if (tempDate && datePattern.test(tempDate)) {
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
          {value || actualPlaceholder}
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
              placeholder={actualPlaceholder}
              placeholderTextColor={colors.placeholder}
              keyboardType="numbers-and-punctuation"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShow(false)} style={styles.modalBtn}>
                <Text style={styles.cancelText}>{t('datePicker.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm} style={[styles.modalBtn, styles.confirmBtn]}>
                <Text style={styles.confirmText}>{t('datePicker.ok')}</Text>
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
