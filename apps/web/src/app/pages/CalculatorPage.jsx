import { Box, Button, Typography } from "@mui/material";
import { useMemo, useState } from "react";

const OPS = new Set(["+", "-", "x", "÷"]);
const isOp = (v) => OPS.has(v);

export default function CalculatorPage() {
    const [display, setDisplay] = useState("");

    const keys = useMemo(
        () => [
            ["", "7", "8", "9", "+"],
            ["", "4", "5", "6", "-"],
            ["", "1", "2", "3", "÷"],
            ["", "0", ".", "=", "x"],
        ],
        []
    );

    const append = (v) => {
        setDisplay((prev) => {
            if (!v) return prev;
            if (v === "C") return "";
            if (v === "=") return prev;
            if (isOp(v) && isOp(prev.slice(-1))) return prev;
            return prev + v;
        });
    };

    const calc = () => {
        try {
            const expr = display.replaceAll("x", "*").replaceAll("÷", "/");
            // eslint-disable-next-line no-eval
            const result = eval(expr);
            setDisplay(String(!isFinite(result) ? 0 : result));
        } catch {
            setDisplay("Error");
        }
    };

    const onKeyClick = (k) => {
        if (k === "=") return calc();
        return append(k);
    };

    return (
        <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
            {/* Calculator Wrapper */}
            <Box
                sx={{
                    width: 520,
                    borderRadius: 1.5,
                    bgcolor: "#88B7CF",
                    boxShadow: "0 16px 30px rgba(0,0,0,0.25)",
                    p: 3,
                }}
            >
                {/* Top area */}
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    {/* C button */}
                    <Button
                        onClick={() => onKeyClick("C")}
                        sx={{
                            width: 110,
                            minHeight: 70,
                            borderRadius: 1,
                            bgcolor: "#F19AA0",
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: 24,
                            boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.12)",
                            "&:hover": { bgcolor: "#EA7F86" },
                        }}
                    >
                        C
                    </Button>

                    {/* Screen (멀티라인) */}
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 70,
                            borderRadius: 1,
                            bgcolor: "#6E8FA4",
                            px: 2.5,
                            py: 1.5,
                            boxShadow: "inset 0 -5px 0 rgba(0,0,0,0.18)",
                        }}
                    >
                        <Typography
                            sx={{
                                color: "#fff",
                                fontWeight: 800,
                                fontSize: 30,
                                letterSpacing: 0.5,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-all",
                                textAlign: "right",
                            }}
                        >
                            {display || "0"}
                        </Typography>
                    </Box>
                </Box>

                {/* Keys */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: 2,
                    }}
                >
                    {keys.flat().map((k, i) => {
                        if (k === "") return <Box key={`sp-${i}`} />;

                        const isOperator = isOp(k);
                        const isEqual = k === "=";

                        return (
                            <Button
                                key={`${k}-${i}`}
                                onClick={() => onKeyClick(k)}
                                sx={{
                                    height: 64,
                                    borderRadius: 1,
                                    bgcolor: isEqual
                                        ? "#DFF06B"
                                        : isOperator
                                            ? "#F4D3D6"
                                            : "#ffffff",
                                    color: "#2B2B2B",
                                    fontWeight: 800,
                                    fontSize: 22,
                                    boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.12)",
                                    "&:hover": {
                                        bgcolor: isEqual
                                            ? "#D1E84A"
                                            : isOperator
                                                ? "#EEC0C6"
                                                : "#F3F3F3",
                                    },
                                }}
                            >
                                {k}
                            </Button>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
}
