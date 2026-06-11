import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.zuide.tasks',
  appName: 'Zuide Tasks',
  webDir: 'dist',

  server: {
    // Use https scheme on Android to match iOS behavior and enable secure cookie/storage
    androidScheme: 'https',
    // Uncomment for live-reload during development:
    // url: 'http://YOUR_LOCAL_IP:3000',
    // cleartext: true,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#4f46e5',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
    },

    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },

    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#ffffff',
    },

    Preferences: {
      group: 'ZuideTasks',
    },

    Camera: {
      // permissions handled by native platform configs
    },

    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#4f46e5',
    },
  },

  android: {
    // Kotlin and Gradle versions set by Capacitor defaults
    buildOptions: {
      // Set after generating a release keystore:
      // keystorePath: 'android/release.keystore',
      // keystoreAlias: 'key0',
    },
  },

  ios: {
    contentInset: 'always',
    scheme: 'ZuideTasks',
    backgroundColor: '#f8fafc',
  },
}

export default config
