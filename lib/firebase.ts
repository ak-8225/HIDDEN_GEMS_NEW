/**
 * Firebase Storage upload — implemented over the REST API instead of the
 * full Firebase JS SDK so we can avoid that dependency entirely.
 *
 * Endpoint reference:
 *   POST https://firebasestorage.googleapis.com/v0/b/{bucket}/o?name={path}
 *   – body is the raw file bytes
 *   – returns JSON containing `downloadTokens`
 *   – the public URL is then:
 *     https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{enc(path)}?alt=media&token={token}
 *
 * For this to succeed without auth, the project's Storage rules must allow
 * writes from the public — e.g. for a demo / academic project:
 *
 *   rules_version = '2';
 *   service firebase.storage {
 *     match /b/{bucket}/o {
 *       match /destinations/{file=**} {
 *         allow read;
 *         allow write: if request.resource.size < 8 * 1024 * 1024
 *                      && request.resource.contentType.matches('image/.*');
 *       }
 *     }
 *   }
 */

export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
}

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]

export interface UploadProgress {
  loaded: number
  total: number
  /** 0..1 */
  fraction: number
}

export interface UploadOptions {
  /** Folder inside the bucket. Defaults to "destinations". */
  folder?: string
  /** Custom file name (without extension). A random suffix is always appended. */
  baseName?: string
  /** Called repeatedly with upload progress. */
  onProgress?: (p: UploadProgress) => void
}

export class FirebaseUploadError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = "FirebaseUploadError"
  }
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "gem"
  )
}

/**
 * Validate a File before upload. Throws FirebaseUploadError on failure.
 */
export function validateImage(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new FirebaseUploadError(
      `Image must be JPEG, PNG, WebP, GIF or AVIF. Got "${file.type || "unknown"}".`,
    )
  }
  if (file.size > MAX_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1)
    throw new FirebaseUploadError(`Image is ${mb}MB. Max size is 8MB.`)
  }
}

/**
 * Upload a file to Firebase Storage and return its public download URL.
 * Uses XMLHttpRequest under the hood so we get real progress events.
 */
export function uploadImageToFirebase(
  file: File,
  options: UploadOptions = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      validateImage(file)
    } catch (err) {
      reject(err)
      return
    }

    const bucket = FIREBASE_CONFIG.storageBucket
    if (!bucket) {
      reject(new FirebaseUploadError("Firebase storage bucket is not configured."))
      return
    }

    const folder = (options.folder ?? "destinations").replace(/^\/+|\/+$/g, "")
    const ext = (file.name.match(/\.[a-z0-9]+$/i)?.[0] ?? ".jpg").toLowerCase()
    const base = slugify(options.baseName ?? file.name.replace(/\.[^.]+$/, ""))
    const path = `${folder}/${base}-${randomId()}${ext}`

    const url =
      `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o` +
      `?name=${encodeURIComponent(path)}` +
      `&uploadType=media`

    const xhr = new XMLHttpRequest()
    xhr.open("POST", url)
    xhr.setRequestHeader("Content-Type", file.type)

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && options.onProgress) {
        options.onProgress({
          loaded: e.loaded,
          total: e.total,
          fraction: e.total > 0 ? e.loaded / e.total : 0,
        })
      }
    })

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const body = JSON.parse(xhr.responseText) as {
            downloadTokens?: string
            name?: string
          }
          const token = body.downloadTokens
          const objectName = body.name ?? path
          if (!token) {
            reject(
              new FirebaseUploadError(
                "Firebase did not return a download token. Check your Storage rules.",
              ),
            )
            return
          }
          const downloadUrl =
            `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o/` +
            `${encodeURIComponent(objectName)}?alt=media&token=${token}`
          resolve(downloadUrl)
        } catch (err) {
          reject(new FirebaseUploadError("Failed to parse Firebase response.", err))
        }
      } else {
        let detail = xhr.responseText || `HTTP ${xhr.status}`
        try {
          const parsed = JSON.parse(xhr.responseText)
          detail = parsed?.error?.message ?? detail
        } catch {
          /* ignore */
        }
        reject(
          new FirebaseUploadError(
            `Upload failed (${xhr.status}). ${detail}`,
          ),
        )
      }
    })

    xhr.addEventListener("error", () =>
      reject(new FirebaseUploadError("Network error while uploading to Firebase.")),
    )
    xhr.addEventListener("abort", () =>
      reject(new FirebaseUploadError("Upload was cancelled.")),
    )

    xhr.send(file)
  })
}
