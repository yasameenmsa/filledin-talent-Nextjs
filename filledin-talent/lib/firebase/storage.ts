import { ref, uploadBytes, getDownloadURL, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { storage } from './firebaseConfig';

// Upload file
export async function uploadFile(file: File): Promise<string> {
  const storageRef = ref(storage, `uploads/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  console.log('File uploaded successfully!');
  const downloadURL = await getDownloadURL(snapshot.ref);
  console.log('File available at:', downloadURL);
  return downloadURL;
}

// Upload file with progress tracking
export function uploadWithProgress(file: File, onProgress: (progress: number) => void): void {
  const storageRef = ref(storage, `uploads/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(progress);
    }, 
    (error) => {
      console.error('Upload failed:', error);
    }, 
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        console.log('File available at:', downloadURL);
      });
    }
  );
}

// Download file
export async function downloadFile(filePath: string): Promise<void> {
  const storageRef = ref(storage, filePath);
  const url = await getDownloadURL(storageRef);
  window.open(url, '_blank');
}

// Delete file
export async function deleteFile(filePath: string): Promise<void> {
  const storageRef = ref(storage, filePath);
  await deleteObject(storageRef);
  console.log('File deleted successfully');
}