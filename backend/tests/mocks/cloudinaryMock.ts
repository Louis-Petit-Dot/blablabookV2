// Mock minimal de l'API Cloudinary v2 utilisé pour les tests
export const mockCloudinary = {
    uploader: {
        upload(_url: string, options?: Record<string, unknown>) {
            // Simuler un upload réussi en renvoyant une URL factice
            return { secure_url: `https://res.cloudinary.com/mock/image/upload/${options?.public_id ?? 'mock'}.webp` };
        },
        destroy(_publicId: string) {
            return { result: 'ok' };
        }
    },
    config(_opts: Record<string, unknown>) {
        // noop
    }
};

export default mockCloudinary;
