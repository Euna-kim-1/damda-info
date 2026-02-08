import { apiDelete, apiGet, apiPatchJson, apiPostJson } from '../../shared/api/client';
import { getDeviceId } from './deviceId';

const appendDeviceIdQuery = (path) => {
  const deviceId = encodeURIComponent(getDeviceId());
  const joiner = path.includes('?') ? '&' : '?';
  return `${path}${joiner}device_id=${deviceId}`;
};

// Lists
export const fetchLists = async () => {
  const data = await apiGet(appendDeviceIdQuery('/lists'));
  return data.lists;
};

export const createList = async (title) => {
  const deviceId = getDeviceId();
  const data = await apiPostJson('/lists', { device_id: deviceId, title });
  return data.list;
};

export const deleteList = async (listId) => {
  const data = await apiDelete(
    appendDeviceIdQuery(`/lists/${encodeURIComponent(listId)}`),
  );
  return data.list;
};

// Items
export const fetchListItems = async (listId) => {
  const data = await apiGet(
    appendDeviceIdQuery(`/lists/${encodeURIComponent(listId)}/items`),
  );
  return data.items;
};

export const createListItem = async (listId, name, note = null) => {
  const deviceId = getDeviceId();
  const data = await apiPostJson(`/lists/${encodeURIComponent(listId)}/items`, {
    device_id: deviceId,
    name,
    note,
  });
  return data.item;
};

export const updateListItem = async (itemId, patch) => {
  const deviceId = getDeviceId();
  const data = await apiPatchJson(`/items/${encodeURIComponent(itemId)}`, {
    device_id: deviceId,
    ...patch,
  });
  return data.item;
};

export const deleteListItem = async (itemId) => {
  const data = await apiDelete(
    appendDeviceIdQuery(`/items/${encodeURIComponent(itemId)}`),
  );
  return data.item;
};
