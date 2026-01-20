export const getTheme = (darkMode) => ({
  bg: darkMode ? '#000000' : '#FFFFFF',
  surface1: darkMode ? '#0D0D0D' : '#F9F9F9',
  surface2: darkMode ? '#1C1C1E' : '#F2F2F7',
  surface3: darkMode ? '#2C2C2E' : '#E5E5EA',
  textPrimary: darkMode ? '#FFFFFF' : '#000000',
  textSecondary: darkMode ? '#8E8E93' : '#6E6E73',
  textTertiary: darkMode ? '#636366' : '#AEAEB2',
  accent: darkMode ? '#DFFF00' : '#7CB342',  // Темно-зеленый для светлой темы
  accentHover: darkMode ? '#C8E600' : '#689F38',
  divider: darkMode ? '#38383A' : '#D1D1D6',
  success: darkMode ? '#32D74B' : '#34C759',
  error: darkMode ? '#FF453A' : '#FF3B30',
});

export const gradients = [
  'linear-gradient(135deg, #E8D5F2 0%, #B8A5D3 35%, #9B8FC2 70%, #7B6FA8 100%)',
  'linear-gradient(145deg, #FFD4C4 0%, #F5A08A 40%, #E87A7A 80%, #D65F6F 100%)',
  'linear-gradient(135deg, #A8E6F0 0%, #6BC5D8 40%, #4DA6C4 100%)',
  'linear-gradient(140deg, #C8F7DC 0%, #7DDBA3 50%, #5BC489 100%)',
  'linear-gradient(135deg, #FFE5B4 0%, #F5C07A 50%, #E5A050 100%)',
  'linear-gradient(145deg, #D4E5FF 0%, #A5C4F5 40%, #7AA3E8 100%)',
];

export const getRandomGradient = () => {
  return gradients[Math.floor(Math.random() * gradients.length)];
};
