import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateList, useLists } from "../../features/lists/hooks";

export default function ListsPage() {
    const navigate = useNavigate();
    const { data: lists, isLoading, isError, error } = useLists();
    const createMut = useCreateList();

    const [title, setTitle] = useState("");

    const canCreate = title.trim().length > 0 && !createMut.isPending;

    async function onCreate(e) {
        e.preventDefault();
        const t = title.trim();
        if (!t) return;
        await createMut.mutateAsync(t);
        setTitle("");
    }

    const sorted = useMemo(() => lists ?? [], [lists]);

    return (
        <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
            <h2 style={{ marginBottom: 12 }}>Shopping Lists</h2>

            <form onSubmit={onCreate} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. This week, A-mart..."
                    style={{ flex: 1, padding: 10 }}
                />
                <button type="submit" disabled={!canCreate} style={{ padding: "10px 14px" }}>
                    {createMut.isPending ? "Creating..." : "Create"}
                </button>
            </form>

            {isLoading && <div>Loading...</div>}
            {isError && (
                <div style={{ color: "crimson" }}>
                    Failed to load lists: {String(error?.message || error)}
                </div>
            )}

            <div style={{ display: "grid", gap: 10 }}>
                {sorted.map((list) => (
                    <button
                        key={list.id}
                        onClick={() => navigate(`/lists/${list.id}`)}
                        style={{
                            textAlign: "left",
                            padding: 12,
                            borderRadius: 10,
                            border: "1px solid #ddd",
                            background: "white",
                            cursor: "pointer",
                        }}
                    >
                        <div style={{ fontWeight: 600 }}>{list.title}</div>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>{list.id}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}
