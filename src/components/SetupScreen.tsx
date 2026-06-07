import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SectionList,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSetupLogic } from '../hooks/useSetupLogic';
import { StationCard } from './setup/StationCard';
import { TrainCard } from './setup/TrainCard';
import { LineFilter } from './setup/LineFilter';
import { RoutePreview } from './setup/RoutePreview';
import { setupStyles as styles } from './setup/styles';

export const SetupScreen = () => {
  const {
    step,
    loading,
    trains,
    search,
    setSearch,
    selectedLine,
    setSelectedLine,
    filteredStations,
    popularStations,
    startStationName,
    endStationName,
    handleStationSelect,
    transitStation,
    startLine,
    endLine,
    endStation,
    setActiveTrain,
    goBack,
    resetToStart,
  } = useSetupLogic();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' />
      <View style={styles.container}>
        <View style={styles.topHeader}>
          <Text style={styles.brand}>MISSION: KCI TRANSIT</Text>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>STAGE 0{step}</Text>
          </View>
        </View>

        {/* 🚀 NEW VISIONARY ROUTE BUILDER UI */}
        <Animated.View entering={FadeInDown} style={styles.routeBuilderCard}>
          {/* Origin Row */}
          <View style={[styles.routeRow, step === 1 && styles.activeRouteRow]}>
            <View style={styles.routeIconColumn}>
              <View style={[styles.routeDot, { backgroundColor: '#3b82f6' }]} />
              <View style={styles.routeConnectorLine} />
            </View>
            <View style={styles.routeInputBox}>
              <Text style={styles.routeLabel}>ASAL KEBERANGKATAN</Text>
              {step === 1 ? (
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder='Cari Stasiun Asal...'
                  placeholderTextColor='#94a3b8'
                  style={styles.routeInput}
                  autoFocus
                />
              ) : (
                <Text style={styles.routeSelectedText}>{startStationName}</Text>
              )}
            </View>
          </View>

          {/* Destination Row */}
          <View style={[styles.routeRow, step === 2 && styles.activeRouteRow]}>
            <View style={styles.routeIconColumn}>
              <View style={[styles.routePin, { backgroundColor: '#ef4444' }]} />
            </View>
            <View style={styles.routeInputBox}>
              <Text style={styles.routeLabel}>TUJUAN AKHIR</Text>
              {step === 2 ? (
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder='Cari Stasiun Tujuan...'
                  placeholderTextColor='#94a3b8'
                  style={styles.routeInput}
                  autoFocus
                />
              ) : step === 3 ? (
                <Text style={styles.routeSelectedText}>{endStationName}</Text>
              ) : (
                <Text style={styles.routePlaceholder}>Pilih stasiun asal dahulu</Text>
              )}
            </View>
          </View>
        </Animated.View>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, step >= 1 && styles.activeLabel]}>START</Text>
            <Text style={[styles.progressLabel, step >= 2 && styles.activeLabel]}>END</Text>
            <Text style={[styles.progressLabel, step >= 3 && styles.activeLabel]}>UNIT</Text>
          </View>
        </View>

        {step < 3 && (
          <LineFilter selectedLine={selectedLine} onSelect={setSelectedLine} />
        )}

        {step === 3 && !loading && (
          <RoutePreview 
            startLine={startLine} 
            endLine={endLine} 
            transitStation={transitStation} 
            endStation={endStation} 
          />
        )}

        <View style={styles.listWrapper}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size='large' color="#3b82f6" />
              <Text style={styles.loadingText}>MENYIAPKAN DATA OPERASI...</Text>
            </View>
          ) : step === 3 ? (
            <FlatList
              data={trains}
              keyExtractor={(item) => item.train_id}
              renderItem={({ item, index }) => (
                <TrainCard 
                  item={item} 
                  index={index} 
                  onPress={() => setActiveTrain(item)} 
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <SectionList
              sections={[
                ...(popularStations.length > 0 && !search ? [{ title: 'STASIUN POPULER', data: popularStations }] : []),
                ...filteredStations
              ]}
              keyExtractor={(item: any) => item.id}
              stickySectionHeadersEnabled={true}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{title}</Text>
                </View>
              )}
              renderItem={({ item, index }) => (
                <StationCard 
                  item={item} 
                  index={index} 
                  onPress={() => handleStationSelect(item.id)} 
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {step > 1 && !loading && (
          <View style={styles.actionFooter}>
            <Pressable style={styles.backBtn} onPress={goBack}>
              <Text style={styles.backText}>TAHAP SEBELUMNYA</Text>
            </Pressable>
            <View style={styles.dividerVertical} />
            <Pressable style={styles.resetBtn} onPress={resetToStart}>
              <Text style={styles.resetText}>RESET OPERASI</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
