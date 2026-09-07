import PocketBase from 'pocketbase';

const runtimePocketbaseUrl =
    import.meta.env.SSR && typeof process !== 'undefined'
        ? process.env.PUBLIC_POCKETBASE_URL
        : undefined;

export const pocketbaseUrl =
    runtimePocketbaseUrl ?? import.meta.env.PUBLIC_POCKETBASE_URL ?? 'http://127.0.0.1:8090';

export const pb = new PocketBase(pocketbaseUrl);

pb.autoCancellation(false);
