import { createFetchHttpClient, createLocalStorageAdapter, createRuntime, } from '@bdui/runtime';
import { createWebPlugin } from './plugin.js';
export function mount(container, contract, options = {}) {
    const storage = options.storage ?? createLocalStorageAdapter();
    const runtime = createRuntime({
        contract,
        storage,
        http: options.http ?? createFetchHttpClient(),
        validators: options.validators,
        prefetchScreens: options.prefetchScreens,
    });
    const plugin = createWebPlugin({
        urlSync: options.urlSync ?? !!contract.navigation.urlSync,
        contract,
    });
    runtime.use(plugin, container);
    return {
        runtime,
        dispose() {
            runtime.dispose();
            while (container.firstChild)
                container.removeChild(container.firstChild);
        },
    };
}
//# sourceMappingURL=mount.js.map