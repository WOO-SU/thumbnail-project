import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import styles from '../styles/HomeScreenStyles';

const HomeScreen: React.FC = () => {
  const [videoSelected, setVideoSelected] = useState<boolean>(false);
  const [thumbnailGenerated, setThumbnailGenerated] = useState<boolean>(false);

  const handleUpload = (): void => {
    // TODO: 백엔드 연결 시 동영상 업로드 로직
    setVideoSelected(true);
    setThumbnailGenerated(false);
  };

  const handleGenerate = (): void => {
    // TODO: 백엔드 연결 시 썸네일 생성 로직
    setThumbnailGenerated(true);
  };

  const handleSave = (): void => {
    // TODO: 백엔드 연결 시 저장 로직
    Alert.alert('저장', '썸네일이 저장되었습니다.');
  };

  const handleCancel = (): void => {
    setVideoSelected(false);
    setThumbnailGenerated(false);
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
      {videoSelected && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>선택된 동영상:</Text>
          <Text style={styles.fileName}>sample_video.mp4</Text>
        </View>
      )}

      {/* 썸네일 제작 시작 버튼 */}
      <TouchableOpacity
        style={[styles.button, styles.generateButton, !videoSelected && styles.disabledButton]}
        onPress={handleGenerate}
        disabled={!videoSelected}
      >
        <Text style={styles.buttonText}>썸네일 제작 시작</Text>
      </TouchableOpacity>

      {/* 썸네일 미리보기 */}
      {thumbnailGenerated && (
        <View style={styles.thumbnailContainer}>
          <Text style={styles.previewTitle}>생성된 썸네일</Text>
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.placeholderText}>썸네일 미리보기</Text>
          </View>

          {/* 저장 / 취소 버튼 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.buttonText}>저장하기</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default HomeScreen;