import { handleBatch, handleWhen } from './action-handlers/control.js';
import { handleCall, handleFetch } from './action-handlers/data.js';
import { handleModalClose, handleModalOpen, handlePrefetch, handleToast, } from './action-handlers/feedback.js';
import { handleFlowAbort, handleFlowAdvance, handleFlowComplete, handleFlowGoTo, handleFlowResume, handleFlowStart, } from './action-handlers/flow.js';
import { handleNavigate, handleReplace } from './action-handlers/navigation.js';
import { handleAppend, handleDec, handleInc, handleMapPath, handleMerge, handleReset, handleSet, handleSync, handleToggle, } from './action-handlers/state.js';
import { handleValidate } from './action-handlers/validate.js';
import { EventBus } from './events.js';
export function createActionRunner(deps) {
    const bus = new EventBus();
    const ctx = {
        ...deps,
        bus,
        run: (action) => run(action),
    };
    async function run(action) {
        try {
            switch (action.type) {
                case 'navigate':
                    await handleNavigate(ctx, action);
                    break;
                case 'replace':
                    handleReplace(ctx, action);
                    break;
                case 'back':
                    ctx.navigation.back();
                    bus.emit('routeDirty', {});
                    break;
                case 'popToRoot':
                    ctx.navigation.popToRoot();
                    bus.emit('routeDirty', {});
                    break;
                case 'set':
                    handleSet(ctx, action);
                    break;
                case 'reset':
                    handleReset(ctx, action);
                    break;
                case 'update.inc':
                    handleInc(ctx, action);
                    break;
                case 'update.dec':
                    handleDec(ctx, action);
                    break;
                case 'update.toggle':
                    handleToggle(ctx, action);
                    break;
                case 'update.append':
                    handleAppend(ctx, action);
                    break;
                case 'update.merge':
                    handleMerge(ctx, action);
                    break;
                case 'update.mapPath':
                    handleMapPath(ctx, action);
                    break;
                case 'sync':
                    handleSync(ctx, action);
                    break;
                case 'validate':
                    await handleValidate(ctx, action);
                    break;
                case 'fetch':
                    await handleFetch(ctx, action);
                    break;
                case 'call':
                    await handleCall(ctx, action);
                    break;
                case 'toast':
                    handleToast(ctx, action);
                    break;
                case 'modal.open':
                    handleModalOpen(ctx, action);
                    break;
                case 'modal.close':
                    handleModalClose(ctx, action);
                    break;
                case 'prefetchScreens':
                    await handlePrefetch(ctx, action);
                    break;
                case 'batch':
                    await handleBatch(ctx, action);
                    break;
                case 'when':
                    await handleWhen(ctx, action);
                    break;
                case 'flow.start':
                    handleFlowStart(ctx, action);
                    break;
                case 'flow.advance':
                    handleFlowAdvance(ctx, action);
                    break;
                case 'flow.goTo':
                    handleFlowGoTo(ctx, action);
                    break;
                case 'flow.resume':
                    handleFlowResume(ctx, action);
                    break;
                case 'flow.abort':
                    handleFlowAbort(ctx, action);
                    break;
                case 'flow.complete':
                    handleFlowComplete(ctx, action);
                    break;
                default: {
                    const exhaustive = action;
                    throw new Error(`Unknown action type: ${exhaustive.type}`);
                }
            }
            bus.emit('executed', { action });
        }
        catch (error) {
            bus.emit('error', { action, error });
        }
    }
    return {
        run,
        async runAll(actions) {
            if (!actions || actions.length === 0)
                return;
            for (const action of actions)
                await run(action);
        },
        on(event, listener) {
            return bus.on(event, listener);
        },
    };
}
//# sourceMappingURL=actions.js.map