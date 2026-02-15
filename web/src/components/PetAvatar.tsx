'use client';

import { resolvePhotoUrl } from '@/lib/photos';

const SPECIES_COLORS: Record<string, string> = {
  dog: 'from-orange-400 to-amber-300',
  cat: 'from-primary to-primary-light',
  exotic: 'from-emerald-400 to-green-300',
  other: 'from-sky-400 to-teal-300',
};

interface Props {
  name: string;
  species: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'w-10 h-10 text-sm', md: 'w-14 h-14 text-lg', lg: 'w-20 h-20 text-2xl' };

export function PetAvatar({ name, species, photoUrl, size = 'md' }: Props) {
  const initials = name.slice(0, 2).toUpperCase();
  const gradient = SPECIES_COLORS[species] || SPECIES_COLORS.exotic;
  const src = resolvePhotoUrl(photoUrl);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-2xl object-cover`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-sm`}>
      {initials}
    </div>
  );
}
