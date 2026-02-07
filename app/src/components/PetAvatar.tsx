import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius } from '../theme';

interface Props {
  name: string;
  species: string;
  size?: number;
  photoUrl?: string | null;
}

const speciesIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  dog: 'paw',
  cat: 'logo-octocat',
  exotic: 'leaf',
};

const speciesColor: Record<string, string> = {
  dog: colors.dog,
  cat: colors.cat,
  exotic: colors.exotic,
};

export function PetAvatar({ name, species, size = 56, photoUrl }: Props) {
  const bg = speciesColor[species] ?? colors.primary;
  const icon = speciesIcon[species] ?? 'paw';

  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg + '20',
        },
      ]}
    >
      <Ionicons name={icon} size={size * 0.45} color={bg} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
