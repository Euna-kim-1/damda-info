import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDeviceId } from "./deviceId";
import { listKeys } from "./keys";
import {
    createList,
    deleteList,
    deleteListItem,
    fetchLists,
    createListItem,
    fetchListItems,
    updateListItem,
} from "./api";

// Lists
export function useLists() {
    const deviceId = getDeviceId();
    return useQuery({
        queryKey: listKeys.lists(deviceId),
        queryFn: fetchLists,
    });
}

export function useCreateList() {
    const qc = useQueryClient();
    const deviceId = getDeviceId();

    return useMutation({
        mutationFn: (title) => createList(title),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: listKeys.lists(deviceId) });
        },
    });
}

export function useDeleteList() {
    const qc = useQueryClient();
    const deviceId = getDeviceId();

    return useMutation({
        mutationFn: (listId) => deleteList(listId),
        onSuccess: (_data, listId) => {
            qc.invalidateQueries({ queryKey: listKeys.lists(deviceId) });
            if (listId) {
                qc.invalidateQueries({ queryKey: listKeys.items(deviceId, listId) });
            }
        },
    });
}

// Items
export function useListItems(listId) {
    const deviceId = getDeviceId();
    return useQuery({
        queryKey: listKeys.items(deviceId, listId),
        queryFn: () => fetchListItems(listId),
        enabled: !!listId,
    });
}

export function useCreateListItem(listId) {
    const qc = useQueryClient();
    const deviceId = getDeviceId();

    return useMutation({
        mutationFn: ({ name, note }) => createListItem(listId, name, note),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: listKeys.items(deviceId, listId) });
        },
    });
}

export function useUpdateListItem(listId) {
    const qc = useQueryClient();
    const deviceId = getDeviceId();

    return useMutation({
        mutationFn: ({ itemId, patch }) => updateListItem(itemId, patch),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: listKeys.items(deviceId, listId) });
        },
    });
}

export function useDeleteListItem(listId) {
    const qc = useQueryClient();
    const deviceId = getDeviceId();

    return useMutation({
        mutationFn: (itemId) => deleteListItem(itemId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: listKeys.items(deviceId, listId) });
        },
    });
}
