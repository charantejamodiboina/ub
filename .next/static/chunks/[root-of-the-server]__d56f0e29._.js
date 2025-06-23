(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_context__.s({
    "connect": (()=>connect),
    "setHooks": (()=>setHooks),
    "subscribeToUpdate": (()=>subscribeToUpdate)
});
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case "turbopack-connected":
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn("[Fast Refresh] performing full reload\n\n" + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + "You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n" + "Consider migrating the non-React component export to a separate file and importing it into both files.\n\n" + "It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n" + "Fast Refresh requires at least one parent function component in your React tree.");
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error("A separate HMR handler was already registered");
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: "turbopack-subscribe",
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: "turbopack-unsubscribe",
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: "ChunkListUpdate",
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === "added" && updateB.type === "deleted" || updateA.type === "deleted" && updateB.type === "added") {
        return undefined;
    }
    if (updateA.type === "partial") {
        invariant(updateA.instruction, "Partial updates are unsupported");
    }
    if (updateB.type === "partial") {
        invariant(updateB.instruction, "Partial updates are unsupported");
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: "EcmascriptMergedUpdate",
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === "added" && updateB.type === "deleted") {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === "deleted" && updateB.type === "added") {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: "partial",
            added,
            deleted
        };
    }
    if (updateA.type === "partial" && updateB.type === "partial") {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: "partial",
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === "added" && updateB.type === "partial") {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: "added",
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === "partial" && updateB.type === "deleted") {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: "deleted",
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    "bug",
    "error",
    "fatal"
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    "bug",
    "fatal",
    "error",
    "warning",
    "info",
    "log"
];
const CATEGORY_ORDER = [
    "parse",
    "resolve",
    "code generation",
    "rendering",
    "typescript",
    "other"
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case "issues":
            break;
        case "partial":
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === "notFound") {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}}),
"[next]/internal/font/google/geist_b6f6e40c.module.css [client] (css module)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v({
  "className": "geist_b6f6e40c-module__vpxWEq__className",
  "variable": "geist_b6f6e40c-module__vpxWEq__variable",
});
}}),
"[next]/internal/font/google/geist_b6f6e40c.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_b6f6e40c$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[next]/internal/font/google/geist_b6f6e40c.module.css [client] (css module)");
;
const fontData = {
    className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_b6f6e40c$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].className,
    style: {
        fontFamily: "'Geist', 'Geist Fallback'",
        fontStyle: "normal"
    }
};
if (__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_b6f6e40c$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].variable != null) {
    fontData.variable = __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_b6f6e40c$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].variable;
}
const __TURBOPACK__default__export__ = fontData;
}}),
"[next]/internal/font/google/geist_mono_5fbb1682.module.css [client] (css module)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v({
  "className": "geist_mono_5fbb1682-module__p_K62q__className",
  "variable": "geist_mono_5fbb1682-module__p_K62q__variable",
});
}}),
"[next]/internal/font/google/geist_mono_5fbb1682.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_mono_5fbb1682$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[next]/internal/font/google/geist_mono_5fbb1682.module.css [client] (css module)");
;
const fontData = {
    className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_mono_5fbb1682$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].className,
    style: {
        fontFamily: "'Geist Mono', 'Geist Mono Fallback'",
        fontStyle: "normal"
    }
};
if (__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_mono_5fbb1682$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].variable != null) {
    fontData.variable = __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_mono_5fbb1682$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].variable;
}
const __TURBOPACK__default__export__ = fontData;
}}),
"[project]/src/styles/Home.module.css [client] (css module)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v({
  "galleryimage": "Home-module__Ho9lYW__galleryimage",
  "main": "Home-module__Ho9lYW__main",
  "page": "Home-module__Ho9lYW__page",
});
}}),
"[project]/src/assets/Layer_1.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/Layer_1.01b34d66.png");}}),
"[project]/src/assets/Layer_1.png.mjs { IMAGE => \"[project]/src/assets/Layer_1.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$Layer_1$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/Layer_1.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$Layer_1$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 91,
    height: 70,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAYAAAD+Bd/7AAAAxUlEQVR42hWNvwuCQBzFDwqFqIYmoYZqaGiIgqYgoh9GUoaWGCcdqDeI5uIdJxhdq0PU39zXB296n/ceUhSlpqpqXdO0zvl0WJ2XPWO6H+H2pLtotpoN5HnejlJqZlmGf9+PeBWcMs4Iewoq35IiKSX1fd/QdX0O0C2KIksIcS+KwofyGnHOcZqmdpIk18oAH4MgMMqyfIBs5LruhjHmAUgsy1oBfKkWob2FbIvCMBzleT4zTXPgOE4frnoY43Ecx31CyPAPen9APV2cWb8AAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 6
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/Components/Header.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Header)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$Layer_1$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$Layer_1$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/Layer_1.png.mjs { IMAGE => "[project]/src/assets/Layer_1.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$gi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/gi/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$io$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/io/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function Header() {
    _s();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [activeLink, setActiveLink] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("#home");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Header.useEffect": ()=>{
            document.body.style.overflow = isOpen ? "hidden" : "auto";
        }
    }["Header.useEffect"], [
        isOpen
    ]);
    const closeMenu = ()=>setIsOpen(false);
    const handleLinkClick = (section)=>{
        setActiveLink(section);
        closeMenu();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "py-3 my-5 px-3 px-lg-5 Navbar",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "d-lg-none position-relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                            src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$Layer_1$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$Layer_1$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                            alt: "logo",
                            height: 69.35,
                            width: 91,
                            priority: true,
                            className: "mx-auto mt-5"
                        }, void 0, false, {
                            fileName: "[project]/src/Components/Header.js",
                            lineNumber: 30,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/Components/Header.js",
                        lineNumber: 29,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "position-absolute top-0 end-0 mt-2 me-3",
                        children: !isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "btn text-white fs-3",
                            onClick: ()=>setIsOpen(true),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$gi$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["GiHamburgerMenu"], {}, void 0, false, {
                                fileName: "[project]/src/Components/Header.js",
                                lineNumber: 43,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/Components/Header.js",
                            lineNumber: 42,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/Components/Header.js",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/Components/Header.js",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "d-none d-lg-flex justify-content-start align-items-center Navbar1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                        src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$Layer_1$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$Layer_1$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                        alt: "logo",
                        height: 69.35,
                        width: 91,
                        priority: true
                    }, void 0, false, {
                        fileName: "[project]/src/Components/Header.js",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "d-flex gap-5",
                        children: [
                            "#home",
                            "#floor-plans",
                            "#amenities",
                            "#contact-us"
                        ].map((section)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: section,
                                className: `nav-link fw-medium ${activeLink === section ? "text-warning" : "text-light"}`,
                                onClick: ()=>handleLinkClick(section),
                                children: section.replace("#", "").replace("-", " ").replace(/\b\w/g, (c)=>c.toUpperCase())
                            }, section, false, {
                                fileName: "[project]/src/Components/Header.js",
                                lineNumber: 54,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/Components/Header.js",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/Components/Header.js",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "position-fixed top-0 start-0 w-100 h-100 bg-white p-4",
                style: {
                    zIndex: 1050
                },
                onClick: closeMenu,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "position-absolute top-0 end-0 mt-3 me-3",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "btn fs-3 text-dark",
                            onClick: closeMenu,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$io$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["IoMdClose"], {}, void 0, false, {
                                fileName: "[project]/src/Components/Header.js",
                                lineNumber: 78,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/Components/Header.js",
                            lineNumber: 77,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/Components/Header.js",
                        lineNumber: 76,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "d-flex flex-column gap-4 mt-5 pt-5",
                        onClick: (e)=>e.stopPropagation(),
                        children: [
                            "#home",
                            "#floor-plans",
                            "#amenities",
                            "#contact-us"
                        ].map((section)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: section,
                                className: `nav-link fs-5 ${activeLink === section ? "text-warning" : "text-dark"}`,
                                onClick: ()=>handleLinkClick(section),
                                children: section.replace("#", "").replace("-", " ").replace(/\b\w/g, (c)=>c.toUpperCase())
                            }, section, false, {
                                fileName: "[project]/src/Components/Header.js",
                                lineNumber: 85,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/Components/Header.js",
                        lineNumber: 83,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/Components/Header.js",
                lineNumber: 70,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/Components/Header.js",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_s(Header, "fIIuT4BSfZbGEnYJeDJWWqQFyng=");
_c = Header;
var _c;
__turbopack_context__.k.register(_c, "Header");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/Components/Intro.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Intro)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-responsive/dist/esm/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$datepicker$2f$dist$2f$index$2e$es$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-datepicker/dist/index.es.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/fa/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function Intro() {
    _s();
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [phone, setPhone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [date, setDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null); // Date object
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("");
    const isMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"])({
        query: "(max-width: 991px)"
    });
    const handleSubmit = async (e)=>{
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("phone", phone);
            formData.append("message", "Schedule Date is: " + (date ? date.toLocaleDateString() : ""));
            formData.append("email", email);
            formData.append("property", "Urban Ranch");
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].post("https://irarealty.in/cms/api/submitContact", formData);
            alert("Submitted successfully!");
            setName("");
            setPhone("");
            setDate(null);
            setEmail("");
        } catch (error) {
            console.error("Submission error", error);
            alert("Something went wrong. Please try again.");
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "container my-5 ps-lg-5 align-items-center",
        id: "home",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "row align-items-center g-5 ps-lg-5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "col-lg-6 text-white text-center text-lg-start",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "font-seasons intro_h",
                            children: isMobile ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    "4BHK",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/Components/Intro.js",
                                        lineNumber: 49,
                                        columnNumber: 21
                                    }, this),
                                    "Gated Villa",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/Components/Intro.js",
                                        lineNumber: 49,
                                        columnNumber: 38
                                    }, this),
                                    "Community in",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/Components/Intro.js",
                                        lineNumber: 49,
                                        columnNumber: 56
                                    }, this),
                                    "Adibatla"
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    "4BHK Gated",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/Components/Intro.js",
                                        lineNumber: 53,
                                        columnNumber: 27
                                    }, this),
                                    "Villa Community in",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/Components/Intro.js",
                                        lineNumber: 53,
                                        columnNumber: 51
                                    }, this),
                                    "Adibatla"
                                ]
                            }, void 0, true)
                        }, void 0, false, {
                            fileName: "[project]/src/Components/Intro.js",
                            lineNumber: 46,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "lead",
                            style: {
                                fontFamily: "'Nunito Sans', sans-serif"
                            },
                            children: isMobile ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    "Experience 17 acres of ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/Components/Intro.js",
                                        lineNumber: 60,
                                        columnNumber: 40
                                    }, this),
                                    " gated community ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/Components/Intro.js",
                                        lineNumber: 60,
                                        columnNumber: 63
                                    }, this),
                                    " living at Urban Ranch"
                                ]
                            }, void 0, true) : "Experience 17 acres of gated community living at Urban Ranch"
                        }, void 0, false, {
                            fileName: "[project]/src/Components/Intro.js",
                            lineNumber: 57,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "btn fw-bold px-4 py-2 mt-3",
                            style: {
                                color: "var(--active_nav_item)",
                                backgroundColor: "white"
                            },
                            children: "Download Brochure"
                        }, void 0, false, {
                            fileName: "[project]/src/Components/Intro.js",
                            lineNumber: 66,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/Components/Intro.js",
                    lineNumber: 45,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "col-lg-6 d-flex justify-content-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "introForm bg-white shadow p-4 p-lg-5 d-flex flex-column justify-content-between w-100",
                        style: {
                            maxWidth: 400,
                            maxHeight: "fit-content"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-center text-dark form-heading",
                                children: "Unlock Early Access"
                            }, void 0, false, {
                                fileName: "[project]/src/Components/Intro.js",
                                lineNumber: 78,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: handleSubmit,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "row g-3 mb-3 mt-3 mt-lg-4 ",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "col-6 ",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    className: "form-control introinput",
                                                    placeholder: "Name",
                                                    value: name,
                                                    onChange: (e)=>setName(e.target.value),
                                                    required: true
                                                }, void 0, false, {
                                                    fileName: "[project]/src/Components/Intro.js",
                                                    lineNumber: 82,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/Components/Intro.js",
                                                lineNumber: 81,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "col-6",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "tel",
                                                    className: "form-control introinput",
                                                    placeholder: "Mobile Number",
                                                    value: phone,
                                                    onChange: (e)=>setPhone(e.target.value),
                                                    required: true
                                                }, void 0, false, {
                                                    fileName: "[project]/src/Components/Intro.js",
                                                    lineNumber: 92,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/Components/Intro.js",
                                                lineNumber: 91,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/Components/Intro.js",
                                        lineNumber: 80,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-3 position-relative",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$datepicker$2f$dist$2f$index$2e$es$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                selected: date,
                                                onChange: (date)=>setDate(date),
                                                className: "form-control introinput",
                                                placeholderText: "Select date",
                                                dateFormat: "dd/MM/yyyy",
                                                required: true
                                            }, void 0, false, {
                                                fileName: "[project]/src/Components/Intro.js",
                                                lineNumber: 104,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["FaCalendarAlt"], {
                                                className: "calendar-icon"
                                            }, void 0, false, {
                                                fileName: "[project]/src/Components/Intro.js",
                                                lineNumber: 112,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/Components/Intro.js",
                                        lineNumber: 103,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "email",
                                            className: "form-control introinput",
                                            placeholder: "Email ID",
                                            value: email,
                                            onChange: (e)=>setEmail(e.target.value),
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/Intro.js",
                                            lineNumber: 116,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/Components/Intro.js",
                                        lineNumber: 115,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        className: "btn w-100 introFbtn",
                                        style: {
                                            backgroundColor: "var(--active_nav_item)",
                                            color: "white"
                                        },
                                        children: "Book a visit"
                                    }, void 0, false, {
                                        fileName: "[project]/src/Components/Intro.js",
                                        lineNumber: 126,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/Components/Intro.js",
                                lineNumber: 79,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/Components/Intro.js",
                        lineNumber: 76,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/Components/Intro.js",
                    lineNumber: 75,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/Components/Intro.js",
            lineNumber: 43,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/Components/Intro.js",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_s(Intro, "p8hICJBszdF5oVggc5nNR+vCANM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"]
    ];
});
_c = Intro;
var _c;
__turbopack_context__.k.register(_c, "Intro");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/Components/style.module.css [client] (css module)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v({
  "smartliving_p": "style-module__pfj9SG__smartliving_p",
});
}}),
"[project]/src/Components/Home.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>HomePage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$Header$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Components/Header.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$Intro$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Components/Intro.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$style$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/Components/style.module.css [client] (css module)");
;
;
;
;
function HomePage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$style$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].sharedBackground,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$Intro$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/Components/Home.js",
                lineNumber: 11,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/Components/Home.js",
            lineNumber: 10,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/Components/Home.js",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
