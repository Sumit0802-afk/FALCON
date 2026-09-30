import {
  CanvasElement,
  TextElement,
} from "@/types";

/* =========================================================
   TYPES
   ========================================================= */

export type RemixStyle =
  | "minimal"
  | "bold"
  | "premium"
  | "social";

export interface RemixVariant {
  id: string;
  name: string;
  description: string;
  style: RemixStyle;
  elements: CanvasElement[];
}

/* =========================================================
   HELPERS
   ========================================================= */

function isText(
  element: CanvasElement
): element is TextElement {
  return element.type === "text";
}

function cloneElements(
  elements: CanvasElement[]
): CanvasElement[] {
  return elements.map((element) => ({
    ...element,
  }));
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

/* =========================================================
   MINIMAL REMIX
   ========================================================= */

function createMinimalRemix(
  elements: CanvasElement[]
): CanvasElement[] {
  const next =
    cloneElements(elements);

  const textElements =
    next.filter(isText);

  if (
    textElements.length > 1
  ) {
    const left =
      Math.min(
        ...textElements.map(
          (element) =>
            element.x
        )
      );

    for (
      const element of textElements
    ) {
      element.x = left;
    }
  }

  for (
    const element of next
  ) {
    if (isText(element)) {
      element.lineHeight =
        Math.max(
          element.lineHeight,
          1.25
        );
    }
  }

  return next;
}

/* =========================================================
   BOLD REMIX
   ========================================================= */

function createBoldRemix(
  elements: CanvasElement[]
): CanvasElement[] {
  const next =
    cloneElements(elements);

  const textElements =
    next.filter(isText);

  if (
    textElements.length > 0
  ) {
    const largest =
      [...textElements].sort(
        (a, b) =>
          b.fontSize -
          a.fontSize
      )[0];

    largest.fontSize =
      clamp(
        Math.round(
          largest.fontSize *
            1.25
        ),
        24,
        96
      );

    largest.fontWeight =
      Math.max(
        largest.fontWeight,
        700
      );
  }

  for (
    const element of next
  ) {
    if (
      isText(element) &&
      element !== textElements[0]
    ) {
      element.fontWeight =
        Math.max(
          element.fontWeight,
          500
        );
    }
  }

  return next;
}

/* =========================================================
   PREMIUM REMIX
   ========================================================= */

function createPremiumRemix(
  elements: CanvasElement[]
): CanvasElement[] {
  const next =
    cloneElements(elements);

  const textElements =
    next.filter(isText);

  if (
    textElements.length > 1
  ) {
    const sorted =
      [...textElements].sort(
        (a, b) =>
          b.fontSize -
          a.fontSize
      );

    const headline =
      sorted[0];

    headline.fontWeight =
      Math.max(
        headline.fontWeight,
        700
      );

    headline.lineHeight =
      Math.max(
        headline.lineHeight,
        1.15
      );

    for (
      let i = 1;
      i < sorted.length;
      i++
    ) {
      const element =
        sorted[i];

      element.lineHeight =
        Math.max(
          element.lineHeight,
          1.25
        );

      element.opacity =
        Math.min(
          element.opacity,
          0.9
        );
    }
  }

  return next;
}

/* =========================================================
   SOCIAL REMIX
   ========================================================= */

function createSocialRemix(
  elements: CanvasElement[]
): CanvasElement[] {
  const next =
    cloneElements(elements);

  const textElements =
    next.filter(isText);

  if (
    textElements.length > 0
  ) {
    const largest =
      [...textElements].sort(
        (a, b) =>
          b.fontSize -
          a.fontSize
      )[0];

    largest.fontSize =
      clamp(
        Math.round(
          largest.fontSize *
            1.15
        ),
        20,
        80
      );

    largest.fontWeight =
      Math.max(
        largest.fontWeight,
        700
      );
  }

  for (
    const element of next
  ) {
    if (isText(element)) {
      element.lineHeight =
        Math.max(
          element.lineHeight,
          1.2
        );
    }
  }

  return next;
}

/* =========================================================
   CREATE SINGLE REMIX
   ========================================================= */

export function createRemix(
  elements: CanvasElement[],
  style: RemixStyle
): RemixVariant {
  let remixedElements:
    CanvasElement[];

  switch (style) {
    case "minimal":
      remixedElements =
        createMinimalRemix(
          elements
        );
      break;

    case "bold":
      remixedElements =
        createBoldRemix(
          elements
        );
      break;

    case "premium":
      remixedElements =
        createPremiumRemix(
          elements
        );
      break;

    case "social":
      remixedElements =
        createSocialRemix(
          elements
        );
      break;

    default:
      remixedElements =
        cloneElements(
          elements
        );
  }

  const metadata: Record<
    RemixStyle,
    {
      name: string;
      description: string;
    }
  > = {
    minimal: {
      name: "Minimal",
      description:
        "Cleaner alignment, spacing, and typography.",
    },

    bold: {
      name: "Bold",
      description:
        "Stronger hierarchy with a more confident visual presence.",
    },

    premium: {
      name: "Premium",
      description:
        "Refined typography and balanced visual proportions.",
    },

    social: {
      name: "Social",
      description:
        "Optimized for quick visual impact and readability.",
    },
  };

  return {
    id: `remix-${style}`,
    name:
      metadata[style].name,
    description:
      metadata[style].description,
    style,
    elements:
      remixedElements,
  };
}

/* =========================================================
   GENERATE ALL REMIXES
   ========================================================= */

export function generateRemixes(
  elements: CanvasElement[]
): RemixVariant[] {
  const styles: RemixStyle[] = [
    "minimal",
    "bold",
    "premium",
    "social",
  ];

  return styles.map(
    (style) =>
      createRemix(
        elements,
        style
      )
  );
}