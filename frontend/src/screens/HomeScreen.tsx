import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  uploadVideoToBlob,
  getThumbnailUrl,
  saveThumbnailToGallery,
} from '../services/blobService';
import WebSocketService from '../services/websocket';
import {WS_URL} from '../services/config';
import styles from '../styles/HomeScreenStyles';

const HomeScreen: React.FC = () => {
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [blobPath, setBlobPath] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    WebSocketService.connect(WS_URL);

    const onMessage = (data: any) => {
      if (data.type === 'thumbnail_done') {
        const url = getThumbnailUrl(data.thumb_path);
        setThumbnailUrl(url);
        setLoading(false);
        setStatus('썸네일 생성 완료');
      } else if (data.type === 'thumbnail_error') {
        setLoading(false);
        setStatus('썸네일 생성 실패');
        Alert.alert('오류', data.error || '썸네일 생성에 실패했습니다.');
      }
    };

    WebSocketService.addListener(onMessage);

    return () => {
      WebSocketService.removeListener(onMessage);
      WebSocketService.disconnect();
    };
  }, []);

  const handleUpload = async (): Promise<void> => {
    const result = await launchImageLibrary({
      mediaType: 'video',
      selectionLimit: 1,
    });

    if (result.didCancel || !result.assets || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    const uri = asset.uri!;
    const name = asset.fileName || `video_${Date.now()}.mp4`;

    setVideoFileName(name);
    setThumbnailUrl(null);
    setBlobPath(null);
    setStatus('업로드 중...');
    setLoading(true);

    try {
      const path = await uploadVideoToBlob(uri, name);
      setBlobPath(path);
      setLoading(false);
      setStatus('업로드 완료');
    } catch (error) {
      setLoading(false);
      setStatus('업로드 실패');
      Alert.alert('오류', '동영상 업로드에 실패했습니다.');
    }
  };

  const handleGenerate = (): void => {
    if (!blobPath) {
      return;
    }
    setLoading(true);
    setStatus('썸네일 생성 중...');
    WebSocketService.sendMessage('enqueue', {path: blobPath});
  };

  const handleSave = async (): Promise<void> => {
    if (!thumbnailUrl) {
      return;
    }

    try {
      setLoading(true);
      setStatus('저장 중...');
      await saveThumbnailToGallery(thumbnailUrl);
      setLoading(false);
      setStatus('');
      Alert.alert('저장', '썸네일이 갤러리에 저장되었습니다.');
    } catch (error) {
      setLoading(false);
      setStatus('저장 실패');
      Alert.alert('오류', '썸네일 저장에 실패했습니다.');
    }
  };

  const handleCancel = (): void => {
    setVideoFileName('');
    setBlobPath(null);
    setThumbnailUrl(null);
    setLoading(false);
    setStatus('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>썸네일 생성기</Text>

      {/* 동영상 업로드 버튼 */}
      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
        <Text style={styles.uploadIcon}>+</Text>
        <Text style={styles.uploadText}>동영상 업로드</Text>
      </TouchableOpacity>

      {/* 동영상 선택 완료 표시 */}
      {videoFileName !== '' && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>선택된 동영상:</Text>
          <Text style={styles.fileName}>{videoFileName}</Text>
        </View>
      )}

      {/* 상태 표시 */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
      {status !== '' && <Text style={styles.statusText}>{status}</Text>}

      {/* 썸네일 제작 시작 버튼 */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.generateButton,
          !blobPath && styles.disabledButton,
        ]}
        onPress={handleGenerate}
        disabled={!blobPath}>
        <Text style={styles.buttonText}>썸네일 제작 시작</Text>
      </TouchableOpacity>

      {/* 썸네일 미리보기 */}
      {thumbnailUrl && (
        <View style={styles.thumbnailContainer}>
          <Text style={styles.previewTitle}>생성된 썸네일</Text>
          <Image
            source={{uri: thumbnailUrl}}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />

          {/* 저장 / 취소 버튼 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}>
              <Text style={styles.buttonText}>저장하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}>
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default HomeScreen;
