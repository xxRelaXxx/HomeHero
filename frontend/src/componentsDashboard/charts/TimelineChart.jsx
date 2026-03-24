import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const CHART_ANIMATION_BEGIN_MS = 180;
const CHART_ANIMATION_DURATION_MS = 2400;
const CHART_INTERACTION_RESET_MS = 320;

// Props attese:
// - data: array di dati temporali
// - dataKey: chiave del valore da visualizzare
// - color: colore principale del grafico
// - unit: unita di misura (C, %, ppm, ecc.)

const TimelineChart = memo(function TimelineChart({ data, dataKey, color, unit }) {
  // Stato che indica se l'utente sta interagendo col grafico (mouse sopra)
  // Serve per bloccare animazioni mentre si legge il tooltip
  const [isInteracting, setIsInteracting] = useState(false);

  // Ref per gestire un timeout manuale senza causare re-render
  const interactTimer = useRef(null);

  // Cleanup: quando il componente viene smontato evitiamo memory leak
  useEffect(() => () => clearTimeout(interactTimer.current), []);

  // ID univoco del gradiente, legato al tipo di dato visualizzato
  const gradientId = useMemo(() => `grad-${dataKey}`, [dataKey]);

  // Chiave usata per l'asse X: fullTime deve essere un timestamp ISO univoco
  const xKey = "fullTime";

  // Formatter dei tick sull'asse X
  const tickFormatter = useCallback(
    (iso) =>
      new Date(iso).toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  // Formatter del valore nel tooltip
  const tooltipFormatter = useCallback((v) => [Number(v).toFixed(1), unit], [unit]);

  // Formatter dell'etichetta temporale nel tooltip
  const labelFormatter = useCallback(
    (iso) =>
      new Date(iso).toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  // Ogni movimento del mouse blocca temporaneamente il redraw animato
  const markInteracting = useCallback(() => {
    setIsInteracting(true);
    clearTimeout(interactTimer.current);
    interactTimer.current = setTimeout(
      () => setIsInteracting(false),
      CHART_INTERACTION_RESET_MS
    );
  }, []);

  if (!data?.length) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-slate-600 text-xs font-mono">
        ACQUIRING DATA...
      </div>
    );
  }

  return (
    <div className="w-full h-48 bg-[var(--hh-chart-bg)] rounded border border-[var(--hh-border)] p-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          onMouseMove={markInteracting}
          onMouseLeave={() => setIsInteracting(false)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--hh-chart-grid)"
          />

          <XAxis
            dataKey={xKey}
            tickFormatter={tickFormatter}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--hh-chart-tick)", fontSize: 10 }}
            interval="preserveStartEnd"
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--hh-chart-tick)", fontSize: 10 }}
            domain={["auto", "auto"]}
          />

          <Tooltip
            isAnimationActive={false}
            contentStyle={{
              backgroundColor: "var(--hh-tooltip-bg)",
              border: "1px solid var(--hh-control-border)",
              borderRadius: 4,
            }}
            itemStyle={{ color: "var(--hh-text)" }}
            labelStyle={{ color: "var(--hh-muted)", fontSize: 10 }}
            formatter={tooltipFormatter}
            labelFormatter={labelFormatter}
          />

          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3 }}
            isAnimationActive={!isInteracting}
            // Disegno piu lento e progressivo per far leggere meglio il tracciato.
            animationBegin={CHART_ANIMATION_BEGIN_MS}
            animationDuration={CHART_ANIMATION_DURATION_MS}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

export default TimelineChart;
