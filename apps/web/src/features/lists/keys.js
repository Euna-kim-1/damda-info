export const listKeys = {
    all: ["lists"],
    lists: (deviceId) => ["lists", deviceId],
    items: (deviceId, listId) => ["list-items", deviceId, listId],
};
