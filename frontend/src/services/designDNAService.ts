import {
  CanvasElement,
  TextElement,
  ShapeElement,
} from "@/types";

import { storageService } from "./storageService";

export interface DesignDNA {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;

  headingFont: string;
  bodyFont: string;

  headingWeight: number;
  bodyWeight: number;

  averageSpacing: number;
  averageCornerRadius: number;

  visualStyle:
    | "minimal"
    | "bold"
    | "editorial"
    | "balanced";

  typographyStyle:
    | "strong"
    | "refined"
    | "neutral";

  elementCount: number;
  textCount: number;
  shapeCount: number;

  generatedAt: string;
}

function isText(
  element: CanvasElement
): element is TextElement {
  return element.type === "text";
}

function isShape(
  element: CanvasElement
): element is ShapeElement {
  return (
    element.type === "rectangle" ||
    element.type === "ellipse" ||
    element.type === "line"
  );
}

function normalizeColor(
  color: string
): string {
  if (!color) {
    return "#000000";
  }

  if (
    color.startsWith("#") &&
    (color.length === 4 ||
      color.length === 7)
  ) {
    return color.toUpperCase();
  }

  return color;
}

function colorFrequency(
  elements: CanvasElement[]
): Map<string, number> {
  const colors =
    new Map<string, number>();

  for (const element of elements) {
    let color:
      | string
      | undefined;

    if (isText(element)) {
      color = element.color;
    }

    if (isShape(element)) {
      color = element.fill;
    }

    if (
      !color ||
      color === "transparent"
    ) {
      continue;
    }

    const normalized =
      normalizeColor(color);

    colors.set(
      normalized,
      (colors.get(normalized) ?? 0) + 1
    );
  }

  return colors;
}

function getMostUsedColor(
  elements: CanvasElement[],
  fallback: string
): string {
  const colors =
    colorFrequency(elements);

  if (colors.size === 0) {
    return fallback;
  }

  return [
    ...colors.entries(),
  ].sort(
    (a, b) => b[1] - a[1]
  )[0][0];
}

function getSecondColor(
  elements: CanvasElement[],
  primary: string,
  fallback: string
): string {
  const colors =
    [
      ...colorFrequency(elements).entries(),
    ]
      .filter(
        ([color]) =>
          color !== primary
      )
      .sort(
        (a, b) => b[1] - a[1]
      );

  return (
    colors[0]?.[0] ??
    fallback
  );
}

function getFonts(
  elements: CanvasElement[]
) {
  const textElements =
    elements.filter(isText);

  if (textElements.length === 0) {
    return {
      headingFont: "Arial",
      bodyFont: "Arial",
      headingWeight: 700,
      bodyWeight: 400,
    };
  }

  const sorted =
    [...textElements].sort(
      (a, b) =>
        b.fontSize -
        a.fontSize
    );

  const heading =
    sorted[0];

  const body =
    sorted.length > 1
      ? sorted[sorted.length - 1]
      : heading;

  return {
    headingFont:
      heading.fontFamily,

    bodyFont:
      body.fontFamily,

    headingWeight:
      heading.fontWeight,

    bodyWeight:
      body.fontWeight,
  };
}

function calculateAverageSpacing(
  elements: CanvasElement[]
): number {
  const visible =
    elements
      .filter(
        (element) =>
          !element.hidden
      )
      .sort(
        (a, b) =>
          a.y - b.y
      );

  if (visible.length < 2) {
    return 0;
  }

  const gaps: number[] = [];

  for (
    let i = 1;
    i < visible.length;
    i++
  ) {
    const previous =
      visible[i - 1];

    const current =
      visible[i];

    const gap =
      current.y -
      (previous.y +
        previous.height);

    if (gap >= 0) {
      gaps.push(gap);
    }
  }

  if (gaps.length === 0) {
    return 0;
  }

  const average =
    gaps.reduce(
      (sum, gap) =>
        sum + gap,
      0
    ) / gaps.length;

  return Math.round(
    average
  );
}

