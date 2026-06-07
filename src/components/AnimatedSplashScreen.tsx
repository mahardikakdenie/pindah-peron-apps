import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSequence,
  runOnJS,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  onFinish: () => void;
}

export const AnimatedSplashScreen = ({ onFinish }: AnimatedSplashScreenProps) => {
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);
  const scannerY = useSharedValue(-100);

  useEffect(() => {
    // 1. Logo Sequence
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withSequence(
      withTiming(1.1, { duration: 1000 }),
      withTiming(1, { duration: 800 })
    );

    // 2. Scanner HUD Effect
    scannerY.value = withDelay(
      500,
      withTiming(height + 100, { duration: 2000 })
    );

    // 3. Exit Sequence
    overlayOpacity.value = withDelay(
      2800,
      withTiming(0, { duration: 800 }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      })
    );
  }, [onFinish, logoOpacity, logoScale, scannerY, overlayOpacity]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const scannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scannerY.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.scanner, scannerStyle]} />
      
      <View style={styles.content}>
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          <Image 
            source={require('../../assets/images/splash-icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000).springify()} style={styles.textWrapper}>
          <Text style={styles.brandText}>PINDAH PERON</Text>
          <Text style={styles.tagline}>[ MISSION CONTROL INITIALIZING... ]</Text>
        </Animated.View>
        
        <View style={styles.footer}>
          <Animated.Text entering={FadeIn.delay(1500)} style={styles.versionText}>
            VER 1.0.0.X
          </Animated.Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A1A1A',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoWrapper: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  textWrapper: {
    marginTop: 30,
    alignItems: 'center',
  },
  brandText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
  },
  tagline: {
    color: '#3b82f6',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 2,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: -150,
  },
  versionText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  scanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(59, 130, 246, 0.4)',
    zIndex: 100,
    shadowColor: '#3b82f6',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  }
});
