// Android emulator routes 10.0.2.2 to host machine's localhost
const AZURITE_HOST = 'http://10.0.2.2:10000';
const ACCOUNT = 'devstoreaccount1';

export const BLOB_BASE_URL = `${AZURITE_HOST}/${ACCOUNT}`;
export const VIDEOS_CONTAINER = 'videos';
export const THUMBNAILS_CONTAINER = 'thumbnails';
