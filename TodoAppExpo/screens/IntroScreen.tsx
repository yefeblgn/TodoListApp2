import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Video } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IntroScreen = () => {
  const navigation = useNavigation();
  let hasNavigated = false;

  const handleVideoEnd = async () => {
    if (hasNavigated) return;
    hasNavigated = true;
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      navigation.navigate('Main');
    } else {
      navigation.navigate('Auth');
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.positionMillis >= 3200 && !status.didJustFinish) {
      handleVideoEnd();
    }
    if (status.didJustFinish) {
      handleVideoEnd();
    }
  };

  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/videos/intro.mp4')}
        style={styles.video}
        resizeMode="cover"
        shouldPlay
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9eff5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

export default IntroScreen;
