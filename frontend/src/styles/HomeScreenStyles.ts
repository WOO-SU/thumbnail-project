import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  uploadButton: {
    width: '100%',
    height: 120,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  uploadIcon: {
    fontSize: 36,
    color: '#007AFF',
    fontWeight: '300',
  },
  uploadText: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 8,
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 5,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#34C759',
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    flex: 1,
    marginLeft: 10,
  },
  thumbnailContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
});

export default styles;