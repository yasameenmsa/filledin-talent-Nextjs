export const storageConfig = {
    // Root directory for private files (CVs, etc.)
    privateRoot: process.env.STORAGE_PRIVATE_ROOT || 'storage/uploads',

    // Root directory for public files (Images, Logos)
    // Note: This must be inside the 'public' folder to be served statically
    publicRoot: process.env.STORAGE_PUBLIC_ROOT || 'public/storage/uploads',

    // URL prefix for public files
    // This should match the folder structure inside 'public'
    // e.g. if publicRoot is 'public/storage/uploads', the URL prefix is '/storage/uploads'
    publicUrlPrefix: (process.env.STORAGE_PUBLIC_ROOT || 'public/storage/uploads').replace(/^public\//, '/'),
};
