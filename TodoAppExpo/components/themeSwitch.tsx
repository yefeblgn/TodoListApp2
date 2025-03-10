import React from 'react';
import { Switch } from 'react-native';
import { useTheme } from '../contexts/themeContext';

const ThemeSwitch = () => {
  const { toggleTheme, theme } = useTheme();

  return <Switch onValueChange={toggleTheme} value={theme.background === '#121212'} />;
};

export default ThemeSwitch;