_c = HomePage;
var _c;
__turbopack_context__.k.register(_c, "HomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/c7.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/c7.0d98091b.png");}}),
"[project]/src/assets/c7.png.mjs { IMAGE => \"[project]/src/assets/c7.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c7$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/c7.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c7$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 519,
    height: 767,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAICAYAAAAx8TU7AAAArElEQVR42gWAScsBYQCA35/xXb6DcpWUJWQr4qDGkgyZGGJIg0iGkBhluZLlyFXKwd+bR8Lt+rOCvn+kXJjR4cH8/LVE2zDRZyaLw43d5YV5vCNW2yVGv8NALbObj9nMpohqwU5TjlBMhthPNN6PG6KcdtBRUky7NU7rIZ/nFZGJOlAkP3q1gF6TaZUyiHrOyVBNEAt4CHk9SPEwopK3WSMtQL+RpafKGJpi/QA7AFcSJUGfLwAAAABJRU5ErkJggg==",
    blurWidth: 5,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/specicons/area.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/area.c3e61b85.png");}}),
"[project]/src/assets/specicons/area.png.mjs { IMAGE => \"[project]/src/assets/specicons/area.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$area$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/specicons/area.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$area$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 61,
    height: 61,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAo0lEQVR42l2PvQrCQBCErxVExJ9KDIJPYCPpFBUxisREjSAX0YCNELCQYKGN4HvlwZTROciRS7EwsN/s7Ag7jFLLl9+Wu0d+2p78cCcoSsMlsqlMVuhFF3SDI2gUpPNAcx5g93pjdE3UJQOozzYYxDd01gfU/loD5bGLhrNVS8uT2qCB/jnG4v5kphGnAD5CwEkeqE59A2ABwSoUxZo02uEp/QG2JHC/3+OlqwAAAABJRU5ErkJggg==",
    blurWidth: 8,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/specicons/location.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/location.b439bbc2.png");}}),
"[project]/src/assets/specicons/location.png.mjs { IMAGE => \"[project]/src/assets/specicons/location.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$location$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/specicons/location.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$location$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 61,
    height: 61,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAsklEQVR42l2PXwvBYBTG3zv5Exdy4WLuXLtZtiJsDVEbk1BcUGKxjE0yn84Hsx7vefO2cvHU6ZzfOZ0fy6jdd7ZnJzz4y4dmjApq1NwNWqcbdC9A1V5JKCEA5dEcVvjEIIpFzOsDRcsVkACU6RrD+wvNwwXtc8jrGJXxIgVK/ZnYIkA7Buj4EQrmJAUo9eUO6t6HzgGF/yP7TBrkTQcav9DYesgZqQn7aQqTnOGISAOafQERWG6Eb0Z82gAAAABJRU5ErkJggg==",
    blurWidth: 8,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/specicons/type.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/type.62fb0f47.png");}}),
"[project]/src/assets/specicons/type.png.mjs { IMAGE => \"[project]/src/assets/specicons/type.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$type$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/specicons/type.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$type$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 61,
    height: 61,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAvklEQVR42m2PXQvBcBjFdye3XFuJQiGyCy405YJdSNYQ7cXasmF5yaTsglISX8oH2zr2/6cpuTj19Dy/83QOE+P4V7zVC0LhRz65MWRIdCWwoozMaIbsWEdaUpEMd8RIABSVOYbnK/reBdr9CeX2QEVf0E8UKGs2hIMHznTQdPZo746o6ssvkJ+aqFsbCvBrl87EFAGFEOi4J9SMFRr2FiXVQm5iREBAQw5kpEKRgKyoICnQkD7zqen/qRmQ2xvAd3HqKeEBQgAAAABJRU5ErkJggg==",
    blurWidth: 8,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/specicons/totalvillas.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/totalvillas.0d6bf6fa.png");}}),
"[project]/src/assets/specicons/totalvillas.png.mjs { IMAGE => \"[project]/src/assets/specicons/totalvillas.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$totalvillas$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/specicons/totalvillas.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$totalvillas$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 61,
    height: 61,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAqklEQVR42m3PXQsBQRQG4L2TLSkXFPn4A1xJmywmyQWLbYuSjysNoRH5f37YTq9zJrNJe3FqmvN0znucTHvwzg4DTYW/irnn8MN+5schcqPlL9IM4IoAtXCL3uWB7vmO0mydIAMa0Q7eSaEwiVCcruATtMiA8mKD5l7Ckwqtg0TneDM4Aax5tFAv9K9P+FScxwLNweq0pkKTqpSF87hibi5xvmfGKWdq7n0A1pVr1wqgvRkAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/specicons/plotarea.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/plotarea.4c730fb5.png");}}),
"[project]/src/assets/specicons/plotarea.png.mjs { IMAGE => \"[project]/src/assets/specicons/plotarea.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$plotarea$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/specicons/plotarea.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$plotarea$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 61,
    height: 61,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAArUlEQVR42m2P3wvBUBTH75uMlBIhXmRPysuePJghD9jWFNtEzZKskIf9gf6we/u6925ukodv58f3c07nkIJhvooTm3HhR1R4RCTfRslyUF1soPEoBsnHqK98dL0DBscLzEeKDs9FXwKVuYdhlMA43zC+pxglTwkroLbcoumEEuwHJ+hBjBavFdBY+9DDGL1dxDddORSj7e4VwDTLRnnqZpplMT+SkvxN+udNJrw3YjhqHxHlh9AAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/specicons/villaarea.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/villaarea.4ea0479f.png");}}),
"[project]/src/assets/specicons/villaarea.png.mjs { IMAGE => \"[project]/src/assets/specicons/villaarea.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$villaarea$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/specicons/villaarea.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$villaarea$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 61,
    height: 61,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAArUlEQVR42m2POQvCQBSE04mtYgQlGpVYWygoFlqK9xF345W4gniARP+hPyzLuG9RFEkx8GC+N8MYiXrnmeyOpBL+FJFn0GFNNyi5AcwBU+JwuEB2yAmSBKC8DNA632G7vjabpxD5yVonaSDTZ7AXPhrHG2riguJ8h1TP/QIU7XhCm6QK2yP9C1S9g6oI9SeZ7esDBXV/AJkbr2DNtjqWPqnOVLU0wHjPjGJmSvJexlJssOxoMiQAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/specicons/structure.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/structure.fcfcb6ff.png");}}),
"[project]/src/assets/specicons/structure.png.mjs { IMAGE => \"[project]/src/assets/specicons/structure.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$structure$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/specicons/structure.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$structure$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 61,
    height: 61,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAqklEQVR42m2POQvCQBSEtxOPKlG8sBUUbMTOwgMhHomLeEUNFkER0imCEhD/mj9sl3F3SUyQFAOPNx/z3pBUp/dJ9y0uhD8x6RE5hMvMYK4Ug7gEkBtS1BYOms4ZjcMJVbr/gQoomTa63hWF6QYVYcpZH68ioGztQP23SqnbLmaPF/KTdQQUzS2Mu4/W8YK262F0e0KLJfCsuCcXeiDNWIY/MBLUZAk1ufS+iY5rIZf8gPUAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/specicons/clubhouse.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/clubhouse.5e95ed0c.png");}}),
