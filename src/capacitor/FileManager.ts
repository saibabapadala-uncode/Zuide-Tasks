/**
 * FileManager — wraps @capacitor/camera and @capacitor/filesystem.
 *
 * On native (iOS/Android): uses native camera, photo library, and filesystem APIs.
 * On web: falls back to browser <input type="file"> and FileReader.
 *
 * iOS: requires NSCameraUsageDescription and NSPhotoLibraryUsageDescription in Info.plist.
 * Android: permissions are handled automatically by the Capacitor camera plugin.
 */

import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

export interface FileResult {
  path: string
  name: string
  data: string   // base64 data-URI or raw string
  mimeType: string
  size: number
}

export interface CameraOptions {
  quality?: number
  allowEditing?: boolean
  resultType?: 'base64' | 'uri'
}

class FileManagerClass {
  // ── Camera / Gallery ──────────────────────────────────────────────

  /** Take a photo with the device camera */
  async takePhoto(options: CameraOptions = {}): Promise<FileResult | null> {
    try {
      const photo = await Camera.getPhoto({
        quality:      options.quality      ?? 90,
        allowEditing: options.allowEditing ?? false,
        resultType:   CameraResultType.Base64,
        source:       CameraSource.Camera,
        saveToGallery: false,
      })
      if (!photo.base64String) return null
      const dataUrl = `data:image/jpeg;base64,${photo.base64String}`
      return {
        path:     photo.webPath ?? 'photo.jpg',
        name:     'photo.jpg',
        data:     dataUrl,
        mimeType: 'image/jpeg',
        size:     Math.round(photo.base64String.length * 0.75),
      }
    } catch (err: any) {
      // User cancelled or camera unavailable
      if (err?.message?.includes('cancelled') || err?.message?.includes('User cancelled')) return null
      console.warn('takePhoto error:', err)
      return null
    }
  }

  /** Pick a photo from the device gallery */
  async pickFromGallery(options: CameraOptions = {}): Promise<FileResult | null> {
    try {
      const photo = await Camera.getPhoto({
        quality:      options.quality      ?? 90,
        allowEditing: options.allowEditing ?? false,
        resultType:   CameraResultType.Base64,
        source:       CameraSource.Photos,
      })
      if (!photo.base64String) return null
      const dataUrl = `data:image/jpeg;base64,${photo.base64String}`
      return {
        path:     photo.webPath ?? 'gallery.jpg',
        name:     'gallery.jpg',
        data:     dataUrl,
        mimeType: 'image/jpeg',
        size:     Math.round(photo.base64String.length * 0.75),
      }
    } catch (err: any) {
      if (err?.message?.includes('cancelled') || err?.message?.includes('User cancelled')) return null
      console.warn('pickFromGallery error:', err)
      return null
    }
  }

  /** Pick arbitrary file(s) — uses browser <input> on all platforms */
  async pickFiles(accept?: string): Promise<File[]> {
    return new Promise(resolve => {
      const input = document.createElement('input')
      input.type     = 'file'
      input.multiple = true
      if (accept) input.accept = accept
      input.onchange = e => {
        const files = Array.from((e.target as HTMLInputElement).files ?? [])
        resolve(files)
      }
      input.oncancel = () => resolve([])
      input.click()
    })
  }

  // ── Upload ────────────────────────────────────────────────────────

  /** Upload a file to the server (replace with real API call in production) */
  async uploadFile(file: File, taskId: string): Promise<{ id: string; url: string }> {
    await new Promise(r => setTimeout(r, 800)) // simulate network latency
    const id = `att-${Date.now()}`
    return { id, url: `/attachments/${id}-${file.name}` }
  }

  /** Download a file */
  async downloadFile(url: string, filename: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.downloadFile({
          url,
          path:      filename,
          directory: Directory.Documents,
        })
        return
      } catch (err) {
        console.warn('Native download failed, falling back to browser:', err)
      }
    }
    // Web fallback
    const a = document.createElement('a')
    a.href     = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // ── Filesystem ───────────────────────────────────────────────────

  /** Write text/base64 data to the app data directory */
  async writeFile(path: string, data: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Filesystem.writeFile({
        path,
        data,
        directory: Directory.Data,
        encoding:  data.startsWith('data:') ? undefined : Encoding.UTF8,
        recursive: true,
      })
      return
    }
    // Web fallback: IndexedDB via @capacitor/filesystem web implementation
    try {
      await Filesystem.writeFile({
        path,
        data,
        directory: Directory.Data,
        encoding:  data.startsWith('data:') ? undefined : Encoding.UTF8,
        recursive: true,
      })
    } catch {
      localStorage.setItem(`fs_${path}`, data)
    }
  }

  /** Read text/base64 data from the app data directory */
  async readFile(path: string): Promise<FileResult | null> {
    try {
      const result = await Filesystem.readFile({
        path,
        directory: Directory.Data,
        encoding:  Encoding.UTF8,
      })
      const data = typeof result.data === 'string' ? result.data : ''
      return {
        path,
        name:     path.split('/').pop() ?? path,
        data,
        mimeType: 'text/plain',
        size:     data.length,
      }
    } catch {
      // Web fallback
      const stored = localStorage.getItem(`fs_${path}`)
      if (!stored) return null
      return {
        path,
        name:     path.split('/').pop() ?? path,
        data:     stored,
        mimeType: 'text/plain',
        size:     stored.length,
      }
    }
  }

  /** Get the on-device URI for a file */
  async getFileUri(path: string): Promise<string | null> {
    try {
      const result = await Filesystem.getUri({ path, directory: Directory.Data })
      return result.uri
    } catch {
      return null
    }
  }
}

export const FileManager = new FileManagerClass()
