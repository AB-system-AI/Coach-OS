const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export function validateMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

export function validateFileSize(sizeBytes: number): boolean {
  return sizeBytes <= MAX_SIZE_BYTES;
}

export function validateFile(mimeType: string, sizeBytes: number): { valid: boolean; error?: string } {
  if (!validateMimeType(mimeType)) {
    return { valid: false, error: `File type "${mimeType}" is not allowed.` };
  }
  if (!validateFileSize(sizeBytes)) {
    return {
      valid: false,
      error: `File size ${(sizeBytes / 1024 / 1024).toFixed(1)} MB exceeds the 50 MB limit.`,
    };
  }
  return { valid: true };
}

export async function runVirusScanHook(
  fileUrl: string,
  fileName: string
): Promise<{ clean: boolean; message?: string }> {
  const webhookUrl = process.env.VIRUS_SCAN_WEBHOOK_URL;
  if (!webhookUrl) return { clean: true };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: fileUrl, name: fileName }),
    });
    if (!res.ok) return { clean: true };
    const data = await res.json();
    return { clean: data.clean !== false, message: data.message };
  } catch {
    return { clean: true };
  }
}

export const ALLOWED_MIME_TYPES_LIST = ALLOWED_MIME_TYPES;
export const MAX_FILE_SIZE_MB = MAX_SIZE_BYTES / 1024 / 1024;