"[project]/src/assets/specicons/clubhouse.png.mjs { IMAGE => \"[project]/src/assets/specicons/clubhouse.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$clubhouse$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/specicons/clubhouse.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$clubhouse$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 61,
    height: 61,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAoUlEQVR42m2PuwrCMBiFs4mliIODizg4CY6iY5oqgmi9FApCKS5epkaHWl36bj6Y4dj8bSiUDgdOcr5/+Fhryr9tx1N5UMtPb0yXhtFEMfOwxA6DY4hRcKZu/gnoLA8Yhxc48gX3mWIS3dBd+RXQ907YvDMCeJxg+8kw9KMK6K0DzK4xuEwgHinmd0lHBiAD293DXpTJuyUKE1ZqNpkovf0BjxVrU12VR64AAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/Components/VillaSpecs.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>VillaSpecs)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c7$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$c7$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/c7.png.mjs { IMAGE => "[project]/src/assets/c7.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$area$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$specicons$2f$area$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/specicons/area.png.mjs { IMAGE => "[project]/src/assets/specicons/area.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$location$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$specicons$2f$location$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/specicons/location.png.mjs { IMAGE => "[project]/src/assets/specicons/location.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$type$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$specicons$2f$type$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/specicons/type.png.mjs { IMAGE => "[project]/src/assets/specicons/type.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$totalvillas$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$specicons$2f$totalvillas$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/specicons/totalvillas.png.mjs { IMAGE => "[project]/src/assets/specicons/totalvillas.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$plotarea$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$specicons$2f$plotarea$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/specicons/plotarea.png.mjs { IMAGE => "[project]/src/assets/specicons/plotarea.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$villaarea$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$specicons$2f$villaarea$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/specicons/villaarea.png.mjs { IMAGE => "[project]/src/assets/specicons/villaarea.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$structure$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$specicons$2f$structure$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/specicons/structure.png.mjs { IMAGE => "[project]/src/assets/specicons/structure.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$clubhouse$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$specicons$2f$clubhouse$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/specicons/clubhouse.png.mjs { IMAGE => "[project]/src/assets/specicons/clubhouse.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-responsive/dist/esm/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
;
;
function VillaSpecs() {
    _s();
    const isMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"])({
        query: '(max-width: 768px)'
    });
    const data = [
        {
            id: 1,
            name: "Area",
            value: "17 acres",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$area$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$specicons$2f$area$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"]
        },
        {
            id: 2,
            name: "Location",
            value: "Kongarakalan",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$location$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$specicons$2f$location$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"]
        },
        {
            id: 3,
            name: "Type",
            value: "4BHK Villas",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$type$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$specicons$2f$type$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"]
        },
        {
            id: 4,
            name: "Total villas",
            value: "163",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$totalvillas$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$specicons$2f$totalvillas$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"]
        },
        {
            id: 5,
            name: "Plot area",
            value: "298-351 Sq. Yds",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$plotarea$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$specicons$2f$plotarea$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"]
        },
        {
            id: 6,
            name: "Villa area",
            value: "3,718-4,711 Sq. Ft",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$villaarea$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$specicons$2f$villaarea$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"]
        },
        {
            id: 7,
            name: "Structure",
            value: "G+2",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$structure$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$specicons$2f$structure$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"]
        },
        {
            id: 8,
            name: "Clubhouse",
            value: "20500 SFT",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$specicons$2f$clubhouse$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$specicons$2f$clubhouse$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"]
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "container py-5",
        id: "villa-specs",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-start mb-4 Title",
                children: "Villa Specifications"
            }, void 0, false, {
                fileName: "[project]/src/Components/VillaSpecs.js",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "row align-items-start",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "col-lg-7 d-flex flex-column gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "fw-bold mb-3 Heading",
                                children: [
                                    "Designed for Comfort, ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/Components/VillaSpecs.js",
                                        lineNumber: 32,
                                        columnNumber: 35
                                    }, this),
                                    " Built with Intention"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/Components/VillaSpecs.js",
                                lineNumber: 31,
                                columnNumber: 11
                            }, this),
                            isMobile ? null : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: " villadesc",
                                children: "Searching for 4 BHK villas for sale in Hyderabad that feel spacious and soulful? Look no further."
                            }, void 0, false, {
                                fileName: "[project]/src/Components/VillaSpecs.js",
                                lineNumber: 34,
                                columnNumber: 28
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "row gx-3 gy-4",
                                children: data.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-6",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "d-flex align-items-center p-3 villacont",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                    src: item.icon,
                                                    alt: `${item.name} icon`,
                                                    className: "me-3 villaicon"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/Components/VillaSpecs.js",
                                                    lineNumber: 42,
                                                    columnNumber: 9
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h6", {
                                                            className: "mb-1 villaspecshead",
                                                            children: item.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/Components/VillaSpecs.js",
                                                            lineNumber: 48,
                                                            columnNumber: 11
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "mb-0 villaspecdetail",
                                                            children: item.value
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/Components/VillaSpecs.js",
                                                            lineNumber: 49,
                                                            columnNumber: 11
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/Components/VillaSpecs.js",
                                                    lineNumber: 47,
                                                    columnNumber: 9
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/Components/VillaSpecs.js",
                                            lineNumber: 41,
                                            columnNumber: 7
                                        }, this)
                                    }, item.id, false, {
                                        fileName: "[project]/src/Components/VillaSpecs.js",
                                        lineNumber: 40,
                                        columnNumber: 5
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/Components/VillaSpecs.js",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/Components/VillaSpecs.js",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "col-lg-5 position-relative d-flex align-items-center justify-content-center ",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                            src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c7$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$c7$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                            alt: "Villa Image",
                            className: "img-fluid rounded",
                            style: {
                                objectFit: "contain"
                            },
                            priority: true
                        }, void 0, false, {
                            fileName: "[project]/src/Components/VillaSpecs.js",
                            lineNumber: 59,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/Components/VillaSpecs.js",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/Components/VillaSpecs.js",
                lineNumber: 29,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/Components/VillaSpecs.js",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_s(VillaSpecs, "7khsyUHgctuHIPa2/KlDS6LcnT0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"]
    ];
});
_c = VillaSpecs;
var _c;
__turbopack_context__.k.register(_c, "VillaSpecs");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/c3.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/c3.4e503f2b.png");}}),
"[project]/src/assets/c3.png.mjs { IMAGE => \"[project]/src/assets/c3.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c3$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/c3.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c3$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 1233,
    height: 605,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAECAYAAACzzX7wAAAAhElEQVR42g3DTQ+BYADA8efjOBaW1aEtNBU168K0LG/DyMtqPWbacGj40n8dfmJbVMQHyTKVnIoXefklqx3lm/kuR9iBz/2WkaZ7zpcrn+pH+XiSrDZMZlOEZnRYLyKSOGboegxGYxTDQDN1WnoTobY1zK6HH0SEfkjPdtCtPpbr0FBU/vVkQaBBA6DdAAAAAElFTkSuQmCC",
    blurWidth: 8,
    blurHeight: 4
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/mask1.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/mask1.34f5df74.png");}}),
"[project]/src/assets/mask1.png.mjs { IMAGE => \"[project]/src/assets/mask1.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$mask1$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/mask1.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$mask1$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 1440,
    height: 518,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAADCAYAAACuyE5IAAAAJ0lEQVR42pXKoQ0AAAgDwaoiKkDA/qsSfA3ikxeHTuqaCrnHA9CCBfbRBPJLz2YIAAAAAElFTkSuQmCC",
    blurWidth: 8,
    blurHeight: 3
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/Components/Component3.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Component3)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c3$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$c3$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/c3.png.mjs { IMAGE => "[project]/src/assets/c3.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$mask1$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$mask1$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/mask1.png.mjs { IMAGE => "[project]/src/assets/mask1.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-responsive/dist/esm/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
function Component3() {
    _s();
    const isMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"])({
        query: "(max-width: 991px)"
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "py-5 d-flex flex-column align-items-center bg-light",
        style: {
            backgroundImage: `url(${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$mask1$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$mask1$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"].src})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center bottom ',
            backgroundSize: 'contain'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "",
            style: {
                maxWidth: '86%'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "mb-4 Title",
                    children: "Welcome to Urban Ranch"
                }, void 0, false, {
                    fileName: "[project]/src/Components/Component3.js",
                    lineNumber: 19,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "align-items-center gx-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "col-md-12",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "fw-bold mb-3 Heading",
                                    children: "Ranch Life = Refined Living"
                                }, void 0, false, {
                                    fileName: "[project]/src/Components/Component3.js",
                                    lineNumber: 23,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "c3-p",
                                    children: isMobile ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: "Welcome to IRA Urban Ranch — Set in Kongarakalan, near Adibatla, this 17-acre gated villa community is crafted for families seeking luxury, privacy, and soul-deep connection."
                                    }, void 0, false) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            "Welcome to IRA Urban Ranch — Set in Kongarakalan, near Adibatla, this 17-acre gated villa ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                fileName: "[project]/src/Components/Component3.js",
                                                lineNumber: 27,
                                                columnNumber: 107
                                            }, this),
                                            "community is crafted for families seeking luxury, privacy, and soul-deep connection."
                                        ]
                                    }, void 0, true)
                                }, void 0, false, {
                                    fileName: "[project]/src/Components/Component3.js",
                                    lineNumber: 24,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/Components/Component3.js",
                            lineNumber: 22,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "col-md-12",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c3$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$c3$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                                alt: "Image",
                                className: "img-fluid rounded",
                                priority: true
                            }, void 0, false, {
                                fileName: "[project]/src/Components/Component3.js",
                                lineNumber: 32,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/Components/Component3.js",
                            lineNumber: 31,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/Components/Component3.js",
                    lineNumber: 21,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/Components/Component3.js",
            lineNumber: 18,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/Components/Component3.js",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_s(Component3, "7khsyUHgctuHIPa2/KlDS6LcnT0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"]
    ];
});
_c = Component3;
var _c;
__turbopack_context__.k.register(_c, "Component3");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/c1.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/c1.f5f038a5.png");}}),
"[project]/src/assets/c1.png.mjs { IMAGE => \"[project]/src/assets/c1.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c1$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/c1.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c1$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 546,
    height: 386,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAYAAAD+Bd/7AAAA0UlEQVR42gHGADn/ABIfFf09YF3/cai4/4q0wf+Kq7X/ZXh2/11jV/9cXFP9ADVCOv9vdmj/iY2I/4SNjf+DhIL/iIB5/6ylmv+5rJb/AENVTP+NiXz/nYdz/6KMev+IbFb/o418/72pl/+9p5P/ADQwFv99Z0L/podh/6WQev+Hc2D/hndn/3VlVP9vXkn/AGlUMP+IcEj/nYJa/5F/Yf+IeVv/eHNc/1ZWRv9LSz7/AJJ+bv2Rhn7/hIWE/4KJi/93ho3/aXh//01YXP89Rkr9FJFxTlU6EJkAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 6
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/c1mv.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/c1mv.af63a9c3.png");}}),
"[project]/src/assets/c1mv.png.mjs { IMAGE => \"[project]/src/assets/c1mv.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c1mv$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/c1mv.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c1mv$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 237,
    height: 168,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAYAAAD+Bd/7AAAA0UlEQVR42gHGADn/ABMgFf0+YF7/cai4/4q1wv+LrLX/Znh2/15kV/9eXlT9ADVDO/9wd2n/io6I/4WOjv+DhYL/iIF6/62mm/+6rJf/AENVTP+Oin3/nYd0/6ONe/+JbVf/pI58/72qmP+9p5T/ADQxF/99Z0L/p4hh/6WRe/+IdGH/h3dn/3VlVP9vXkn/AGtVMv+JcUr/nYNb/5GAYv+IeVz/eXRd/1dXR/9MTD//AJJ+b/mRh3/7hIaF+4KKjft4h477aXmA+01ZXfs+R0r5OClxkdRjGg8AAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 6
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/Components/Amanities.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>AmenitiesComponent)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c1$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$c1$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/c1.png.mjs { IMAGE => "[project]/src/assets/c1.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c1mv$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$c1mv$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/c1mv.png.mjs { IMAGE => "[project]/src/assets/c1mv.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-responsive/dist/esm/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function AmenitiesComponent() {
    _s();
    const scrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [activeIndex, setActiveIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const isMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"])({
        query: "(max-width: 475px)"
    });
    const data = [
        {
            id: 1,
            name: "Social & Community Spaces",
            points: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "mb-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: "Grand Clubhouse, Banquet Hall, Guest Suites"
                    }, void 0, false, {
                        fileName: "[project]/src/Components/Amanities.js",
                        lineNumber: 20,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: "Party Lawns, Amphitheater, Café‑style seating"
                    }, void 0, false, {
                        fileName: "[project]/src/Components/Amanities.js",
                        lineNumber: 21,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/Components/Amanities.js",
                lineNumber: 19,
                columnNumber: 9
            }, this),
            image: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c1$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$c1$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
            mobileimage: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c1mv$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$c1mv$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"]
        },
        {
            id: 2,
            name: "Sports & Active Living",
            points: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "mb-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                    children: "Futsal, Beach Volleyball, Basketball, Tennis, Badminton"
                }, void 0, false, {
                    fileName: "[project]/src/Components/Amanities.js",
                    lineNumber: 32,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/Components/Amanities.js",
                lineNumber: 31,
                columnNumber: 9
            }, this),
            image: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c1$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$c1$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
            mobileimage: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c1mv$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$c1mv$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"]
        },
        {
            id: 3,
            name: "Nature & Wellness",
            points: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "mb-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                    children: "Edible Gardens, Tree Courts, Outdoor Gym, Yoga Decks, Infinity Pool"
                }, void 0, false, {
                    fileName: "[project]/src/Components/Amanities.js",
                    lineNumber: 43,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/Components/Amanities.js",
                lineNumber: 42,
                columnNumber: 9
            }, this),
            image: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c1$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$c1$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
            mobileimage: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c1mv$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$c1mv$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"]
        }
    ];
    const handleScroll = ()=>{
        const { scrollLeft } = scrollRef.current;
        const card = scrollRef.current.firstChild;
        if (card) {
            const cardWidth = card.offsetWidth + 16;
            const index = Math.round(scrollLeft / cardWidth);
            if (index !== activeIndex) {
                setActiveIndex(index);
            }
        }
    };
    const scrollByCard = (direction)=>{
        const card = scrollRef.current.firstChild;
        if (card) {
            const cardWidth = card.offsetWidth + 16;
            scrollRef.current.scrollBy({
                left: direction * cardWidth,
                behavior: "smooth"
            });
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        style: {
            backgroundColor: "var(--amenitiesbg)"
        },
        id: "amenities",
        className: "jsx-2c621f316968bd7a" + " " + "text-white py-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-2c621f316968bd7a" + " " + "container",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-2c621f316968bd7a" + " " + "row g-5 align-items-start",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-2c621f316968bd7a" + " " + "col-lg-5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-2c621f316968bd7a" + " " + "Amanities_title",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-2c621f316968bd7a",
                                        children: "Community & Amenities"
                                    }, void 0, false, {
                                        fileName: "[project]/src/Components/Amanities.js",
                                        lineNumber: 81,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/Components/Amanities.js",
                                    lineNumber: 80,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "jsx-2c621f316968bd7a" + " " + "py-4 fw-bold AHeading",
                                    children: [
                                        "A Lifestyle that ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                            className: "jsx-2c621f316968bd7a"
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/Amanities.js",
                                            lineNumber: 84,
                                            columnNumber: 32
                                        }, this),
                                        " Breathes and Belongs"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/Components/Amanities.js",
                                    lineNumber: 83,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-2c621f316968bd7a" + " " + "datadiv",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                            className: "jsx-2c621f316968bd7a" + " " + "mb-2 Adataheading",
                                            children: data[activeIndex].name
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/Amanities.js",
                                            lineNumber: 87,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-2c621f316968bd7a" + " " + "text-white fs-6 Adata",
                                            children: data[activeIndex].points
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/Amanities.js",
                                            lineNumber: 88,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/Components/Amanities.js",
                                    lineNumber: 86,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/Components/Amanities.js",
                            lineNumber: 79,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-2c621f316968bd7a" + " " + "col-lg-7 position-relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>scrollByCard(-1),
                                    "aria-label": "Scroll left",
                                    className: "jsx-2c621f316968bd7a" + " " + "carousel-arrow left-arrow",
                                    children: "◀"
                                }, void 0, false, {
                                    fileName: "[project]/src/Components/Amanities.js",
                                    lineNumber: 95,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>scrollByCard(1),
                                    "aria-label": "Scroll right",
                                    className: "jsx-2c621f316968bd7a" + " " + "carousel-arrow right-arrow",
                                    children: "▶"
                                }, void 0, false, {
                                    fileName: "[project]/src/Components/Amanities.js",
                                    lineNumber: 102,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    ref: scrollRef,
                                    onScroll: handleScroll,
                                    style: {
                                        gap: "16px",
                                        overflowX: "scroll",
                                        overflowY: "hidden",
                                        scrollSnapType: "x mandatory",
                                        WebkitOverflowScrolling: "touch"
                                    },
                                    className: "jsx-2c621f316968bd7a" + " " + "d-flex hide-scrollbar",
                                    children: data.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                minWidth: isMobile ? "200px" : "400px",
                                                transition: "opacity 0.3s ease",
                                                scrollSnapAlign: "start",
                                                opacity: index === activeIndex ? 1 : 0.5
                                            },
                                            className: "jsx-2c621f316968bd7a" + " " + "rounded shadow flex-shrink-0",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: isMobile ? item.mobileimage : item.image,
                                                alt: item.name,
                                                width: 400,
                                                height: 300,
                                                className: "w-100 h-auto"
                                            }, void 0, false, {
                                                fileName: "[project]/src/Components/Amanities.js",
                                                lineNumber: 133,
                                                columnNumber: 19
                                            }, this)
                                        }, item.id, false, {
                                            fileName: "[project]/src/Components/Amanities.js",
                                            lineNumber: 123,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/Components/Amanities.js",
                                    lineNumber: 110,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-2c621f316968bd7a" + " " + "d-flex justify-content-center mt-3",
                                    children: data.map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            onClick: ()=>{
                                                const card = scrollRef.current.firstChild;
                                                if (card) {
                                                    const cardWidth = card.offsetWidth + 16;
                                                    scrollRef.current.scrollTo({
                                                        left: index * cardWidth,
                                                        behavior: "smooth"
                                                    });
                                                    setActiveIndex(index);
                                                }
                                            },
                                            style: {
                                                cursor: "pointer",
                                                width: "35px",
                                                height: "4px",
                                                margin: "7px 2px",
                                                borderRadius: "10px",
                                                backgroundColor: index === activeIndex ? "#f7c24c" : "#555"
                                            },
                                            className: "jsx-2c621f316968bd7a"
                                        }, index, false, {
                                            fileName: "[project]/src/Components/Amanities.js",
                                            lineNumber: 147,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/Components/Amanities.js",
                                    lineNumber: 145,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/Components/Amanities.js",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/Components/Amanities.js",
                    lineNumber: 77,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/Components/Amanities.js",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                id: "2c621f316968bd7a",
                children: ".hide-scrollbar.jsx-2c621f316968bd7a::-webkit-scrollbar{display:none}.hide-scrollbar.jsx-2c621f316968bd7a{-ms-overflow-style:none;scrollbar-width:none}.carousel-arrow.jsx-2c621f316968bd7a{z-index:2;color:#fff;cursor:pointer;background-color:#0006;border:none;border-radius:50%;justify-content:center;align-items:center;width:36px;height:36px;display:flex;position:absolute;top:40%}.left-arrow.jsx-2c621f316968bd7a{left:-18px}.right-arrow.jsx-2c621f316968bd7a{right:-18px}@media (width<=768px){.carousel-arrow.jsx-2c621f316968bd7a{width:28px;height:28px;font-size:14px;top:35%}}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/Components/Amanities.js",
        lineNumber: 75,
        columnNumber: 5
    }, this);
}
_s(AmenitiesComponent, "1JGefkP8zSxqUKk+pAYr5j2t7LY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"]
    ];
});
_c = AmenitiesComponent;
var _c;
__turbopack_context__.k.register(_c, "AmenitiesComponent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/gallery/c4.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/c4.9d2b8047.png");}}),
"[project]/src/assets/gallery/c4.png.mjs { IMAGE => \"[project]/src/assets/gallery/c4.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c4$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/gallery/c4.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c4$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 395,
    height: 391,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAABCUlEQVR42g3LPUsCcQDA4f/o1h60hLQlRWMkRWJmCam9mWh5aidm1pkOIb0RhkUJYhhenYGR5LVEBxrRIjXU0he64afDMz4idt4wd691srfvHGkfHFxWmFt0YBsdwjo8aIqCZnDT/KSkdym//VLr/KOcFZl1ObDPTCHuH+q0dQ39pYnaMmgYXV6//nhq//Dc+UbU1Rrli2MOFZlsyo9aKfB4V6JavaLVTyKfSbMd9hFcmUQOTnOSTZJLh8jvByie7iGkcIDAqhM54iQecROTlkkmvOwk/CiZLcTShheX34Mn6GUhvIY7JmGPJhgLxRlZ30TYpJQ5nlSYUHJY42kGfDKW+WifhMUdMXuL15UjTCrlywAAAABJRU5ErkJggg==",
    blurWidth: 8,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/gallery/C8.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/C8.5bf51873.png");}}),
"[project]/src/assets/gallery/C8.png.mjs { IMAGE => \"[project]/src/assets/gallery/C8.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$C8$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/gallery/C8.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$C8$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 397,
    height: 227,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAFCAYAAAB4ka1VAAAAqElEQVR42gWAyQoBYQCA/3dycVSOthwclKWMBvOLYTLJGposp5HJwdgLyU28gByVq3eZwyfx+f681/vD/XbjcjiyW21wN2e21weu0/TE2p5gD8vsbYvnycUZmMxMjYWVo6v7EY1SGj0XZNxSWVpNRnWNoZ6nI+O0ZAjRMyRlJUI1H0RLxygkoshkGFMNkE34EEVV85RUFkPJMDVKOO0Ky45k3s3Qr4W9P3vaYf+2aYT2AAAAAElFTkSuQmCC",
    blurWidth: 8,
    blurHeight: 5
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/gallery/image5.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/image5.e601b23a.png");}}),
"[project]/src/assets/gallery/image5.png.mjs { IMAGE => \"[project]/src/assets/gallery/image5.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$image5$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/gallery/image5.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$image5$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 391,
    height: 636,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAICAYAAAAx8TU7AAAAnklEQVR42gWA3QrBUACAz/MoUYjy187ajmxMfkaNyLTa7HIswwUt5WLlhdcnEfheudouyZ5Xim/OryhK8XrnZElCdnlwOEbc7h9EHMX0tBGVeodmV2HYW4QyTdaOYqS3aTZqDI0JIj3HHBcOvq2RuIpwZSMGukunP0PKOXPH5eTtEVJ5WFOfU5AijTF9zUJUW7I07R0bL0Q3pyhrU/4BbeZQ2XyR9kQAAAAASUVORK5CYII=",
    blurWidth: 5,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/gallery/c7.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/c7.ded7d9d6.png");}}),
"[project]/src/assets/gallery/c7.png.mjs { IMAGE => \"[project]/src/assets/gallery/c7.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c7$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/gallery/c7.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c7$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 397,
    height: 347,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAHCAYAAAA1WQxeAAAA8klEQVR42gHnABj/AEpKMvtiZE3/iaC0/5+74f+xxuL/tcnj/7/Q5//I1er7AJKgrP+Ynab/p626/6Sjr/+knqT/xbu2/8nAvf/N0Nv/AIl+Vv9+aVv/kntr/8a2q/+6pJP/u6ie/6mYkP+imJH/AHNkP/+Me2r/oYx6/9vItv+zmYL/qZWH/4Jya/9hVj3/AGhVOv+BcFz/fm5n/4BvZf9zYlj/d2ZW/2VXPv9ZTC3/AIx3Rv93aVD/XVNP/3RmXf97a2T/dWZW/2thRv9nXkr/AIh1TfuRfGT/lYB2/5V+dv+NdnH/hXJv/3lqa/9iWmL7voePqAA374gAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 7
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/gallery/c2.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/c2.a1a332ed.png");}}),
"[project]/src/assets/gallery/c2.png.mjs { IMAGE => \"[project]/src/assets/gallery/c2.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c2$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/gallery/c2.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c2$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 397,
    height: 263,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAFCAYAAAB4ka1VAAAAoUlEQVR42hXMTQvBYADA8edLICN5TXkrcRJl5YhyIXvGzDzY9myHnRQl5eA77/DH7Xf6idfnmT7ed5Kb5hq4WK7E9RWXWKN0mAodHQn0kTDySGKF4+yRcos6edg7ifgj8APOJ4XnHnD2v8WSmDOTRquJ2Nk21tZmvlwxmZr0hgMa7RZGuUSuaCAW603aH40p1WtkC3kyBQOjUqXW7VJtd9IvCR1NCJJrIlEAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 5
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/gallery/c4mv.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/c4mv.1d3104cb.png");}}),
"[project]/src/assets/gallery/c4mv.png.mjs { IMAGE => \"[project]/src/assets/gallery/c4mv.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c4mv$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/gallery/c4mv.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c4mv$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 141,
    height: 149,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAABCklEQVR42g3FTy+CcQDA8d+Rm7vNyawLDjoZw0VWPdNKRhGep6ee/tCipzFbLhlbW+NJDtmwNJ54ZrZnUzYujQMXL+c5fjl9hFpuOjtVC/3SpnT9hl6pI4UkxseGcI0MOqLSfKX68E71qYfx8k2j+8tB5QKPf4Hp2SmE2bqla93Qbps0Hm2adg/r44dW54v7zieibhjUTkoUcyqFbJBG7Zi7KwPjrMyzZSKKuSxqbJFoeBJtfY6jvTT7eQU9HeD89BCxFgkTi8yjyR4Sso+4HCaTCpFKBtALcYR/JYh3WUKKBvFvrOJTFWYUjYnNJK6IjBiVM457exd3Xmc4kWNgSaPfG6fPq/y75fwBBnqV2B3uriEAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/gallery/C8mv.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/C8mv.19a0de69.png");}}),
"[project]/src/assets/gallery/C8mv.png.mjs { IMAGE => \"[project]/src/assets/gallery/C8mv.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$C8mv$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/gallery/C8mv.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$C8mv$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 141,
    height: 149,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAABBElEQVR42g3NS0vCAADA8X2xCqIIelDIsqFpPhBnTUTyUeZhMsosM1/EctiEEHLIEkIoCrt0KToUnjp16EPs+G/3H/yE548/Z/L+y/3TJ3eP3wxeftBHU+rDKSf9L0cY2zZ9vc5tR6fbbmK2LmloRcyrFj1rgtDUsozMNrZR4/XBwrquktle5zyv0DktIOzuLFDTjuhdqLyNBwy7Tcq5JK1SnkpORohIs5QPJQ5kkbi0gbQ0T9SzTNy7RjW/5YLADKnYHHJoEdkvkg5LLlgl5lmhUfQhKMEA6l6EajaBru5zc5zDKKUx1CTmmVsoyYwTCkbxeTYJiyKKz0sh4kdLhKikos4/WWygfez6EvUAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/gallery/image5mv.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/image5mv.3818be99.png");}}),
"[project]/src/assets/gallery/image5mv.png.mjs { IMAGE => \"[project]/src/assets/gallery/image5mv.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$image5mv$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/gallery/image5mv.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$image5mv$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 289,
    height: 135,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAECAYAAACzzX7wAAAAgUlEQVR42gWAzQqCMACA9z79kIZiDmPUVqYSlUoiah0KCYIudelQt956fCHWWWx9GaH1EjkPGE0GuHKFihOcQFqhtObzuPO7Hfl2hlcR0e8MyiiGgYeo6yuHfYsfJnhTRbrY8O4vyDBk7DqIsnvayDTMVEmanciLlm2aUxUNbXW2fxufPCRt+UTzAAAAAElFTkSuQmCC",
    blurWidth: 8,
    blurHeight: 4
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/gallery/c7mv.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/c7mv.b4afbc42.png");}}),
"[project]/src/assets/gallery/c7mv.png.mjs { IMAGE => \"[project]/src/assets/gallery/c7mv.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c7mv$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/gallery/c7mv.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c7mv$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 141,
    height: 149,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAABBElEQVR42gWAzUrCcADA/48UXXqFoijK2AoLS40phTM1A0WdgSSN8otCA8WYZWGGSiWEIXbIIvogL526hL7Cjr8QC7NjpstjJdv4otT5o9Ef0nod0n4b8fgxMkW6eEWp1qH+8I1RbVMx6jz3enz2nxgMfhDp6A57WzZqeZ3meZlGMUf35oI7o0AlpyM07xL+NQvNQoLf9y63BY32WQYjk0QP+xBHEYXyYYxWUeflvsp1LsplNo7mVfA7ZUTYPY1DnschWbDNTbI8M4kiTbG+OIFdHkecJq147BKuVZn94CapSABN3SDolvApEiIVWjFPYj7y8RDH0V0OAiqJbQ9xVcXrVMx/bTina7n70+gAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/gallery/c2mv.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/c2mv.594ae3ad.png");}}),
"[project]/src/assets/gallery/c2mv.png.mjs { IMAGE => \"[project]/src/assets/gallery/c2mv.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c2mv$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/gallery/c2mv.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c2mv$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 141,
    height: 149,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAA70lEQVR42h3LT0vCYACA8fczSNim5nJpQVmgFEJBVEQnwaTM5f74bnNzruaSQbE8FJ36xjs+hYfn8sBPfP9+FZ8/OWHiIwMbL54RZylp/sFqvS7EMpuTrDzSxCF/T+kP+9z27xiMBjyZY0QUTYn+9VsqyZZzFosXTNtGOhZxGCKS12Qz4yggdG0i3yfc5OG5EuHKGYF0cd0Ay3IYm1OMic1wZHB5c46YPFs8GpKH+yEXV9ecnHZodztorSbKThXR653RPDpmt6Wj1GuoDQ1Vq6NoGvXWPkJvHxYVvUG5VqG0XaaklNlSVar6HgedbvEHHzB6QmQen1UAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/Vector.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/Vector.fd78ce9b.png");}}),
"[project]/src/assets/Vector.png.mjs { IMAGE => \"[project]/src/assets/Vector.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$Vector$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/Vector.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$Vector$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 195,
    height: 185,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAUUlEQVR42p3NuwrAMAiF4azJkMxeQHRS3/8B2wwpoZRSOgjy88EpAFDnZeZg5oaITUT6bOdfyx0QUVPVvvp3EBEXMLN38G9iB48T7t43MFY/AIOFGDAUwZMnAAAAAElFTkSuQmCC",
    blurWidth: 8,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/Components/Gallery.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Gallery)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c4$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$c4$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/gallery/c4.png.mjs { IMAGE => "[project]/src/assets/gallery/c4.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$C8$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$C8$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/gallery/C8.png.mjs { IMAGE => "[project]/src/assets/gallery/C8.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$image5$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$image5$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/gallery/image5.png.mjs { IMAGE => "[project]/src/assets/gallery/image5.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c7$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$c7$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/gallery/c7.png.mjs { IMAGE => "[project]/src/assets/gallery/c7.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c2$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$c2$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/gallery/c2.png.mjs { IMAGE => "[project]/src/assets/gallery/c2.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c4mv$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$c4mv$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/gallery/c4mv.png.mjs { IMAGE => "[project]/src/assets/gallery/c4mv.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$C8mv$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$C8mv$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/gallery/C8mv.png.mjs { IMAGE => "[project]/src/assets/gallery/C8mv.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$image5mv$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$image5mv$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/gallery/image5mv.png.mjs { IMAGE => "[project]/src/assets/gallery/image5mv.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c7mv$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$c7mv$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/gallery/c7mv.png.mjs { IMAGE => "[project]/src/assets/gallery/c7mv.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c2mv$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$c2mv$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/gallery/c2mv.png.mjs { IMAGE => "[project]/src/assets/gallery/c2mv.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$Vector$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$Vector$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/Vector.png.mjs { IMAGE => "[project]/src/assets/Vector.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-responsive/dist/esm/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
;
;
;
;
function Gallery() {
    _s();
    const isMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"])({
        query: "(max-width: 750px)"
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "py-5 position-relative",
        style: {
            backgroundColor: "var(--gallerybg)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$Vector$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$Vector$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                alt: "Decoration",
                width: isMobile ? 121 : 162,
                height: isMobile ? 107 : 145,
                className: "position-absolute start-0",
                style: {
                    bottom: isMobile ? 0 : "20%",
                    zIndex: 0
                }
            }, void 0, false, {
                fileName: "[project]/src/Components/Gallery.js",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$Vector$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$Vector$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                alt: "Decoration",
                width: isMobile ? 121 : 162,
                height: isMobile ? 107 : 145,
                className: "position-absolute end-0",
                style: {
                    top: isMobile ? 0 : "20%"
                }
            }, void 0, false, {
                fileName: "[project]/src/Components/Gallery.js",
                lineNumber: 28,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container ",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mb-4 GalleryTitle",
                        children: "Gallery"
                    }, void 0, false, {
                        fileName: "[project]/src/Components/Gallery.js",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this),
                    isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "container-fluid px-2",
                        style: {
                            position: "relative",
                            zIndex: 10
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "row gx-2 gy-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-6",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                            src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c4mv$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$c4mv$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                                            alt: "Gallery Image 1",
                                            className: "img-fluid rounded w-100",
                                            style: {
                                                objectFit: 'cover'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/Gallery.js",
                                            lineNumber: 49,
                                            columnNumber: 9
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/Components/Gallery.js",
                                        lineNumber: 48,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-6",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                            src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$C8mv$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$C8mv$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                                            alt: "Gallery Image 2",
                                            className: "img-fluid rounded w-100",
                                            style: {
                                                objectFit: 'cover'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/Gallery.js",
                                            lineNumber: 57,
                                            columnNumber: 9
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/Components/Gallery.js",
                                        lineNumber: 56,
                                        columnNumber: 7
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/Components/Gallery.js",
                                lineNumber: 47,
                                columnNumber: 5
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "row gx-2 gy-2 mt-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "col-12",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$image5mv$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$image5mv$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                                        alt: "Gallery Image 3",
                                        className: "img-fluid rounded w-100",
                                        style: {
                                            objectFit: 'cover'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/Components/Gallery.js",
                                        lineNumber: 69,
                                        columnNumber: 9
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/Components/Gallery.js",
                                    lineNumber: 68,
                                    columnNumber: 7
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/Components/Gallery.js",
                                lineNumber: 67,
                                columnNumber: 5
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "row gx-2 gy-2 mt-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-6",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                            src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c7mv$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$c7mv$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                                            alt: "Gallery Image 4",
                                            className: "img-fluid rounded w-100",
                                            style: {
                                                objectFit: 'cover'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/Gallery.js",
                                            lineNumber: 81,
                                            columnNumber: 9
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/Components/Gallery.js",
                                        lineNumber: 80,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-6",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                            src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c2mv$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$c2mv$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                                            alt: "Gallery Image 5",
                                            className: "img-fluid rounded w-100",
                                            style: {
                                                objectFit: 'cover'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/Gallery.js",
                                            lineNumber: 89,
                                            columnNumber: 9
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/Components/Gallery.js",
                                        lineNumber: 88,
                                        columnNumber: 7
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/Components/Gallery.js",
                                lineNumber: 79,
                                columnNumber: 5
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/Components/Gallery.js",
                        lineNumber: 45,
                        columnNumber: 3
                    }, this),
                    !isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "row g-3 justify-content-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "col-md-4 d-flex flex-column justify-content-end align-items-end",
                                style: {
                                    zIndex: 10
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c4$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$c4$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                                        alt: "Gallery Image 1",
                                        className: "img-fluid w-100",
                                        style: {
                                            maxHeight: 391,
                                            objectFit: 'cover',
                                            borderRadius: 15
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/Components/Gallery.js",
                                        lineNumber: 106,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$C8$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$C8$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                                        alt: "Gallery Image 2",
                                        className: "img-fluid w-100 mt-3",
                                        style: {
                                            maxHeight: 227,
                                            objectFit: 'cover',
                                            borderRadius: 15
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/Components/Gallery.js",
                                        lineNumber: 112,
                                        columnNumber: 7
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/Components/Gallery.js",
                                lineNumber: 105,
                                columnNumber: 5
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "col-md-4 d-flex align-items-center justify-content-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$image5$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$image5$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                                    alt: "Gallery Image 3",
                                    className: "img-fluid w-100",
                                    style: {
                                        maxHeight: 636,
                                        objectFit: 'cover',
                                        borderRadius: 15
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/Components/Gallery.js",
                                    lineNumber: 122,
                                    columnNumber: 7
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/Components/Gallery.js",
                                lineNumber: 121,
                                columnNumber: 5
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "col-md-4 d-flex flex-column justify-content-start",
                                style: {
                                    zIndex: 10
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c7$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$c7$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                                        alt: "Gallery Image 4",
                                        className: "img-fluid w-100",
                                        style: {
                                            maxHeight: 347,
                                            objectFit: 'cover',
                                            borderRadius: 15
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/Components/Gallery.js",
                                        lineNumber: 132,
                                        columnNumber: 7
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$gallery$2f$c2$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$gallery$2f$c2$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                                        alt: "Gallery Image 5",
                                        className: "img-fluid w-100 mt-4 rounded",
                                        style: {
                                            maxHeight: 263,
                                            objectFit: 'cover',
                                            borderRadius: 15
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/Components/Gallery.js",
                                        lineNumber: 138,
                                        columnNumber: 7
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/Components/Gallery.js",
                                lineNumber: 131,
                                columnNumber: 5
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/Components/Gallery.js",
                        lineNumber: 103,
                        columnNumber: 3
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/Components/Gallery.js",
                lineNumber: 36,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/Components/Gallery.js",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_s(Gallery, "7khsyUHgctuHIPa2/KlDS6LcnT0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"]
    ];
});
_c = Gallery;
var _c;
__turbopack_context__.k.register(_c, "Gallery");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/smarticons/fan.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/fan.dde164cf.png");}}),
"[project]/src/assets/smarticons/fan.png.mjs { IMAGE => \"[project]/src/assets/smarticons/fan.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$fan$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/smarticons/fan.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$fan$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 49,
    height: 42,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAHCAYAAAA1WQxeAAAAzklEQVR42k2NMQuCQACF7zDIhgTd1CGpoSE5TJBDCpMME8ElcFBXBRdFFwVdxB/g5l/wd3YnDb3pPd7HewD8xDAMnKbpU5blE/wLYyxLkrSHEII0TbHneRfioaIovKZpImjb9hHHMTIMQ86yDAdBoFqWpURRhEhnAdM0DxRIkkRbliWb5zmhmQK6rovrDb3ous6p69rp+94riuLO8/xuLTmO2/q+f66q6tY0zYsAbp7npm3bR5ZlN4CY0zAMbhiGqiAIO7pG5q/jOL4RQuIXaSU0m+CsKm4AAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 7
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/smarticons/smartlock.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/smartlock.318e9b7f.png");}}),
"[project]/src/assets/smarticons/smartlock.png.mjs { IMAGE => \"[project]/src/assets/smarticons/smartlock.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$smartlock$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/smarticons/smartlock.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$smartlock$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 33,
    height: 42,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAICAYAAADaxo44AAAAwklEQVR42jWOOwuCUACFLwSutdQWCOXoI6ikyBJcyggh6Q63Ai96B1F0F3US3Fx87K6Ci78wKzzwLecbzgGu60pRFF3DMFQJITuKokbgmzRN72VZorqucZ7nL03TtqIoLkGWZc+u60iSJJc4js9BEChVVT2AaZpSX96KooCe5ymWZW1Ylp0BVVV5mqbHPRNBEBYcx81/G7ZtH9u2fTdNg3VdX/M8/xeO45wghKxhGCuE0JphmOkgDj2y7/syxng/3P0AXFE8m52USRkAAAAASUVORK5CYII=",
    blurWidth: 6,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/smarticons/voice_assistant.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/voice_assistant.537a8c56.png");}}),
"[project]/src/assets/smarticons/voice_assistant.png.mjs { IMAGE => \"[project]/src/assets/smarticons/voice_assistant.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$voice_assistant$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/smarticons/voice_assistant.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$voice_assistant$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 30,
    height: 51,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAICAYAAAAx8TU7AAAAiElEQVR42jXNMQtCIRDA8RuaLKhcRD9CjUVRECI1OIhDRoNDtImbq6vg6u63fd6Dd3D8+Q3HQc75PebWe/9j0aCUOhFCVkKINRYNWuurlPJojDmPHtDgnJPe+1dKyWPR8zljbMs534/u5nNr7YNSulkWDa21XwjhMr4+sWiotX5ijPdSisEOfyfxqC1tqTecgQAAAABJRU5ErkJggg==",
    blurWidth: 5,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/smarticons/remote_access.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/remote_access.ed2ce684.png");}}),
"[project]/src/assets/smarticons/remote_access.png.mjs { IMAGE => \"[project]/src/assets/smarticons/remote_access.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$remote_access$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/smarticons/remote_access.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$remote_access$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 42,
    height: 42,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAyklEQVR42k2OsQqCUBiFL4FTQYmbc0TUEFQahTbk4CRcAocKQbPUBp18A0F0F1cFR0dfsHMdxLOe83/fT8gogiDMXNc9maa5LYqCxnF8G0qe56dRFKlZltEwDK9BEMhVVd2H0nEcqa7rZ9u2nzzP2UgFadNjLcs6UkrXaZoaXdf9MHqDZEAnEaAUTdOWSZIYKL5sBNIDOoUdE2D2oiguyrKkTdO8bNs+MB3T9n7P884cx00wmuu6vsJAHkoW3/dl/CCBtIPu0mNH+QMf2kYXa3QYNQAAAABJRU5ErkJggg==",
    blurWidth: 8,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/smarticons/wiring.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/wiring.9755c1fe.png");}}),
"[project]/src/assets/smarticons/wiring.png.mjs { IMAGE => \"[project]/src/assets/smarticons/wiring.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$wiring$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/smarticons/wiring.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$wiring$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 42,
    height: 42,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAsElEQVR42lWPKwvDMBSFb2EzhRbGRE1hqoOKmY2JqpqJvdRYGDVzla2sLJQSEZ1A/u76uSwinOTcex4iwcnzPDHG3K21H+ecaprmGPKilDporR9VVe3atj0vQ2+J43gVRZFkWZZM0/Sa51mBi6LYjON4k77vL2maruu63g/D8Oy67gouy3Lrvf8KFw8+IRkCs8SyIIMcsshjA8YWeyEIgQhGQIL+JV+qnKhENSpSNeR/HqU+MlUhQ1QAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/C4_Westfacingwithclub.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/C4_Westfacingwithclub.20901832.png");}}),
"[project]/src/assets/C4_Westfacingwithclub.png.mjs { IMAGE => \"[project]/src/assets/C4_Westfacingwithclub.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$C4_Westfacingwithclub$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/C4_Westfacingwithclub.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$C4_Westfacingwithclub$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 722,
    height: 619,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAHCAYAAAA1WQxeAAAA8klEQVR42gHnABj/AHyUt/6EnL7/jKPE/5Opyf+gs9D/rbzR/52iq/+Oj5L+AKWtv/+bq8T/larH/5uvzf+lt9L/tcTc/8nT5f/Jztn/AIZ2a/+Pgnz/u73E/6q4z/+tvNT/t8bd/8fT5v/a4vD/AG9hWf97cGf/wLu3/6unpv+vrrH/vL/J/8jQ3P/Izcr/AGxeU/9wYVb/qJuO/6WWiv+RiID/kIyA/6Cfkv+foJL/AHVwaP9lX0//aGNV/3NpWv9oXlb/X1hH/2JbSf97eGr/AHhzZv56dGD/d3Fb/3JsVv9sZ1P/YF5I/2JeRv9kYkj+29WZLOqtuNAAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 7
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/Components/SmartLiving.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>SmartLiving)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$fan$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$smarticons$2f$fan$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/smarticons/fan.png.mjs { IMAGE => "[project]/src/assets/smarticons/fan.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$smartlock$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$smarticons$2f$smartlock$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/smarticons/smartlock.png.mjs { IMAGE => "[project]/src/assets/smarticons/smartlock.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$voice_assistant$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$smarticons$2f$voice_assistant$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/smarticons/voice_assistant.png.mjs { IMAGE => "[project]/src/assets/smarticons/voice_assistant.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$remote_access$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$smarticons$2f$remote_access$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/smarticons/remote_access.png.mjs { IMAGE => "[project]/src/assets/smarticons/remote_access.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$wiring$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$smarticons$2f$wiring$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/smarticons/wiring.png.mjs { IMAGE => "[project]/src/assets/smarticons/wiring.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$C4_Westfacingwithclub$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$C4_Westfacingwithclub$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/C4_Westfacingwithclub.png.mjs { IMAGE => "[project]/src/assets/C4_Westfacingwithclub.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$style$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/Components/style.module.css [client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-responsive/dist/esm/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
function SmartLiving() {
    _s();
    const isMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"])({
        query: '(max-width: 768px)'
    });
    const data = [
        {
            id: 1,
            name: "App-controlled lighting & fan automation",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$fan$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$smarticons$2f$fan$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
            width: 48.18,
            height: 42,
            mbwidth: 24.09,
            mbheight: 21
        },
        {
            id: 2,
            name: "Smart door locks & entry alerts",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$smartlock$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$smarticons$2f$smartlock$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
            width: 32.2,
            height: 42,
            mbwidth: 16.1,
            mbheight: 21
        },
        {
            id: 3,
            name: "Voice assistant compatibility (Alexa/Google)",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$voice_assistant$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$smarticons$2f$voice_assistant$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
            width: 30,
            height: 50.28,
            mbwidth: 15,
            mbheight: 25.14
        },
        {
            id: 4,
            name: "Remote-access for appliances & devices",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$remote_access$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$smarticons$2f$remote_access$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
            width: 42.01,
            height: 42,
            mbwidth: 21,
            mbheight: 21
        },
        {
            id: 5,
            name: "Future-ready automation wiring throughout",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$smarticons$2f$wiring$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$smarticons$2f$wiring$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
            width: 42,
            height: 42,
            mbwidth: 21,
            mbheight: 21
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "py-5 bg-white",
        id: "smart-living",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "container text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                    className: "mb-3 fw-bold text-start Heading",
                    children: "Smart Living, Without Lifting a Finger"
                }, void 0, false, {
                    fileName: "[project]/src/Components/SmartLiving.js",
                    lineNumber: 23,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mb-4 text-start smartliving_p",
                    children: [
                        "Your villa at IRA Urban Ranch comes fully pre-fitted with complete home automation —",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                            className: "d-none d-md-block"
                        }, void 0, false, {
                            fileName: "[project]/src/Components/SmartLiving.js",
                            lineNumber: 25,
                            columnNumber: 95
                        }, this),
                        "designed to make everyday life smoother, safer, and more intuitive for your family."
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/Components/SmartLiving.js",
                    lineNumber: 24,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "row align-items-center gy-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "col-lg-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "row row-cols-1 g-4 text-start ",
                                children: data.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-6 col-lg-12 d-flex align-items-lg-center align-items-start flex-lg-row flex-column smartliving_icon_container my-4 my-md-5 my-lg-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "me-3 align-items-center smartliving_icon",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                        src: item.icon,
                                                        alt: item.name,
                                                        width: isMobile ? item.mbwidth : item.width,
                                                        height: isMobile ? item.mbheight : item.height,
                                                        objectFit: "contain"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Components/SmartLiving.js",
                                                        lineNumber: 39,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/Components/SmartLiving.js",
                                                    lineNumber: 36,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/Components/SmartLiving.js",
                                                lineNumber: 35,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mb-0 me-1 p-2 align-self-center smartliving_icon_name",
                                                children: item.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/Components/SmartLiving.js",
                                                lineNumber: 49,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, item.id, true, {
                                        fileName: "[project]/src/Components/SmartLiving.js",
                                        lineNumber: 34,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/Components/SmartLiving.js",
                                lineNumber: 32,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/Components/SmartLiving.js",
                            lineNumber: 31,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "col-lg-6 text-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$C4_Westfacingwithclub$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$C4_Westfacingwithclub$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                                alt: "Smart Living",
                                className: "img-fluid rounded shadow"
                            }, void 0, false, {
                                fileName: "[project]/src/Components/SmartLiving.js",
                                lineNumber: 57,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/Components/SmartLiving.js",
                            lineNumber: 56,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/Components/SmartLiving.js",
                    lineNumber: 29,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/Components/SmartLiving.js",
            lineNumber: 22,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/Components/SmartLiving.js",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_s(SmartLiving, "7khsyUHgctuHIPa2/KlDS6LcnT0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"]
    ];
});
_c = SmartLiving;
var _c;
__turbopack_context__.k.register(_c, "SmartLiving");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/plan.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/plan.7d569d37.png");}}),
"[project]/src/assets/plan.png.mjs { IMAGE => \"[project]/src/assets/plan.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$plan$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/plan.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$plan$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 722,
    height: 543,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAGCAYAAAD+Bd/7AAAA0UlEQVR42gHGADn/AAAAAAACAgIEHR4cPVlcTqh4hXXeFxsXLQAAAAAAAAAAAAUGBAoMDQoYNjwyc4iSdviLkYHoFxkWKwAAAAAAAAAAAC0yKVdpdGLGZW9ZxYqRdfuAjHjrHB8ZOAcIBg0GBwUMADxBNnOJlYL8iJN+/46Xgf+IlIH6bXZm0GlzYsRhaVm6AHV+a9uMlYT/iJGA/46Zhf+KlIL/g416+YCKd+92gG7jAE1WRZRgale2bXpj2nmGbuFdZ1SyMzksaR8jHD4cHxk354pH09Phq5sAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 6
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/Components/MasterPlan.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>MasterPlan)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$plan$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$plan$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/plan.png.mjs { IMAGE => "[project]/src/assets/plan.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-responsive/dist/esm/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
function MasterPlan() {
    _s();
    const legendItems = [
        "Entry/exit with security cabin",
        "Primary street",
        "Pedestrian walkway",
        "Multipurpose lawn with stepped sitting",
        "Stage with feature wall",
        "Sunken seating with fire pit",
        "Swimming pool",
        "Shade structure and lounge seating",
        "Car parking",
        "Driveway",
        "Plaza",
        "Children's play area",
        "Mini soccer",
        "Outdoor gym",
        "Picnic Zone",
        "Shade structure with yoga/meditation",
        "Play lawn",
        "Half basketball court with seating gallery",
        "Tennis court",
        "Feature wall with sculpture",
        "Skating rink",
        "Informal seating",
        "Edible garden"
    ];
    const isMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"])({
        query: '(max-width: 756px)'
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "mp",
        style: {
            backgroundColor: "var(--mpbgclr)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "row g-5 align-items-center ",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "col-lg-7 d-flex flex-column align-items-end",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "mb-3 fw-bold Heading",
                                    children: "Master Plan"
                                }, void 0, false, {
                                    fileName: "[project]/src/Components/MasterPlan.js",
                                    lineNumber: 38,
                                    columnNumber: 25
                                }, this),
                                !isMobile ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: " mpbroucherbtn",
                                    children: "Download Brochure"
                                }, void 0, false, {
                                    fileName: "[project]/src/Components/MasterPlan.js",
                                    lineNumber: 39,
                                    columnNumber: 38
                                }, this) : null,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                        src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$plan$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$plan$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                                        alt: "Master plan image",
                                        className: "img-fluid ",
                                        priority: true
                                    }, void 0, false, {
                                        fileName: "[project]/src/Components/MasterPlan.js",
                                        lineNumber: 41,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/Components/MasterPlan.js",
                                    lineNumber: 40,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/Components/MasterPlan.js",
                            lineNumber: 37,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/Components/MasterPlan.js",
                        lineNumber: 36,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "col-lg-5 rounded-4 py-3",
                        style: {
                            backgroundColor: "white"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "mb-4 fw-bold Heading",
                                children: "Legend"
                            }, void 0, false, {
                                fileName: "[project]/src/Components/MasterPlan.js",
                                lineNumber: 55,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "list-unstyled row",
                                children: legendItems.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "col-6 col-lg-12 d-flex align-items-start",
                                        style: {
                                            fontSize: isMobile ? "10px" : "18px"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "fw-semibold me-2",
                                                children: [
                                                    index + 1,
                                                    "."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/Components/MasterPlan.js",
                                                lineNumber: 63,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: item
                                            }, void 0, false, {
                                                fileName: "[project]/src/Components/MasterPlan.js",
                                                lineNumber: 64,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, index, true, {
                                        fileName: "[project]/src/Components/MasterPlan.js",
                                        lineNumber: 58,
                                        columnNumber: 29
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/Components/MasterPlan.js",
                                lineNumber: 56,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/Components/MasterPlan.js",
                        lineNumber: 54,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/Components/MasterPlan.js",
                lineNumber: 34,
                columnNumber: 13
            }, this),
            isMobile ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: " mpbroucherbtn",
                children: "Download Brochure"
            }, void 0, false, {
                fileName: "[project]/src/Components/MasterPlan.js",
                lineNumber: 70,
                columnNumber: 25
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/Components/MasterPlan.js",
        lineNumber: 33,
        columnNumber: 9
    }, this);
}
_s(MasterPlan, "7khsyUHgctuHIPa2/KlDS6LcnT0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"]
    ];
});
_c = MasterPlan;
var _c;
__turbopack_context__.k.register(_c, "MasterPlan");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/location.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/location.c6554cee.png");}}),
"[project]/src/assets/location.png.mjs { IMAGE => \"[project]/src/assets/location.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$location$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/location.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$location$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 537,
    height: 689,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAICAYAAADaxo44AAAAuElEQVR42g2Ny07CQABF58fAhanERDtVSjHjFIc6AWypMVhIA+HVEAg7HuF3e5jFzd3ce47oq05d5pYvFVF8f7BODeWPqcXm13KtpuyKlPkoZjZwGfYQpzLnti2o/odkJkIFkrF7i32Rc3TrRHWZqDZavmDCN8R5mnGZZcwdYmUVq4Fm9Bkils5x+EtY2A76/Zlx0qWaWERf+6TGR0UtwrZHrF/pxRLhyWb9JJt4foNW4Dp44NFv1HeOnmdyWQMaQQAAAABJRU5ErkJggg==",
    blurWidth: 6,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/Components/LocationAdvantages.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>LocationAdvantages)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$location$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$location$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/location.png.mjs { IMAGE => "[project]/src/assets/location.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$go$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/go/index.mjs [client] (ecmascript)");
;
;
;
;
function LocationAdvantages() {
    const data = [
        {
            time: "10-15 mins to",
            place: "TCS, Tata Aerospace, Adibatla SEZ"
        },
        {
            time: "15-20 mins to",
            place: "Delhi Public School, Aga Khan Academy"
        },
        {
            time: "10-15 mins to",
            place: "Wonderla & upcoming World Trade Center"
        },
        {
            time: "25 mins to",
            place: "RGI Airport & ORR Exit 13"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "container  py-5",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "row align-items-center g-5 flex-column-reverse flex-md-row",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "col-12 col-md-5",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                        src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$location$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$location$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                        alt: "Location Advantages",
                        className: "img-fluid"
                    }, void 0, false, {
                        fileName: "[project]/src/Components/LocationAdvantages.js",
                        lineNumber: 18,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/Components/LocationAdvantages.js",
                    lineNumber: 17,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "col-12 col-md-7",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "LaHbg",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: " fw-semibold mb-0 Title",
                                children: "Location Advantages"
                            }, void 0, false, {
                                fileName: "[project]/src/Components/LocationAdvantages.js",
                                lineNumber: 24,
                                columnNumber: 11
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/Components/LocationAdvantages.js",
                            lineNumber: 23,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: " fw-bold mb-4 Heading",
                            children: [
                                "Close to What Matters. ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                    className: "d-none d-md-block"
                                }, void 0, false, {
                                    fileName: "[project]/src/Components/LocationAdvantages.js",
                                    lineNumber: 27,
                                    columnNumber: 36
                                }, this),
                                "Away From What Doesn’t."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/Components/LocationAdvantages.js",
                            lineNumber: 26,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            className: "list-unstyled fs-5",
                            children: data.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    className: "d-flex align-items-center mb-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$go$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["GoCheckCircleFill"], {
                                            className: "text-success me-3 flex-shrink-0",
                                            size: 28
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/LocationAdvantages.js",
                                            lineNumber: 34,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "la_li",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "fw-semibold",
                                                    style: {
                                                        color: "#73788C"
                                                    },
                                                    children: item.time
                                                }, void 0, false, {
                                                    fileName: "[project]/src/Components/LocationAdvantages.js",
                                                    lineNumber: 36,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-dark",
                                                    children: [
                                                        " ",
                                                        item.place
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/Components/LocationAdvantages.js",
                                                    lineNumber: 37,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/Components/LocationAdvantages.js",
                                            lineNumber: 35,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, index, true, {
                                    fileName: "[project]/src/Components/LocationAdvantages.js",
                                    lineNumber: 33,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/Components/LocationAdvantages.js",
                            lineNumber: 31,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "btn btn-success mt-4 px-4 py-2 fw-semibold",
                            children: "Why Adibatla?"
                        }, void 0, false, {
                            fileName: "[project]/src/Components/LocationAdvantages.js",
                            lineNumber: 43,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/Components/LocationAdvantages.js",
                    lineNumber: 22,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/Components/LocationAdvantages.js",
            lineNumber: 15,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/Components/LocationAdvantages.js",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = LocationAdvantages;
var _c;
__turbopack_context__.k.register(_c, "LocationAdvantages");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/Components/CustomerTestimonials.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>CustomerTestimonials)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-responsive/dist/esm/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
function CustomerTestimonials() {
    _s();
    const isMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"])({
        query: '(max-width: 768px)'
    });
    const data = [
        {
            id: 1,
            customer_name: "Priya & Arjun",
            customer_occupation: "NRI Investors",
            customer_voice: "Felt Right Instantly",
            customer_voice2: "We moved from overseas and found not just a home, but a community. Our kids have friends. We have peace.",
            color: "#7CBB00"
        },
        {
            id: 2,
            customer_name: "Kiran Reddy",
            customer_occupation: "Tech Entrepreneur",
            customer_voice: "Perfect Blend of Life",
            customer_voice2: "Urban Ranch was love at first sight. Where else do you find the luxury of a serene green space close to Abibatla TCS?",
            color: "#F79F24"
        },
        {
            id: 3,
            customer_name: "Meera & Sanjay",
            customer_occupation: "Business Owners",
            customer_voice: "Luxury with a Heart",
            customer_voice2: "A combination of a sleek design and rooted lifestyle was what we were looking for. Urban Ranch gave us that exactly!",
            color: "#00A1F1"
        }
    ];
    const getInitials = (fullName)=>{
        const words = fullName.split(" ");
        const initials = words.filter((word)=>word[0]?.toUpperCase() !== "&").map((word)=>word[0]?.toUpperCase()).join("");
        return initials.slice(0, 2);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "container py-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "fw-semibold Title",
                children: "Customer Testimonials"
            }, void 0, false, {
                fileName: "[project]/src/Components/CustomerTestimonials.js",
                lineNumber: 46,
                columnNumber: 13
            }, this),
            isMobile ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "fw-bold mb-3 Heading",
                children: [
                    "Built with Heart.",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                        fileName: "[project]/src/Components/CustomerTestimonials.js",
                        lineNumber: 47,
                        columnNumber: 78
                    }, this),
                    " Backed by Trust."
                ]
            }, void 0, true, {
                fileName: "[project]/src/Components/CustomerTestimonials.js",
                lineNumber: 47,
                columnNumber: 24
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "fw-bold mb-3 Heading",
                children: "Built with Heart. Backed by Trust."
            }, void 0, false, {
                fileName: "[project]/src/Components/CustomerTestimonials.js",
                lineNumber: 47,
                columnNumber: 107
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "row g-4",
                children: data.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "col-6 col-md-4 ",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border rounded-2 h-100 rounded-md-4 p-2 p-md-4 d-flex flex-column justify-content-between shadow-sm ",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "h5 fw-semibold mb-1 mb-md-3",
                                            style: {
                                                fontSize: isMobile ? 10 : 24
                                            },
                                            children: item.customer_voice
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/CustomerTestimonials.js",
                                            lineNumber: 53,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-secondary",
                                            style: {
                                                fontSize: isMobile ? 8 : 18
                                            },
                                            children: item.customer_voice2
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/CustomerTestimonials.js",
                                            lineNumber: 54,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/Components/CustomerTestimonials.js",
                                    lineNumber: 52,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "d-flex align-items-center mt-2 mt-md-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-circle d-flex align-items-center justify-content-center me-3",
                                                style: {
                                                    backgroundColor: item.color,
                                                    width: isMobile ? "25.5px" : "51px",
                                                    height: isMobile ? "25.5px" : "51px",
                                                    fontSize: isMobile ? "9px" : "18px",
                                                    fontWeight: "600",
                                                    color: "white"
                                                },
                                                children: getInitials(item.customer_name)
                                            }, void 0, false, {
                                                fileName: "[project]/src/Components/CustomerTestimonials.js",
                                                lineNumber: 58,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/CustomerTestimonials.js",
                                            lineNumber: 57,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mb-0 fw-semibold",
                                                    style: {
                                                        fontSize: isMobile ? 8 : 18
                                                    },
                                                    children: item.customer_name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/Components/CustomerTestimonials.js",
                                                    lineNumber: 74,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mb-0 text-muted small",
                                                    style: {
                                                        fontSize: isMobile ? 8 : 18
                                                    },
                                                    children: item.customer_occupation
                                                }, void 0, false, {
                                                    fileName: "[project]/src/Components/CustomerTestimonials.js",
                                                    lineNumber: 75,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/Components/CustomerTestimonials.js",
                                            lineNumber: 73,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/Components/CustomerTestimonials.js",
                                    lineNumber: 56,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/Components/CustomerTestimonials.js",
                            lineNumber: 51,
                            columnNumber: 25
                        }, this)
                    }, item.id, false, {
                        fileName: "[project]/src/Components/CustomerTestimonials.js",
                        lineNumber: 50,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/Components/CustomerTestimonials.js",
                lineNumber: 48,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/Components/CustomerTestimonials.js",
        lineNumber: 45,
        columnNumber: 9
    }, this);
}
_s(CustomerTestimonials, "7khsyUHgctuHIPa2/KlDS6LcnT0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"]
    ];
});
_c = CustomerTestimonials;
var _c;
__turbopack_context__.k.register(_c, "CustomerTestimonials");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/c6.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/c6.34953243.png");}}),
"[project]/src/assets/c6.png.mjs { IMAGE => \"[project]/src/assets/c6.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c6$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/c6.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c6$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 537,
    height: 455,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAHCAYAAAA1WQxeAAAA7ElEQVR42g3KTUvCcADA4f+X6uQhEDt0GpiWvRBGaODQUmpQa4MNp7ayubSSqBWMTq03GyO6JESdii7dOgR9j/HT03N5xPD7Pw4//giGv/jPP7g3n3RvvzAu31H6b7F4iF55GoRE0QuDxxDv7ALPD1B1g4btIrTtPLVyjuOuQ++wwb1/SnB1xHJ6ms1CBjGfniQrJXAsBWtHxuu1uBsnpbJGdTWLkKQkqdQEuZkpVhYz5BdmWZeLVOUCG8U5hGlq2E2dzr7B+Umba68/1sE9qKPvlhDJVCIul5bYqlUwNJW9ukHHbtJuWZi6Go8A11qPPQTNEuUAAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 7
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/Components/ContactUs.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>ContactUs)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c6$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$c6$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/c6.png.mjs { IMAGE => "[project]/src/assets/c6.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-responsive/dist/esm/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
function ContactUs() {
    _s();
    const isMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"])({
        query: "(max-width: 768px)"
    });
    const isSMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"])({
        query: "(max-width: 500px)"
    });
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])({
        name: "",
        phone: "",
        date: "",
        email: ""
    });
    const handleChange = (e)=>{
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("phone", form.phone);
            formData.append("message", "Schedule Date is: " + form.date);
            formData.append("email", form.email);
            formData.append("property", "Urban Ranch");
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].post("https://irarealty.in/cms/api/submitContact", formData);
            alert("Submitted successfully!");
            setForm({
                name: "",
                phone: "",
                date: "",
                email: ""
            });
        } catch (error) {
            console.error("Submission error", error);
            alert("Something went wrong. Please try again.");
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "container-fluid text-white py-5",
        id: "contact-us",
        style: {
            backgroundColor: "var(--amenitiesbg)"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "row g-5 align-items-start justify-content-center px-4",
            children: [
                !isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "col-lg-6 d-flex justify-content-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                        src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$c6$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$c6$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                        alt: "Contact Banner",
                        className: "img-fluid rounded-3"
                    }, void 0, false, {
                        fileName: "[project]/src/Components/ContactUs.js",
                        lineNumber: 41,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/Components/ContactUs.js",
                    lineNumber: 40,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "col-lg-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "fw-bold mb-3 contactus_title",
                            children: "Ready to Make a Move?"
                        }, void 0, false, {
                            fileName: "[project]/src/Components/ContactUs.js",
                            lineNumber: 46,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "fs-5 mb-4 contactus_sh",
                            children: "Choose the villa lifestyle that blends luxury with legacy."
                        }, void 0, false, {
                            fileName: "[project]/src/Components/ContactUs.js",
                            lineNumber: 47,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleSubmit,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "row g-3 mb-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "col-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                name: "name",
                                                className: "form-control contactus_input",
                                                placeholder: "Name",
                                                value: form.name,
                                                onChange: handleChange,
                                                required: true
                                            }, void 0, false, {
                                                fileName: "[project]/src/Components/ContactUs.js",
                                                lineNumber: 54,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/ContactUs.js",
                                            lineNumber: 53,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "col-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "email",
                                                name: "email",
                                                className: "form-control contactus_input",
                                                placeholder: "Email ID",
                                                value: form.email,
                                                onChange: handleChange,
                                                required: true
                                            }, void 0, false, {
                                                fileName: "[project]/src/Components/ContactUs.js",
                                                lineNumber: 65,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/ContactUs.js",
                                            lineNumber: 64,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/Components/ContactUs.js",
                                    lineNumber: 52,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "row g-3 mb-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "col-md-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "tel",
                                                name: "phone",
                                                className: "form-control contactus_input",
                                                placeholder: "Phone",
                                                value: form.phone,
                                                onChange: handleChange,
                                                required: true
                                            }, void 0, false, {
                                                fileName: "[project]/src/Components/ContactUs.js",
                                                lineNumber: 79,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/ContactUs.js",
                                            lineNumber: 78,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "col-md-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "date",
                                                name: "date",
                                                className: "form-control contactus_input",
                                                value: form.date,
                                                onChange: handleChange,
                                                required: true
                                            }, void 0, false, {
                                                fileName: "[project]/src/Components/ContactUs.js",
                                                lineNumber: 90,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/ContactUs.js",
                                            lineNumber: 89,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/Components/ContactUs.js",
                                    lineNumber: 77,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "form-check text-start mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            className: "form-check-input",
                                            type: "checkbox",
                                            id: "authorization"
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/ContactUs.js",
                                            lineNumber: 102,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "form-check-label",
                                            htmlFor: "authorization",
                                            children: "I authorize representatives of Urban Ranch to Call, SMS, Email or WhatsApp me about its products and offers. This consent overrides any registration for DNC/NDNC."
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/ContactUs.js",
                                            lineNumber: 103,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/Components/ContactUs.js",
                                    lineNumber: 101,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "d-flex flex-nowrap gap-3 justify-content-start",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            className: "custom-btn contactus_s_btn",
                                            children: isSMobile ? "Book a visit" : "Schedule your site visit"
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/ContactUs.js",
                                            lineNumber: 110,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: "custom-btn contactus_fp_btn",
                                            children: "Download Floor Plans"
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/ContactUs.js",
                                            lineNumber: 113,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/Components/ContactUs.js",
                                    lineNumber: 109,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/Components/ContactUs.js",
                            lineNumber: 51,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/Components/ContactUs.js",
                    lineNumber: 45,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/Components/ContactUs.js",
            lineNumber: 38,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/Components/ContactUs.js",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_s(ContactUs, "qlnoMuBmsiefAKB8tfrMCpGGJFM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"]
    ];
});
_c = ContactUs;
var _c;
__turbopack_context__.k.register(_c, "ContactUs");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/About Images/aboutimg1.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/aboutimg1.096e102e.png");}}),
"[project]/src/assets/About Images/aboutimg1.png.mjs { IMAGE => \"[project]/src/assets/About Images/aboutimg1.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg1$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/About Images/aboutimg1.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg1$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 301,
    height: 343,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAICAYAAAA1BOUGAAAA80lEQVR42gHoABf/AOO1x/nktMf/3KzD/9isxP/Vq8T/1KvE/86pwvkA/MLE//u/wv/1uL7/7bG8/+Kquf/PorH/zaW0/wD10cr/4b+3/+O9tf/SrKf/nYJ+/5+Mfv+hkIX/AJODdP+bi3X/d29l/3FnXf90ZlP/opFz/6yegf8AiHZd/5qFaf9fTkr/cmNa/4d5ZP+Tfmb/npB4/wBeTTf/cltC/1lLPv9VRzX/XEsw/3NOMP9rXUr/ACMhH/8qJiL/JSQd/yIhGf8qJRz/LSUe/yglIf8AGBga+RkZGv8XFxf/FRUW/xUUFP8XFhT/HBsb+T1ehYU62eB2AAAAAElFTkSuQmCC",
    blurWidth: 7,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/About Images/aboutimg2.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/aboutimg2.0b4897d6.png");}}),
"[project]/src/assets/About Images/aboutimg2.png.mjs { IMAGE => \"[project]/src/assets/About Images/aboutimg2.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg2$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/About Images/aboutimg2.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg2$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 225,
    height: 343,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAICAYAAAAx8TU7AAAAqklEQVR42gWAywoBUQBA75/IQhRZcZGxMYRhYjyuV4xnSjJKiZqFJH7A1srGWn7Axt7vzOZImIe3Z+5fFJ0H1dMH6/L1hKFWGDWbgtGk7z6xbz9EpdygUSmTz+YYDOdszndEvdrCVnXMYolR28J1pohhu8tyoOhZJitbcd0tEOt5j+2iw3KicGZNjtsxIq0l0DKSRFIikzHiKYnwBcKePxglFJFoaR1dN7w/YUdR0jn4HHoAAAAASUVORK5CYII=",
    blurWidth: 5,
    blurHeight: 8
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/assets/About Images/aboutimg3.png (static in ecmascript)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v("/_next/static/media/aboutimg3.abf17023.png");}}),
"[project]/src/assets/About Images/aboutimg3.png.mjs { IMAGE => \"[project]/src/assets/About Images/aboutimg3.png (static in ecmascript)\" } [client] (structured image object, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg3$2e$png__$28$static__in__ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/About Images/aboutimg3.png (static in ecmascript)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg3$2e$png__$28$static__in__ecmascript$29$__["default"],
    width: 537,
    height: 273,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAECAYAAACzzX7wAAAAj0lEQVR42gGEAHv/ANbY4f3X2eP/09jj/8fR3v+7w87/qrrN/6S80/+Qr8z9AMbFyP/U09b/w8XH/6yno/+ZkZD/foGN/3qBiP9/j53/AFhaXv9cX2D/cW1l/3tvZP9yZWD/aGRk/1JQTv9SU1X/AEhPXf1XYHD/cXV+/2Rncf9gY3H/YWVw/0hNV/9AQU39J6xUL6fUed4AAAAASUVORK5CYII=",
    blurWidth: 8,
    blurHeight: 4
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/Components/About.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>About)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg1$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg1$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/About Images/aboutimg1.png.mjs { IMAGE => "[project]/src/assets/About Images/aboutimg1.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg2$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg2$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/About Images/aboutimg2.png.mjs { IMAGE => "[project]/src/assets/About Images/aboutimg2.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg3$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg3$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/About Images/aboutimg3.png.mjs { IMAGE => "[project]/src/assets/About Images/aboutimg3.png (static in ecmascript)" } [client] (structured image object, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$ci$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/ci/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-responsive/dist/esm/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
function About() {
    _s();
    const isMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"])({
        query: '(max-width: 1240px)'
    });
    const isSMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"])({
        query: '(max-width: 500px)'
    });
    const projects = [
        {
            name: "IRA The Square Villas",
            area: "Kongarakalan"
        },
        {
            name: "Moonglade Apartments",
            area: "Narsingi"
        },
        {
            name: "IRA Elevate Villas",
            area: "Shamshabad"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "container-fluid py-5 px-5 bg-light d-flex justify-content-center align-items-center ",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "row gx-5 align-items-start flex-column-reverse flex-lg-row",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "col-lg-6 d-flex flex-column gap-2 gap-md-3 justify-content-end align-items-end",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "d-flex gap-2 gap-md-3 align-items-md-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg1$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg1$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                                    alt: "About Image 1",
                                    className: "img-fluid rounded abtimg",
                                    style: {
                                        width: !isMobile ? 301 : "55%"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/Components/About.js",
                                    lineNumber: 24,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg2$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg2$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                                    alt: "About Image 2",
                                    className: "img-fluid rounded",
                                    style: {
                                        width: !isMobile ? 225 : "41%"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/Components/About.js",
                                    lineNumber: 30,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/Components/About.js",
                            lineNumber: 23,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                            src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg3$2e$png$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$About__Images$2f$aboutimg3$2e$png__$28$static__in__ecmascript$2922$__$7d$__$5b$client$5d$__$28$structured__image__object$2c$__ecmascript$29$__["default"],
                            alt: "About Image 3",
                            className: "img-fluid rounded ",
                            style: {
                                width: !isMobile ? 537 : "100%"
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/Components/About.js",
                            lineNumber: 37,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/Components/About.js",
                    lineNumber: 22,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "col-lg-6 d-flex flex-column gap-3 gap-xl-4 mt-xl-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "fw-semibold mb-0 Title",
                            children: "About IRA Realty"
                        }, void 0, false, {
                            fileName: "[project]/src/Components/About.js",
                            lineNumber: 47,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: " fw-bold Heading",
                            children: "Building Homes. Nurturing Communities."
                        }, void 0, false, {
                            fileName: "[project]/src/Components/About.js",
                            lineNumber: 48,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: " text-secondary aboutdata",
                            children: "At IRA Realty, we're redefining real estate with transparency, trust, and transformative design."
                        }, void 0, false, {
                            fileName: "[project]/src/Components/About.js",
                            lineNumber: 51,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "h4 text-dark mt-lg-4",
                            children: "Our Landmark Projects:"
                        }, void 0, false, {
                            fileName: "[project]/src/Components/About.js",
                            lineNumber: 55,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            className: "list-unstyled mt-lg-3 d-flex flex-column aboutdata ",
                            style: {
                                gap: 10
                            },
                            children: projects.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    className: "d-flex align-items-center mb-lg-3 text-secondary",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "d-flex justify-content-center align-items-center bg-success text-white rounded-circle me-3",
                                                style: {
                                                    width: isSMobile ? 20 : 38,
                                                    height: isSMobile ? 20 : 38
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$ci$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["CiLocationOn"], {
                                                    size: isSMobile ? 14 : 24
                                                }, void 0, false, {
                                                    fileName: "[project]/src/Components/About.js",
                                                    lineNumber: 68,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/Components/About.js",
                                                lineNumber: 64,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/Components/About.js",
                                            lineNumber: 63,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "fw-bold text-dark",
                                            children: [
                                                item.name,
                                                " —",
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "fw-normal text-muted",
                                                    children: item.area
                                                }, void 0, false, {
                                                    fileName: "[project]/src/Components/About.js",
                                                    lineNumber: 74,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/Components/About.js",
                                            lineNumber: 72,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, index, true, {
                                    fileName: "[project]/src/Components/About.js",
                                    lineNumber: 59,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/Components/About.js",
                            lineNumber: 57,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/Components/About.js",
                    lineNumber: 46,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/Components/About.js",
            lineNumber: 20,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/Components/About.js",
        lineNumber: 18,
        columnNumber: 3
    }, this);
}
_s(About, "dvUubXC+ic7WqL4iBG66CHQmLIo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$responsive$2f$dist$2f$esm$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMediaQuery"]
    ];
});
_c = About;
var _c;
__turbopack_context__.k.register(_c, "About");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/pages/index.js [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Home)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_b6f6e40c$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[next]/internal/font/google/geist_b6f6e40c.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_mono_5fbb1682$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[next]/internal/font/google/geist_mono_5fbb1682.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/styles/Home.module.css [client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$Header$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Components/Header.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$Home$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Components/Home.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$VillaSpecs$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Components/VillaSpecs.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$Component3$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Components/Component3.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$Amanities$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Components/Amanities.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$Gallery$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Components/Gallery.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$SmartLiving$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Components/SmartLiving.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$MasterPlan$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Components/MasterPlan.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$LocationAdvantages$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Components/LocationAdvantages.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$CustomerTestimonials$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Components/CustomerTestimonials.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$ContactUs$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Components/ContactUs.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$About$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Components/About.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dynamic$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dynamic.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const Footer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dynamic$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.r("[project]/src/Components/Footer.js [client] (ecmascript, next/dynamic entry, async loader)")(__turbopack_context__.i), {
    loadableGenerated: {
        modules: [
            "[project]/src/Components/Footer.js [client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = Footer;
const Component8 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dynamic$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.r("[project]/src/Components/Component8.js [client] (ecmascript, next/dynamic entry, async loader)")(__turbopack_context__.i), {
    loadableGenerated: {
        modules: [
            "[project]/src/Components/Component8.js [client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c1 = Component8;
const LoadingSpinner = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dynamic$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"])(_c2 = ()=>__turbopack_context__.r("[project]/src/Components/LoadingPage.js [client] (ecmascript, next/dynamic entry, async loader)")(__turbopack_context__.i), {
    loadableGenerated: {
        modules: [
            "[project]/src/Components/LoadingPage.js [client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c3 = LoadingSpinner;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].page} ${__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_b6f6e40c$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].variable} ${__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$geist_mono_5fbb1682$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].variable} `,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].main,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$Header$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 38,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$Home$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 39,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/pages/index.js",
                    lineNumber: 37,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].bodyComp,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$VillaSpecs$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 42,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$Component3$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 43,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$Amanities$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 44,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$Gallery$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 45,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$SmartLiving$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 46,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$MasterPlan$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 47,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Component8, {}, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 48,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$LocationAdvantages$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 49,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$CustomerTestimonials$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 50,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$ContactUs$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 51,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Components$2f$About$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 52,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Footer, {}, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/pages/index.js",
                    lineNumber: 41,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/pages/index.js",
            lineNumber: 36,
            columnNumber: 7
        }, this)
    }, void 0, false);
}
_c4 = Home;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "Footer");
__turbopack_context__.k.register(_c1, "Component8");
__turbopack_context__.k.register(_c2, "LoadingSpinner$dynamic");
__turbopack_context__.k.register(_c3, "LoadingSpinner");
__turbopack_context__.k.register(_c4, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/src/pages/index.js [client] (ecmascript)\" } [client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const PAGE_PATH = "/";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/src/pages/index.js [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}}),
"[project]/src/pages/index (hmr-entry)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, m: module } = __turbopack_context__;
{
__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/src/pages/index.js [client] (ecmascript)\" } [client] (ecmascript)");
}}),
}]);

//# sourceMappingURL=%5Broot-of-the-server%5D__d56f0e29._.js.map