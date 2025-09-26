import * as React from "react";
import {
  isMobile as detectMobile,
  isTablet,
  isBrowser,
  isAndroid,
  isIOS,
  isWinPhone,
  isMobileOnly,
  isDesktop,
  deviceDetect,
  BrowserView,
  MobileView,
  TabletView,
} from 'react-device-detect';

const MOBILE_BREAKPOINT = 768;
const SMALL_MOBILE_BREAKPOINT = 375;

// Export components for conditional rendering
export { BrowserView, MobileView, TabletView };

// Hook principal que combina detecção de biblioteca com media queries
export function useIsMobile() {
  const [isMobileScreen, setIsMobileScreen] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobileScreen(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobileScreen(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Combina a detecção de dispositivo com o tamanho da tela
  return detectMobile || isTablet || !!isMobileScreen;
}

export function useIsSmallMobile() {
  const [isSmallMobile, setIsSmallMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${SMALL_MOBILE_BREAKPOINT}px)`);
    const onChange = () => {
      setIsSmallMobile(window.innerWidth <= SMALL_MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsSmallMobile(window.innerWidth <= SMALL_MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isSmallMobile || (isMobileOnly && window.innerWidth <= SMALL_MOBILE_BREAKPOINT);
}

// Hook melhorado para detectar WebView
export function useIsWebView() {
  const [isWebView, setIsWebView] = React.useState(false);

  React.useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Detecta webviews comuns com mais precisão
    const isInWebView = 
      // Android WebView
      (userAgent.indexOf('wv') > -1) ||
      // iOS WebView
      (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(userAgent)) ||
      // React Native WebView
      (userAgent.indexOf('ReactNative') > -1) ||
      // Outros indicadores de WebView
      (userAgent.indexOf('WebView') > -1) ||
      // Instagram in-app browser
      (userAgent.indexOf('Instagram') > -1) ||
      // Facebook in-app browser  
      (userAgent.indexOf('FBAN') > -1 || userAgent.indexOf('FBAV') > -1) ||
      // Twitter in-app browser
      (userAgent.indexOf('Twitter') > -1) ||
      // Line in-app browser
      (userAgent.indexOf('Line') > -1) ||
      // Android com Version indica WebView
      (userAgent.indexOf('Android') > -1 && userAgent.indexOf('Version/') > -1);
    
    setIsWebView(isInWebView);
  }, []);

  return isWebView;
}

// Hook para obter informações detalhadas do dispositivo
export function useDeviceInfo() {
  return {
    isMobile: detectMobile,
    isTablet,
    isDesktop,
    isAndroid,
    isIOS,
    isWinPhone,
    isMobileOnly,
    isBrowser,
    deviceInfo: deviceDetect(),
  };
}

// Hook para detectar orientação
export function useOrientation() {
  const [isPortrait, setIsPortrait] = React.useState(
    window.innerHeight > window.innerWidth
  );

  React.useEffect(() => {
    const handleOrientationChange = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return { isPortrait, isLandscape: !isPortrait };
}
