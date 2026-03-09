/**
 * Tests for MongoDB connection module (lib/db/mongodb.ts)
 */

// Mock mongoose before import
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockOn = jest.fn();

jest.mock('mongoose', () => {
    return {
        __esModule: true,
        default: {
            connect: mockConnect,
            disconnect: mockDisconnect,
            connection: {
                on: mockOn,
            },
        },
        connect: mockConnect,
        disconnect: mockDisconnect,
        connection: {
            on: mockOn,
        },
    };
});

describe('MongoDB Connection (dbConnect)', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        process.env = { ...ORIGINAL_ENV, MONGODB_URI: 'mongodb://localhost:27017/test' };
        // Reset global mongoose cache
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global as any).mongoose = undefined;
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
    });

    it('should throw when MONGODB_URI is not defined', () => {
        delete process.env.MONGODB_URI;
        // The module throws at import time when MONGODB_URI is missing
        expect(() => {
            jest.isolateModules(() => {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                require('@/lib/db/mongodb');
            });
        }).toThrow('Please define MONGODB_URI environment variable');
    });

    it('should call mongoose.connect with correct options', async () => {
        const mockMongoose = { connection: { on: jest.fn() } };
        mockConnect.mockResolvedValueOnce(mockMongoose);

        const { dbConnect } = await import('@/lib/db/mongodb');
        await dbConnect();

        expect(mockConnect).toHaveBeenCalledWith(
            'mongodb://localhost:27017/test',
            expect.objectContaining({
                bufferCommands: false,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            })
        );
    });

    it('should return cached connection on subsequent calls', async () => {
        const mockMongoose = { connection: { on: jest.fn() } };
        mockConnect.mockResolvedValueOnce(mockMongoose);

        const { dbConnect } = await import('@/lib/db/mongodb');
        const conn1 = await dbConnect();
        const conn2 = await dbConnect();

        expect(conn1).toBe(conn2);
        expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('should handle connection errors and reset cache', async () => {
        const connectionError = new Error('Connection failed');
        mockConnect.mockRejectedValueOnce(connectionError);
        mockDisconnect.mockResolvedValueOnce(undefined);

        const { dbConnect } = await import('@/lib/db/mongodb');

        await expect(dbConnect()).rejects.toThrow('Connection failed');
    });

    it('should register error and disconnect event handlers', async () => {
        const mockMongoose = { connection: { on: jest.fn() } };
        mockConnect.mockResolvedValueOnce(mockMongoose);

        const { dbConnect } = await import('@/lib/db/mongodb');
        await dbConnect();

        expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
        expect(mockOn).toHaveBeenCalledWith('disconnected', expect.any(Function));
    });
});
