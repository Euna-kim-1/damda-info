import { apiDelete, apiGet, apiPatchJson, apiPostJson } from "../../shared/api/client";
import { getDeviceId } from "./deviceId";

// Lists
export async function fetchLists() {
    const deviceId = getDeviceId();
    const data = await apiGet(`/lists?device_id=${encodeURIComponent(deviceId)}`);
    return data.lists;
}

export async function createList(title) {
    const deviceId = getDeviceId();
    const data = await apiPostJson("/lists", { device_id: deviceId, title });
    return data.list;
}

export async function deleteList(listId) {
    const deviceId = getDeviceId();
    const data = await apiDelete(
        `/lists/${encodeURIComponent(listId)}?device_id=${encodeURIComponent(deviceId)}`
    );
    return data.list;
}

// Items
export async function fetchListItems(listId) {
    const deviceId = getDeviceId();
    const data = await apiGet(
        `/lists/${encodeURIComponent(listId)}/items?device_id=${encodeURIComponent(deviceId)}`
    );
    return data.items;
}

export async function createListItem(listId, name, note = null) {
    const deviceId = getDeviceId();
    const data = await apiPostJson(`/lists/${encodeURIComponent(listId)}/items`, {
        device_id: deviceId,
        name,
        note,
    });
    return data.item;
}

export async function updateListItem(itemId, patch) {
    const deviceId = getDeviceId();
    const data = await apiPatchJson(`/items/${encodeURIComponent(itemId)}`, {
        device_id: deviceId,
        ...patch,
    });
    return data.item;
}

export async function deleteListItem(itemId) {
    const deviceId = getDeviceId();
    const data = await apiDelete(
        `/items/${encodeURIComponent(itemId)}?device_id=${encodeURIComponent(deviceId)}`
    );
    return data.item;
}
