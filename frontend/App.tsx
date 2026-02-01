import React from 'react';
import { StatusBar } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';

const App: React.FC = () => {
  return (
    <>
      <StatusBar style="auto" />
      <HomeScreen />
    </>
  );
};

export default App;