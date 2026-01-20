import React from 'react';
import Reader from '../components/reader/Reader';

const ReaderPage = ({ darkMode, setDarkMode }) => {
  return <Reader darkMode={darkMode} setDarkMode={setDarkMode} />;
};

export default ReaderPage;
