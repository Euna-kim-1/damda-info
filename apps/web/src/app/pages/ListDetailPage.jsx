import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateListItem, useListItems, useUpdateListItem } from "../../features/lists/hooks";

export default function ListDetailPage() {
    const navigate = useNavigate();
    const { listId } = useParams();

    const { data: items, isLoading, isError, error } = useListItems(listId);
    const createItemMut = useCreateListItem(listId);
    const updateItemMut = useUpdateListItem(listId);

    const [name, setName] = useState("");

    const canAdd = name.trim().length > 0 && !createItemMut.isPending;

    async function onAdd(e) {
        e.preventDefault();
        const n = name.trim();
        if (!n) return;
        await createItemMut.mutateAsync({ name: n, note: null });
        setName("");
    }

    async function toggle(item) {
        await updateItemMut.mutateAsync({
            itemId: item.id,
            patch: { checked: !item.checked },
        });
    }

    const sorted = useMemo(() => items ?? [], [items]);

    return (
        <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <button onClick={() => navigate("/lists")} style={{ padding: "8px 10px" }}>
                    ← Back
                </button>
                <h2 style={{ margin: 0 }}>List</h2>
            </div>

            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 12 }}>listId: {listId}</div>

            <form onSubmit={onAdd} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Add item… (e.g. green onion)"
                    style={{ flex: 1, padding: 10 }}
                />
                <button type="submit" disabled={!canAdd} style={{ padding: "10px 14px" }}>
                    {createItemMut.isPending ? "Adding..." : "Add"}
                </button>
            </form>

            {isLoading && <div>Loading...</div>}
            {isError && (
                <div style={{ color: "crimson" }}>
                    Failed to load items: {String(error?.message || error)}
                </div>
            )}

            <div style={{ display: "grid", gap: 8 }}>
                {sorted.map((item) => (
                    <label
                        key={item.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: 12,
                            borderRadius: 10,
                            border: "1px solid #ddd",
                            background: "white",
                            cursor: "pointer",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={!!item.checked}
                            onChange={() => toggle(item)}
                            disabled={updateItemMut.isPending}
                        />
                        <span style={{ textDecoration: item.checked ? "line-through" : "none" }}>
                            {item.name}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}
