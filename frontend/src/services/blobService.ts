import ReactNativeBlobUtil from 'react-native-blob-util';
import {Platform, PermissionsAndroid} from 'react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {BLOB_BASE_URL, VIDEOS_CONTAINER} from './config';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { Buffer } from 'buffer';

global.Buffer = Buffer; // Required for mobile
const ACCOUNT = 'devstoreaccount1';
const ACCOUNT_KEY = 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==';

/**
 * 영상 파일을 Azurite Blob Storage에 업로드
 * @returns blob 경로 (e.g. "videos/my_video.mp4")
 */
export async function uploadVideoToBlob(
  fileUri: string,
  fileName: string,
): Promise<string> {

  const sharedKeyCredential = new StorageSharedKeyCredential(ACCOUNT, ACCOUNT_KEY);
  const blobServiceClient = new BlobServiceClient(
    BLOB_BASE_URL,
    sharedKeyCredential
  );

  const containerClient = blobServiceClient.getContainerClient(VIDEOS_CONTAINER);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  const filePath = fileUri.replace('file://', '');

  const base64Data = await ReactNativeBlobUtil.fs.readFile(filePath, 'base64');
  const buffer = Buffer.from(base64Data, 'base64');

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: 'video/mp4' },
  });

  return `${VIDEOS_CONTAINER}/${fileName}`;
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
