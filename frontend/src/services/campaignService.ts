import {
  CanvasElement,
  DesignPage,
} from "@/types";

export type CampaignFormat =
  | "instagram-post"
  | "instagram-story"
  | "linkedin-post"
  | "youtube-thumbnail"
  | "facebook-post";

export interface CampaignFormatDefinition {
  id: CampaignFormat;
  name: string;
  description: string;
  width: number;
  height: number;
}

export interface CampaignVariant {
  id: string;
  format: CampaignFormat;
  name: string;
  description: string;
  width: number;
  height: number;
  page: DesignPage;
}

/* =========================================================
   FORMAT DEFINITIONS
   ========================================================= */

export const CAMPAIGN_FORMATS: CampaignFormatDefinition[] = [
  {
    id: "instagram-post",
    name: "Instagram Post",
    description: "Square social post",
    width: 1080,
    height: 1080,
  },
  {
    id: "instagram-story",
    name: "Instagram Story",
    description: "Vertical story format",
    width: 1080,
    height: 1920,
  },
  {
    id: "linkedin-post",
    name: "LinkedIn Post",
    description: "Professional landscape post",
    width: 1200,
    height: 627,
  },
  {
    id: "youtube-thumbnail",
    name: "YouTube Thumbnail",
    description: "Video thumbnail",
    width: 1280,
    height: 720,
  },
  {
    id: "facebook-post",
    name: "Facebook Post",
    description: "Landscape social post",
    width: 1200,
    height: 630,
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

function cloneElements(
  elements: CanvasElement[]
): CanvasElement[] {
  return elements.map((element) => ({
    ...element,
  }));
}

function scaleElement(
  element: CanvasElement,
  scaleX: number,
  scaleY: number
): CanvasElement {
  return {
    ...element,
    x: Math.round(element.x * scaleX),
    y: Math.round(element.y * scaleY),
    width: Math.max(
      1,
      Math.round(element.width * scaleX)
    ),
    height: Math.max(
      1,
      Math.round(element.height * scaleY)
    ),
  };
}

/* =========================================================
   SMART POSITIONING
   ========================================================= */

function fitElementsToFormat(
  elements: CanvasElement[],
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): CanvasElement[] {
  const scaleX =
    targetWidth / sourceWidth;

  const scaleY =
    targetHeight / sourceHeight;

  /*
   * Using the smaller scale keeps the original
   * composition visually consistent.
   */
  const uniformScale =
    Math.min(scaleX, scaleY);

  const scaledWidth =
    sourceWidth * uniformScale;

  const scaledHeight =
    sourceHeight * uniformScale;

  const offsetX =
    (targetWidth - scaledWidth) / 2;

  const offsetY =
    (targetHeight - scaledHeight) / 2;

  return cloneElements(
    elements
  ).map((element) => ({
    ...element,

    x: Math.round(
      element.x * uniformScale +
        offsetX
    ),

    y: Math.round(
      element.y * uniformScale +
        offsetY
    ),

    width: Math.max(
      1,
      Math.round(
        element.width *
          uniformScale
      )
    ),

    height: Math.max(
      1,
      Math.round(
        element.height *
          uniformScale
      )
    ),

    rotation:
      element.rotation,
  }));
}

/* =========================================================
   STORY OPTIMIZATION
   ========================================================= */

function createStoryLayout(
  elements: CanvasElement[],
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): CanvasElement[] {
  const scale =
    Math.min(
      targetWidth / sourceWidth,
      targetHeight / sourceHeight
    );

  const scaledWidth =
    sourceWidth * scale;

  const scaledHeight =
    sourceHeight * scale;

  const offsetX =
    (targetWidth - scaledWidth) / 2;

  const offsetY =
    (targetHeight - scaledHeight) / 2;

  return cloneElements(
    elements
  ).map((element) => {
    let x =
      element.x * scale +
      offsetX;

    let y =
      element.y * scale +
      offsetY;

    let width =
      element.width * scale;

    let height =
      element.height * scale;

    /*
     * Story layouts have much more
     * vertical space, so give the composition
     * a little breathing room.
     */
    if (
      targetHeight >
      targetWidth * 1.5
    ) {
      y +=
        targetHeight *
        0.08;
    }

    return {
      ...element,

      x: Math.round(x),
      y: Math.round(y),

      width: Math.max(
        1,
        Math.round(width)
      ),

      height: Math.max(
        1,
        Math.round(height)
      ),
    };
  });
}

/* =========================================================
   GENERATE SINGLE VARIANT
   ========================================================= */

export function generateCampaignVariant(
  page: DesignPage,
  format: CampaignFormatDefinition
): CampaignVariant {
  const sourceWidth =
    page.size.width;

  const sourceHeight =
    page.size.height;

  let elements: CanvasElement[];

  if (
    format.id ===
    "instagram-story"
  ) {
    elements =
      createStoryLayout(
        page.elements,
        sourceWidth,
        sourceHeight,
        format.width,
        format.height
      );
  } else {
    elements =
      fitElementsToFormat(
        page.elements,
        sourceWidth,
        sourceHeight,
        format.width,
        format.height
      );
  }

  const nextPage: DesignPage = {
  ...page,

  id: `campaign-${format.id}-${Date.now()}`,

  name: format.name,

  size: page.size,

  elements,
};

  return {
    id: `variant-${format.id}-${Date.now()}`,

    format: format.id,

    name: format.name,

    description:
      format.description,

    width: format.width,

    height: format.height,

    page: nextPage,
  };
}

/* =========================================================
   GENERATE CAMPAIGN
   ========================================================= */

export function generateCampaign(
  page: DesignPage,
  formats: CampaignFormat[] =
    CAMPAIGN_FORMATS.map(
      (format) => format.id
    )
): CampaignVariant[] {
  return formats
    .map((formatId) => {
      const format =
        CAMPAIGN_FORMATS.find(
          (item) =>
            item.id === formatId
        );

      if (!format) {
        return null;
      }

      return generateCampaignVariant(
        page,
        format
      );
    })
    .filter(
      (
        variant
      ): variant is CampaignVariant =>
        variant !== null
    );
}