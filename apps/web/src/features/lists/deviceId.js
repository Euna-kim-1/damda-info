const KEY = "device_id";

// create a unique id for the device
function generateId() {
    // 1) modern browsers
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    // 2) crypto.getRandomValues fallback (mostly supported)
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;

        const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }

    // 3) last fallback (dev only)
    return `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getDeviceId() {
    let id = localStorage.getItem(KEY);
    if (!id) {
        id = generateId();
        localStorage.setItem(KEY, id);
    }
    return id;
}
