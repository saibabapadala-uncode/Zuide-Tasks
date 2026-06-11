/**
 * DeviceManager — wraps @capacitor/device.
 * Works on iOS, Android, and Web (the plugin provides browser-based fallbacks on web).
 */

import { Capacitor } from '@capacitor/core'
import { Device } from '@capacitor/device'

export interface DeviceInfo {
  model: string
  platform: 'ios' | 'android' | 'web'
  operatingSystem: string
  osVersion: string
  manufacturer: string
  isVirtual: boolean
  webViewVersion?: string
  appVersion: string
  appBuild: string
}

export interface DeviceId {
  identifier: string
}

class DeviceManagerClass {
  /** Get hardware/OS device information */
  async getInfo(): Promise<DeviceInfo> {
    const info = await Device.getInfo()
    return {
      model:           info.model,
      platform:        info.platform as 'ios' | 'android' | 'web',
      operatingSystem: info.operatingSystem,
      osVersion:       info.osVersion,
      manufacturer:    info.manufacturer,
      isVirtual:       info.isVirtual,
      webViewVersion:  info.webViewVersion,
      appVersion:      '1.0.0',
      appBuild:        '20260611',
    }
  }

  /** Get a unique, stable device identifier */
  async getId(): Promise<DeviceId> {
    const { identifier } = await Device.getId()
    return { identifier }
  }

  /** True when running inside a Capacitor native shell (iOS/Android app) */
  isNative(): boolean {
    return Capacitor.isNativePlatform()
  }

  /** Returns 'ios' | 'android' | 'web' */
  getPlatform(): 'ios' | 'android' | 'web' {
    return Capacitor.getPlatform() as 'ios' | 'android' | 'web'
  }

  /** Screen orientation based on viewport dimensions */
  getOrientation(): 'portrait' | 'landscape' {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  }
}

export const DeviceManager = new DeviceManagerClass()
