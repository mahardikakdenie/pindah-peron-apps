import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { setupStyles as styles } from './styles';

const LINE_FILTERS = [
  { id: 'Bogor', name: 'BOGOR', color: '#ef4444' },
  { id: 'Cikarang', name: 'CIKARANG', color: '#3b82f6' },
  { id: 'Rangkasbitung', name: 'RANGKAS', color: '#10b981' },
  { id: 'Tangerang', name: 'TANGERANG', color: '#8b5cf6' },
  { id: 'TanjungPriok', name: 'PRIOK', color: '#ec4899' },
];

interface LineFilterProps {
  selectedLine: string | null;
  onSelect: (line: string | null) => void;
}

export const LineFilter = ({ selectedLine, onSelect }: LineFilterProps) => (
  <View style={styles.filterContainer}>
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={[{ id: null, name: 'ALL', color: '#1e293b' }, ...LINE_FILTERS]}
      keyExtractor={(item) => item.id || 'all'}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onSelect(item.id)}
          style={[
            styles.filterChip,
            selectedLine === item.id && { backgroundColor: item.color, borderColor: item.color }
          ]}
        >
          <Text style={[styles.filterText, selectedLine === item.id && { color: '#FFF' }]}>
            {item.name}
          </Text>
        </Pressable>
      )}
    />
  </View>
);
