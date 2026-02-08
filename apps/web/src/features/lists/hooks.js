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
        onSuccess: (data) => {
            if (!data) return;
            qc.setQueryData(listKeys.items(deviceId, listId), (old = []) => {
                const exists = old.some(
                    (item) => String(item.id) === String(data.id)
                );
                if (exists) {
                    return old.map((item) =>
                        String(item.id) === String(data.id) ? { ...item, ...data } : item
                    );
                }
                return [...old, data];
            });
        },
    });
}

export function useUpdateListItem(listId) {
    const qc = useQueryClient();
    const deviceId = getDeviceId();

    return useMutation({
        mutationFn: ({ itemId, patch }) => updateListItem(itemId, patch),
        onMutate: ({ itemId, patch }) => {
            qc.cancelQueries({ queryKey: listKeys.items(deviceId, listId) });
            const previous = qc.getQueryData(listKeys.items(deviceId, listId));
            qc.setQueryData(listKeys.items(deviceId, listId), (old = []) =>
                old.map((item) =>
                    String(item.id) === String(itemId) ? { ...item, ...patch } : item
                )
            );
            return { previous };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.previous) {
                qc.setQueryData(listKeys.items(deviceId, listId), ctx.previous);
            }
        },
        onSuccess: (data) => {
            if (!data) return;
            qc.setQueryData(listKeys.items(deviceId, listId), (old = []) =>
                old.map((item) =>
                    String(item.id) === String(data.id) ? { ...item, ...data } : item
                )
            );
        },
    });
}

export function useDeleteListItem(listId) {
    const qc = useQueryClient();
    const deviceId = getDeviceId();

    return useMutation({
        mutationFn: (itemId) => deleteListItem(itemId),
        onMutate: async (itemId) => {
            await qc.cancelQueries({ queryKey: listKeys.items(deviceId, listId) });
            const previous = qc.getQueryData(listKeys.items(deviceId, listId));
            qc.setQueryData(listKeys.items(deviceId, listId), (old = []) =>
                old.filter((item) => String(item.id) !== String(itemId))
            );
            return { previous };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.previous) {
                qc.setQueryData(listKeys.items(deviceId, listId), ctx.previous);
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: listKeys.items(deviceId, listId) });
        },
    });
}
