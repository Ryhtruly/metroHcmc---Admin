import React, { createContext, useState, useContext, useEffect } from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';

interface ThemeContextType {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  siderColor: string;
  setSiderColor: (color: string) => void;
  
  // 👇 THÊM CÁI NÀY
  contentColor: string; 
  setContentColor: (color: string) => void;
  
  locale: string;
  setLocale: (lang: 'vi' | 'en') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  
  const [primaryColor, setPrimaryColor] = useState<string>(localStorage.getItem('theme_primary') || '#6C63FF');
  const [siderColor, setSiderColor] = useState<string>(localStorage.getItem('theme_sider') || '#111827');
  
  // 👇 Mặc định là màu trắng (#ffffff)
  const [contentColor, setContentColor] = useState<string>(localStorage.getItem('theme_content') || '#ffffff');

  const [locale, setLocaleState] = useState<'vi' | 'en'>((localStorage.getItem('theme_locale') as 'vi'|'en') || 'vi');

  const setLocale = (lang: 'vi' | 'en') => {
    setLocaleState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('theme_locale', lang);
  };

  useEffect(() => { localStorage.setItem('theme_primary', primaryColor); }, [primaryColor]);
  useEffect(() => { localStorage.setItem('theme_sider', siderColor); }, [siderColor]);
  
  // 👇 Lưu màu nền mới
  useEffect(() => { localStorage.setItem('theme_content', contentColor); }, [contentColor]);

  return (
    // 👇 Nhớ thêm contentColor vào value
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor, siderColor, setSiderColor, contentColor, setContentColor, locale, setLocale }}>
      <ConfigProvider
        locale={locale === 'vi' ? viVN : enUS}
        theme={{
          token: {
            colorPrimary: primaryColor,
            borderRadius: 8,
            fontFamily: "'Inter', sans-serif",
          },
          components: {
            Layout: { siderBg: siderColor },
            Menu: { darkItemBg: 'transparent' }
          }
        }}
      >
        <AntdApp>
          {children}
        </AntdApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};