import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skilldash.app',
  appName: 'SkillDash',
  webDir: '../out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#2563eb',
      showSpinner: false,
      androidScaleType: 'center'
    },
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