function calculateAverageCornerRadius(
  elements: CanvasElement[]
): number {
  const rectangles =
    elements.filter(
      (
        element
      ): element is ShapeElement =>
        element.type ===
        "rectangle"
    );

  if (
    rectangles.length === 0
  ) {
    return 0;
  }

  const radii =
    rectangles.map(
      (element) =>
        element.cornerRadius ??
        0
    );

  return Math.round(
    radii.reduce(
      (sum, radius) =>
        sum + radius,
      0
    ) /
      radii.length
  );
}

function detectVisualStyle(
  elements: CanvasElement[]
): DesignDNA["visualStyle"] {
  const visible =
    elements.filter(
      (element) =>
        !element.hidden
    );

  const textElements =
    visible.filter(isText);

  const shapeElements =
    visible.filter(isShape);

  const elementCount =
    visible.length;

  if (elementCount <= 4) {
    return "minimal";
  }

  if (textElements.length > 0) {
    const largest =
      Math.max(
        ...textElements.map(
          (element) =>
            element.fontSize
        )
      );

    const smallest =
      Math.min(
        ...textElements.map(
          (element) =>
            element.fontSize
        )
      );

    if (
      largest /
        Math.max(
          smallest,
          1
        ) >=
      2.2
    ) {
      return "bold";
    }
  }

  if (
    shapeElements.length >= 3
  ) {
    return "balanced";
  }

  return "editorial";
}

function detectTypographyStyle(
  elements: CanvasElement[]
): DesignDNA["typographyStyle"] {
  const textElements =
    elements.filter(isText);

  if (
    textElements.length === 0
  ) {
    return "neutral";
  }

  const averageWeight =
    textElements.reduce(
      (sum, element) =>
        sum +
        element.fontWeight,
      0
    ) /
    textElements.length;

  const averageSize =
    textElements.reduce(
      (sum, element) =>
        sum +
        element.fontSize,
      0
    ) /
    textElements.length;

  if (
    averageWeight >= 650 ||
    averageSize >= 48
  ) {
    return "strong";
  }

  if (
    averageWeight <= 450
  ) {
    return "refined";
  }

  return "neutral";
}

/* =========================================================
   GENERATE DNA
   ========================================================= */

export function generateDesignDNA(
  elements: CanvasElement[],
  background: string
): DesignDNA {
  const visible =
    elements.filter(
      (element) =>
        !element.hidden
    );

  const textCount =
    visible.filter(isText)
      .length;

  const shapeCount =
    visible.filter(isShape)
      .length;

  const fonts =
    getFonts(visible);

  const primaryColor =
    getMostUsedColor(
      visible,
      background
    );

  const secondaryColor =
    getSecondColor(
      visible,
      primaryColor,
      "#FFFFFF"
    );

  return {
    primaryColor,

    secondaryColor,

    backgroundColor:
      normalizeColor(
        background
      ),

    headingFont:
      fonts.headingFont,

    bodyFont:
      fonts.bodyFont,

    headingWeight:
      fonts.headingWeight,

    bodyWeight:
      fonts.bodyWeight,

    averageSpacing:
      calculateAverageSpacing(
        visible
      ),

    averageCornerRadius:
      calculateAverageCornerRadius(
        visible
      ),

    visualStyle:
      detectVisualStyle(
        visible
      ),

    typographyStyle:
      detectTypographyStyle(
        visible
      ),

    elementCount:
      visible.length,

    textCount,

    shapeCount,

    generatedAt:
      new Date().toISOString(),
  };
}

/* =========================================================
   STORAGE
   ========================================================= */

function dnaKey(
  projectId: string
): string {
  return `design-dna:${projectId}`;
}

export function saveDesignDNA(
  projectId: string,
  dna: DesignDNA
): void {
  storageService.set(
    dnaKey(projectId),
    dna
  );
}

export function getDesignDNA(
  projectId: string
): DesignDNA | null {
  return storageService.get<DesignDNA>(
    dnaKey(projectId)
  );
}

export function clearDesignDNA(
  projectId: string
): void {
  storageService.remove(
    dnaKey(projectId)
  );
}

/* =========================================================
   UPDATE DNA
   ========================================================= */

export function updateDesignDNA(
  projectId: string,
  elements: CanvasElement[],
  background: string
): DesignDNA {
  const dna =
    generateDesignDNA(
      elements,
      background
    );

  saveDesignDNA(
    projectId,
    dna
  );

  return dna;
}