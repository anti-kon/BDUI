import { createActionRunner } from './actions.js';
import { createFlowController } from './flow.js';
import { createModalController } from './modal.js';
import { createNavigationController } from './navigation.js';
import { createRuntimeStateController } from './state.js';
import { MemoryStorageAdapter } from './storage.js';
import { createToastController } from './toast.js';
export function createRuntime(options) {
    const storage = options.storage ?? new MemoryStorageAdapter();
    const state = createRuntimeStateController({ contract: options.contract, storage });
    const navigation = createNavigationController(options.contract.navigation);
    const toast = createToastController();
    const modal = createModalController();
    const flow = createFlowController(state);
    const actions = createActionRunner({
        contract: options.contract,
        state,
        navigation,
        flow,
        toast,
        modal,
        http: options.http,
        validators: options.validators,
        prefetchScreens: options.prefetchScreens,
    });
    const plugins = [];
    function runActions(raw) {
        return actions.runAll(raw);
    }
    return {
        contract: options.contract,
        state,
        navigation,
        toast,
        modal,
        flow,
        actions,
        use(plugin, root) {
            plugin.mount(root, {
                state,
                navigation,
                toast,
                modal,
                runActions,
            });
            plugins.push({
                plugin: plugin,
                dispose: () => plugin.unmount?.(),
            });
        },
        dispose() {
            for (const { dispose } of plugins) {
                try {
                    dispose();
                }
                catch {
                    /* ignore */
                }
            }
            plugins.length = 0;
        },
    };
}
//# sourceMappingURL=runtime.js.map