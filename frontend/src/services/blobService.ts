import ReactNativeBlobUtil from 'react-native-blob-util';
import {Platform, PermissionsAndroid} from 'react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {BLOB_BASE_URL, VIDEOS_CONTAINER} from './config';

/**
 * 영상 파일을 Azurite Blob Storage에 업로드
 * @returns blob 경로 (e.g. "videos/my_video.mp4")
 */
export async function uploadVideoToBlob(
  fileUri: string,
  fileName: string,
): Promise<string> {
  const blobPath = `${VIDEOS_CONTAINER}/${fileName}`;
  const putUrl = `${BLOB_BASE_URL}/${blobPath}`;

  // content:// URI를 실제 파일 경로로 변환
  const filePath = fileUri.startsWith('content://')
    ? (await ReactNativeBlobUtil.fs.stat(fileUri)).path
    : fileUri.replace('file://', '');

  await ReactNativeBlobUtil.fetch(
    'PUT',
    putUrl,
    {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': 'video/mp4',
      'x-ms-version': '2020-10-02',
    },
    ReactNativeBlobUtil.wrap(filePath),
  );

  return blobPath;
}

/**
 * thumb_path로 전체 Blob URL 생성
 * @param thumbPath 백엔드에서 받은 경로 (e.g. "thumbnails/thumbs/abc123.jpg")
 */
export function getThumbnailUrl(thumbPath: string): string {
  return `${BLOB_BASE_URL}/${thumbPath}`;
}

/**
 * 썸네일을 Blob에서 다운로드 후 갤러리에 저장
 */
export async function saveThumbnailToGallery(
  thumbnailUrl: string,
): Promise<void> {
  // Android 12 이하에서는 WRITE_EXTERNAL_STORAGE 권한 필요
  if (Platform.OS === 'android' && (Platform.Version as number) < 29) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('Storage permission denied');
    }
  }

  const res = await ReactNativeBlobUtil.config({
    fileCache: true,
    appendExt: 'jpg',
  }).fetch('GET', thumbnailUrl);

  const localPath = res.path();

  await CameraRoll.saveAsset(`file://${localPath}`, {type: 'photo'});

  // 임시 파일 정리
  res.flush();
}
