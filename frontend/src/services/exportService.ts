import { DesignPage } from "@/types";
import { renderPageToDataUrl } from "@/utils/canvasExport";

export const exportService = {
  /** Triggers a browser download of the page as a PNG file. */
  async downloadAsPng(page: DesignPage, filename = "design.png"): Promise<void> {
    const dataUrl = await renderPageToDataUrl(page);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
  },

  /** Serializes the page to a JSON file the user can re-import later. */
  downloadAsJson(page: DesignPage, filename = "design.json"): void {
    const blob = new Blob([JSON.stringify(page, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  /** Produces a lightweight thumbnail data URL for the project gallery. */
  async generateThumbnail(page: DesignPage): Promise<string> {
    return renderPageToDataUrl(page);
  },
};
