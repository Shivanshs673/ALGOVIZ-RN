// Reads a local image URI into bytes — fetch works on iOS file://; base64 is the fallback.

async function readImageAsArrayBuffer(localUri: string): Promise<{ data: ArrayBuffer; contentType: string }> {
  const uri = localUri.startsWith('file://') || localUri.startsWith('content://')
    ? localUri
    : localUri;

  try {
    const response = await fetch(uri);
    if (!response.ok) throw new Error(`Could not read image (${response.status})`);
    const blob = await response.blob();
    const data = await blob.arrayBuffer();
    const contentType = blob.type && blob.type.startsWith('image/') ? blob.type : 'image/jpeg';
    if (data.byteLength === 0) throw new Error('Empty image file');
    return { data, contentType };
  } catch {
    const FileSystem = await import('expo-file-system/legacy');
    let readUri = uri;

    // iOS sometimes returns ph:// — copy into cache first
    if (uri.startsWith('ph://') || uri.startsWith('assets-library://')) {
      const dest = `${FileSystem.cacheDirectory}avatar-${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: uri, to: dest });
      readUri = dest;
    }

    const base64 = await FileSystem.readAsStringAsync(readUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (!base64) throw new Error('Could not read image from gallery');

    const { decode } = await import('base64-arraybuffer');
    return { data: decode(base64), contentType: 'image/jpeg' };
  }
}

function storagePathForUser(userId: string): string {
  return `profile_images/${userId}.jpg`;
}

function friendlyStorageError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('bucket') && lower.includes('not found')) {
    return 'Storage bucket "Algoviz" not found. Create it in Supabase Dashboard → Storage (see docs/08_SUPABASE_SETUP.md).';
  }
  if (lower.includes('row-level security') || lower.includes('policy') || lower.includes('403')) {
    return 'Storage permission denied. Run the avatar RLS policies in docs/08_SUPABASE_SETUP.md.';
  }
  if (lower.includes('payload too large') || lower.includes('413')) {
    return 'Image is too large. Try a smaller photo (max 5MB).';
  }
  return message;
}

export async function uploadProfileAvatar(
  userId: string,
  localUri: string,
  mimeType?: string | null,
): Promise<string> {
  const { supabase } = await import('../../../lib/supabase/client');

  const { data: imageBytes, contentType: detectedType } = await readImageAsArrayBuffer(localUri);
  const contentType =
    mimeType && mimeType.startsWith('image/') ? mimeType : detectedType;

  const storagePath = storagePathForUser(userId);

  // Remove old object first so upsert works even when UPDATE policy is strict
  await supabase.storage.from('Algoviz').remove([storagePath]);

  const { error: uploadErr } = await supabase.storage
    .from('Algoviz')
    .upload(storagePath, imageBytes, {
      contentType: contentType === 'image/jpg' ? 'image/jpeg' : contentType,
      upsert: true,
      cacheControl: '3600',
    });

  if (uploadErr) {
    throw new Error(friendlyStorageError(uploadErr.message));
  }

  const { data: urlData } = supabase.storage.from('Algoviz').getPublicUrl(storagePath);
  const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

  const { error: profileErr } = await supabase
    .from('user_profiles')
    .upsert(
      {
        user_id: userId,
        avatar_url: publicUrl,
        updated_at: Date.now(),
      },
      { onConflict: 'user_id' },
    );

  if (profileErr) {
    throw new Error(`Photo uploaded but profile update failed: ${profileErr.message}`);
  }

  return publicUrl;
}
