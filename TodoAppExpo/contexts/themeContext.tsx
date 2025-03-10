import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
  } from 'react';
  import { useColorScheme } from 'react-native';
  import lightTheme from '../themes/lightTheme';
  import darkTheme from '../themes/darkTheme';
  
  type ThemeType = typeof lightTheme;
  type ThemeScheme = 'light' | 'dark';
  
  interface ThemeContextProps {
    theme: ThemeType;
    currentScheme: ThemeScheme;
    setCurrentScheme: React.Dispatch<React.SetStateAction<ThemeScheme>>;
  }
  
  const ThemeContext = createContext<ThemeContextProps>({
    theme: lightTheme,
    currentScheme: 'light',
    setCurrentScheme: () => {},
  });
  
  export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const colorScheme = useColorScheme();
  
    const [currentScheme, setCurrentScheme] = useState<ThemeScheme>(
      colorScheme === 'dark' ? 'dark' : 'light'
    );
    useEffect(() => {
      if (colorScheme) {
        setCurrentScheme(colorScheme === 'dark' ? 'dark' : 'light');
      }
    }, [colorScheme]);
  
    const theme = currentScheme === 'dark' ? darkTheme : lightTheme;
  
    return (
      <ThemeContext.Provider value={{ theme, currentScheme, setCurrentScheme }}>
        {children}
      </ThemeContext.Provider>
    );
  };
  
  export const useTheme = () => {
    return useContext(ThemeContext);
  };
  