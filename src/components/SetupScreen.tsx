import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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
    handleStationSelect,
    transitStation,
    startLine,
    endLine,
    endStation,
    setActiveTrain,
    goBack,
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

        <Animated.View entering={FadeInDown} key={step} style={styles.titleSection}>
          <Text style={styles.title}>
            {step === 1
              ? 'OBJECTIVE: ORIGIN'
              : step === 2
                ? 'OBJECTIVE: DESTINATION'
                : 'OBJECTIVE: SELECT UNIT'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? 'Pilih stasiun keberangkatan Anda'
              : step === 2
                ? 'Tentukan target akhir perjalanan'
                : 'Pilih armada yang sedang Anda naiki'}
          </Text>
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
          <>
            <Animated.View entering={FadeInDown.delay(100)} style={styles.searchWrapper}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder='Cari Nama Stasiun...'
                placeholderTextColor='#94a3b8'
                style={styles.search}
              />
            </Animated.View>
            <LineFilter selectedLine={selectedLine} onSelect={setSelectedLine} />
          </>
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
              <Text style={styles.loadingText}>MENGAMBIL DATA ARMADA...</Text>
            </View>
          ) : (
            <FlatList
              data={step === 3 ? trains : filteredStations}
              keyExtractor={(item: any) => item.train_id || item.id}
              renderItem={({ item, index }) => 
                step === 3 ? (
                  <TrainCard 
                    item={item} 
                    index={index} 
                    onPress={() => setActiveTrain(item)} 
                  />
                ) : (
                  <StationCard 
                    item={item} 
                    index={index} 
                    onPress={() => handleStationSelect(item.id)} 
                  />
                )
              }
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {step > 1 && !loading && (
          <Pressable style={styles.backBtn} onPress={goBack}>
            <Text style={styles.backText}>KEMBALI KE TAHAP SEBELUMNYA</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};
