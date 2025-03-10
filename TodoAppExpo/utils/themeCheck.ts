export const getDynamicStyles = (scheme: string) => ({
    container: {
      backgroundColor: scheme === 'dark' ? '#121212' : '#fff',
    },
    text: {
      color: scheme === 'dark' ? '#fff' : '#121212',
    },
  });
  