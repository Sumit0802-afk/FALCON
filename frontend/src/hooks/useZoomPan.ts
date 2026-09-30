import { useCallback, useState } from "react";
import { DEFAULT_ZOOM, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from "@/utils/constants";
import { clamp } from "@/utils/geometry";

export function useZoomPan() {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const zoomIn = useCallback(() => setZoom((z) => clamp(z + ZOOM_STEP, ZOOM_MIN, ZOOM_MAX)), []);
  const zoomOut = useCallback(() => setZoom((z) => clamp(z - ZOOM_STEP, ZOOM_MIN, ZOOM_MAX)), []);
  const resetZoom = useCallback(() => {
    setZoom(DEFAULT_ZOOM);
    setPan({ x: 0, y: 0 });
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom((z) => clamp(z - e.deltaY * 0.001, ZOOM_MIN, ZOOM_MAX));
  }, []);

  const panBy = useCallback((dx: number, dy: number) => {
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  /**
   * Fit the design inside the visible container.
   * @param containerW  Available width  (px) – e.g. canvas wrapper clientWidth
   * @param containerH  Available height (px) – e.g. canvas wrapper clientHeight
   * @param designW     Design width  in design-space pixels
   * @param designH     Design height in design-space pixels
   * @param padding     Gap to leave around the design (default 40px each side)
   */
  const fitToScreen = useCallback(
    (
      containerW: number,
      containerH: number,
      designW: number,
      designH: number,
      padding = 40
    ) => {
      const availW = containerW - padding * 2;
      const availH = containerH - padding * 2;
      const fitZoom = clamp(
        Math.min(availW / designW, availH / designH),
        ZOOM_MIN,
        ZOOM_MAX
      );
      setZoom(fitZoom);
      setPan({ x: 0, y: 0 });
    },
    []
  );

  return { zoom, pan, zoomIn, zoomOut, resetZoom, fitToScreen, onWheel, panBy, setZoom, setPan };
}
