import {
  CanvasElement,
  TextElement,
} from "@/types";

/* =========================================================
   TYPES
   ========================================================= */

export type DesignIssueType =
  | "alignment"
  | "spacing"
  | "contrast"
  | "hierarchy"
  | "readability"
  | "layout";

export interface DesignIssue {
  id: string;
  type: DesignIssueType;
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  suggestion: string;
  elementId?: string;
}

export interface DesignAnalysis {
  score: number;
  breakdown: {
    alignment: number;
    spacing: number;
    contrast: number;
    hierarchy: number;
    readability: number;
  };
  issues: DesignIssue[];
}

export interface DesignImprovement {
  issueId: string;
  title: string;
  description: string;
  elementId?: string;
  patch?: Partial<CanvasElement>;
}

export interface ImprovementResult {
  improvements: DesignImprovement[];
}

/* =========================================================
   HELPERS
   ========================================================= */

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function isText(
  element: CanvasElement
): element is TextElement {
  return element.type === "text";
}

function visibleElements(
  elements: CanvasElement[]
): CanvasElement[] {
  return elements.filter(
    (element) => !element.hidden
  );
}

function editableElements(
  elements: CanvasElement[]
): CanvasElement[] {
  return elements.filter(
    (element) =>
      !element.hidden &&
      !element.locked
  );
}

function right(
  element: CanvasElement
): number {
  return element.x + element.width;
}

function bottom(
  element: CanvasElement
): number {
  return element.y + element.height;
}

function centerX(
  element: CanvasElement
): number {
  return element.x + element.width / 2;
}

/* =========================================================
   COLOR
   ========================================================= */

function hexToRgb(
  color: string
) {
  if (!color) {
    return null;
  }

  let value = color
    .replace("#", "")
    .trim();

  if (value.length === 3) {
    value = value
      .split("")
      .map(
        (char) => char + char
      )
      .join("");
  }

  if (value.length !== 6) {
    return null;
  }

  const r = parseInt(
    value.slice(0, 2),
    16
  );

  const g = parseInt(
    value.slice(2, 4),
    16
  );

  const b = parseInt(
    value.slice(4, 6),
    16
  );

  if (
    [r, g, b].some(
      Number.isNaN
    )
  ) {
    return null;
  }

  return {
    r,
    g,
    b,
  };
}

function luminance(
  color: string
): number {
  const rgb =
    hexToRgb(color);

  if (!rgb) {
    return 0.5;
  }

  const values = [
    rgb.r,
    rgb.g,
    rgb.b,
  ].map((value) => {
    const channel =
      value / 255;

    return channel <=
      0.03928
      ? channel / 12.92
      : Math.pow(
          (channel + 0.055) /
            1.055,
          2.4
        );
  });

  return (
    0.2126 * values[0] +
    0.7152 * values[1] +
    0.0722 * values[2]
  );
}

function contrastRatio(
  first: string,
  second: string
): number {
  const l1 =
    luminance(first);

  const l2 =
    luminance(second);

  const lighter =
    Math.max(l1, l2);

  const darker =
    Math.min(l1, l2);

  return (
    (lighter + 0.05) /
    (darker + 0.05)
  );
}

/* =========================================================
   OVERLAP
   ========================================================= */

function hasOverlap(
  first: CanvasElement,
  second: CanvasElement
): boolean {
  const horizontal =
    Math.min(
      right(first),
      right(second)
    ) -
    Math.max(
      first.x,
      second.x
    );

  const vertical =
    Math.min(
      bottom(first),
      bottom(second)
    ) -
    Math.max(
      first.y,
      second.y
    );

  return (
    horizontal > 4 &&
    vertical > 4
  );
}

/* =========================================================
   ALIGNMENT ANALYSIS
   ========================================================= */

function analyzeAlignment(
  elements: CanvasElement[]
): number {
  const text =
    visibleElements(elements)
      .filter(isText);

  if (text.length <= 1) {
    return 100;
  }

  let aligned = 0;
  let pairs = 0;

  for (
    let i = 0;
    i < text.length;
    i++
  ) {
    for (
      let j = i + 1;
      j < text.length;
      j++
    ) {
      const a = text[i];
      const b = text[j];

      const left =
        Math.abs(
          a.x - b.x
        ) <= 12;

      const center =
        Math.abs(
          centerX(a) -
            centerX(b)
        ) <= 12;

      const rightEdge =
        Math.abs(
          right(a) -
            right(b)
        ) <= 12;

      if (
        left ||
        center ||
        rightEdge
      ) {
        aligned++;
      }

      pairs++;
    }
  }

  return clamp(
    Math.round(
      (aligned /
        Math.max(pairs, 1)) *
        100
    ),
    20,
    100
  );
}

/* =========================================================
   SPACING ANALYSIS
   ========================================================= */

function analyzeSpacing(
  elements: CanvasElement[]
): number {
  const text =
    visibleElements(elements)
      .filter(isText);

  if (text.length <= 1) {
    return 100;
  }

  const sorted =
    [...text].sort(
      (a, b) =>
        a.y - b.y
    );

  let good = 0;
  let total = 0;

  for (
    let i = 1;
    i < sorted.length;
    i++
  ) {
    const previous =
      sorted[i - 1];

    const current =
      sorted[i];

    const gap =
      current.y -
      bottom(previous);

    total++;

    if (gap >= 8) {
      good++;
    }
  }

  return clamp(
    Math.round(
      (good /
        Math.max(total, 1)) *
        100
    ),
    20,
    100
  );
}

/* =========================================================
   HIERARCHY
   ========================================================= */

function analyzeHierarchy(
  elements: CanvasElement[]
): number {
  const textElements =
    visibleElements(elements)
      .filter(isText);

  if (textElements.length <= 1) {
    return 100;
  }

  const sizes =
    textElements.map(
      (element) =>
        element.fontSize
    );

  const largest =
    Math.max(...sizes);

  const smallest =
    Math.min(...sizes);

  if (largest <= 0) {
    return 40;
  }

  if (
    largest === smallest
  ) {
    return 45;
  }

  const ratio =
    largest / smallest;

  if (ratio >= 2.4) {
    return 100;
  }

  if (ratio >= 2) {
    return 90;
  }

  if (ratio >= 1.6) {
    return 80;
  }

  if (ratio >= 1.3) {
    return 65;
  }

  return 50;
}

/* =========================================================
   READABILITY
   ========================================================= */

function analyzeReadability(
  elements: CanvasElement[]
): number {
  const textElements =
    visibleElements(elements)
      .filter(isText);

  if (textElements.length === 0) {
    return 100;
  }

  let readable = 0;

  for (
    const element of
      textElements
  ) {
    if (
      element.fontSize >= 14 &&
      element.lineHeight >= 1.15
    ) {
      readable++;
    }
  }

  return clamp(
    Math.round(
      (readable /
        textElements.length) *
        100
    ),
    20,
    100
  );
}

/* =========================================================
   CONTRAST
   ========================================================= */

function analyzeContrast(
  elements: CanvasElement[],
  background: string
): number {
  const textElements =
    visibleElements(elements)
      .filter(isText);

  if (textElements.length === 0) {
    return 100;
  }

  let total = 0;

  for (
    const element of
      textElements
  ) {
    const ratio =
      contrastRatio(
        element.color,
        background
      );

    if (ratio >= 7) {
      total += 100;
    } else if (ratio >= 4.5) {
      total += 90;
    } else if (ratio >= 3) {
      total += 65;
    } else if (ratio >= 2) {
      total += 40;
    } else {
      total += 15;
    }
  }

  return clamp(
    Math.round(
      total /
        textElements.length
    ),
    15,
    100
  );
}

/* =========================================================
   ISSUES
   ========================================================= */

function createIssues(
  elements: CanvasElement[],
  background: string,
  breakdown: DesignAnalysis["breakdown"]
): DesignIssue[] {
  const issues: DesignIssue[] =
    [];

  const visible =
    visibleElements(elements);

  /* ALIGNMENT */

  if (
    breakdown.alignment < 75
  ) {
    const text =
      visible.find(isText);

    issues.push({
      id: "alignment-01",
      type: "alignment",
      severity:
        breakdown.alignment < 50
          ? "high"
          : "medium",
      title:
        "Improve alignment",
      description:
        "Some text elements do not share a consistent visual edge.",
      suggestion:
        "Align related text to a common visual edge.",
      elementId:
        text?.id,
    });
  }

  /* SPACING */

  if (
    breakdown.spacing < 75
  ) {
    const texts =
      visible.filter(isText);

    const sorted =
      [...texts].sort(
        (a, b) =>
          a.y - b.y
      );

    let problematic:
      TextElement | undefined;

    for (
      let i = 1;
      i < sorted.length;
      i++
    ) {
      const gap =
        sorted[i].y -
        bottom(
          sorted[i - 1]
        );

      if (gap < 8) {
        problematic =
          sorted[i];

        break;
      }
    }

    issues.push({
      id: "spacing-01",
      type: "spacing",
      severity: "medium",
      title:
        "Improve text spacing",
      description:
        "Some text blocks are too close together.",
      suggestion:
        "Create a small consistent gap between related text blocks.",
      elementId:
        problematic?.id,
    });
  }

  /* OVERLAP */

  let overlapFound = false;

  for (
    let i = 0;
    i < visible.length;
    i++
  ) {
    for (
      let j = i + 1;
      j < visible.length;
      j++
    ) {
      if (
        hasOverlap(
          visible[i],
          visible[j]
        )
      ) {
        issues.push({
          id: "layout-01",
          type: "layout",
          severity: "low",
          title:
            "Check element overlap",
          description:
            "Some elements overlap visually. This may be intentional.",
          suggestion:
            "Review the overlap manually if it is not part of the composition.",
          elementId:
            visible[j].id,
        });

        overlapFound = true;
        break;
      }
    }

    if (overlapFound) {
      break;
    }
  }

  /* CONTRAST */

  if (
    breakdown.contrast < 75
  ) {
    const weakText =
      visible.find(
        (element) =>
          isText(element) &&
          contrastRatio(
            element.color,
            background
          ) < 4.5
      );

    issues.push({
      id: "contrast-01",
      type: "contrast",
      severity: "high",
      title:
        "Increase text contrast",
      description:
        "Some text does not have enough contrast against the background.",
      suggestion:
        "Use a stronger foreground color.",
      elementId:
        weakText?.id,
    });
  }

  /* HIERARCHY */

  if (
    breakdown.hierarchy < 75
  ) {
    const heading =
      [...visible]
        .filter(isText)
        .sort(
          (a, b) =>
            b.fontSize -
            a.fontSize
        )[0];

    issues.push({
      id: "hierarchy-01",
      type: "hierarchy",
      severity: "medium",
      title:
        "Strengthen hierarchy",
      description:
        "Text sizes are too similar to clearly communicate importance.",
      suggestion:
        "Make the primary headline larger and stronger.",
      elementId:
        heading?.id,
    });
  }

  /* READABILITY */

  if (
    breakdown.readability < 75
  ) {
    const weakText =
      visible.find(
        (element) =>
          isText(element) &&
          (
            element.fontSize < 14 ||
            element.lineHeight < 1.15
          )
      );

    issues.push({
      id: "readability-01",
      type: "readability",
      severity: "low",
      title:
        "Improve readability",
      description:
        "Some text is too small or has tight line spacing.",
      suggestion:
        "Increase font size or line height.",
      elementId:
        weakText?.id,
    });
  }

  return issues;
}

/* =========================================================
   MAIN ANALYSIS
   ========================================================= */

export function analyzeDesign(
  elements: CanvasElement[],
  background: string
): DesignAnalysis {
  const visible =
    visibleElements(elements);

  if (visible.length === 0) {
    return {
      score: 100,
      breakdown: {
        alignment: 100,
        spacing: 100,
        contrast: 100,
        hierarchy: 100,
        readability: 100,
      },
      issues: [],
    };
  }

  const alignment =
    analyzeAlignment(elements);

  const spacing =
    analyzeSpacing(elements);

  const contrast =
    analyzeContrast(
      elements,
      background
    );

  const hierarchy =
    analyzeHierarchy(elements);

  const readability =
    analyzeReadability(elements);

  const rawScore =
    Math.round(
      alignment * 0.2 +
      spacing * 0.2 +
      contrast * 0.25 +
      hierarchy * 0.2 +
      readability * 0.15
    );

  const breakdown = {
    alignment,
    spacing,
    contrast,
    hierarchy,
    readability,
  };

  const issues =
    createIssues(
      elements,
      background,
      breakdown
    );

  return {
    score: clamp(
      rawScore,
      0,
      100
    ),
    breakdown,
    issues,
  };
}

/* =========================================================
   IMPROVEMENT ENGINE
   ========================================================= */

export function generateImprovements(
  elements: CanvasElement[],
  background: string,
  analysis: DesignAnalysis
): ImprovementResult {
  const improvements: DesignImprovement[] =
    [];

  const editable =
    editableElements(elements);

  const texts =
    editable.filter(isText);

  /* =======================================================
     CONTRAST
     ======================================================= */

  if (
    analysis.breakdown.contrast < 75
  ) {
    const backgroundIsLight =
      luminance(background) > 0.5;

    const recommendedColor =
      backgroundIsLight
        ? "#111111"
        : "#FFFFFF";

    for (
      const element of texts
    ) {
      const ratio =
        contrastRatio(
          element.color,
          background
        );

      if (ratio < 4.5) {
        improvements.push({
          issueId:
            "contrast-01",
          title:
            "Improve contrast",
          description:
            "Falcon increased text contrast.",
          elementId:
            element.id,
          patch: {
            color:
              recommendedColor,
          },
        });
      }
    }
  }

  /* =======================================================
     READABILITY
     ======================================================= */

  if (
    analysis.breakdown.readability <
    75
  ) {
    for (
      const element of texts
    ) {
      const patch:
        Partial<TextElement> =
        {};

      if (
        element.fontSize < 14
      ) {
        patch.fontSize = 14;
      }

      if (
        element.lineHeight < 1.15
      ) {
        patch.lineHeight = 1.3;
      }

      if (
        Object.keys(patch).length > 0
      ) {
        improvements.push({
          issueId:
            "readability-01",
          title:
            "Improve readability",
          description:
            "Falcon improved text readability without changing its position.",
          elementId:
            element.id,
          patch,
        });
      }
    }
  }

  /* =======================================================
     HIERARCHY
     ======================================================= */

  if (
    analysis.breakdown.hierarchy < 75 &&
    texts.length >= 2
  ) {
    const sorted =
      [...texts].sort(
        (a, b) =>
          b.fontSize -
          a.fontSize
      );

    const heading =
      sorted[0];

    const second =
      sorted[1];

    const desiredSize =
      clamp(
        Math.round(
          Math.max(
            heading.fontSize,
            second.fontSize * 1.6
          )
        ),
        24,
        72
      );

    if (
      heading.fontSize <
      desiredSize
    ) {
      improvements.push({
        issueId:
          "hierarchy-01",
        title:
          "Strengthen hierarchy",
        description:
          "Falcon strengthened the primary headline without changing its position.",
        elementId:
          heading.id,
        patch: {
          fontSize:
            desiredSize,
          fontWeight:
            Math.max(
              heading.fontWeight,
              700
            ),
        },
      });
    }
  }

  /* =======================================================
     ALIGNMENT
     ======================================================= */

  if (
    analysis.breakdown.alignment < 75 &&
    texts.length >= 2
  ) {
    const sorted =
      [...texts].sort(
        (a, b) =>
          a.y - b.y
      );

    const anchor =
      sorted[0];

    const targetX =
      anchor.x;

    for (
      const element of texts
    ) {
      const difference =
        Math.abs(
          element.x -
            targetX
        );

      if (difference <= 12) {
        continue;
      }

      /*
       * Do not pull distant text
       * across the composition.
       */
      if (difference > 300) {
        continue;
      }

      improvements.push({
        issueId:
          "alignment-01",
        title:
          "Align text",
        description:
          "Falcon aligned related text to the existing visual anchor.",
        elementId:
          element.id,
        patch: {
          /*
           * ONLY X changes.
           * Y is NEVER changed.
           */
          x: targetX,
        },
      });
    }
  }

  /* =======================================================
     SAFETY RULE
     ======================================================= */

  /*
   * IMPORTANT:
   *
   * Falcon NEVER automatically changes
   * element.y.
   *
   * Spacing and overlap are analyzed,
   * but their positions are not changed.
   *
   * This protects poster layouts,
   * decorative elements and intentional
   * compositions.
   */

  /* =======================================================
     DEDUPLICATE
     ======================================================= */

  const unique =
    new Map<
      string,
      DesignImprovement
    >();

  for (
    const improvement of
      improvements
  ) {
    if (
      !improvement.elementId ||
      !improvement.patch
    ) {
      continue;
    }

    const existing =
      unique.get(
        improvement.elementId
      );

    if (!existing) {
      unique.set(
        improvement.elementId,
        {
          ...improvement,
          patch: {
            ...improvement.patch,
          },
        }
      );

      continue;
    }

    unique.set(
      improvement.elementId,
      {
        ...existing,
        patch: {
          ...existing.patch,
          ...improvement.patch,
        },
      }
    );
  }

  return {
    improvements: [
      ...unique.values(),
    ],
  };
}
/* =========================================================
   INDIVIDUAL ISSUE FIX
   ========================================================= */

export function generateIssueFix(
  issue: DesignIssue,
  elements: CanvasElement[],
  background: string
): DesignImprovement | null {
  const editable =
    editableElements(elements);

  const target =
    issue.elementId
      ? editable.find(
          (element) =>
            element.id ===
            issue.elementId
        )
      : undefined;

  /*
   * If the issue has no target element,
   * do not make a blind change.
   */
  if (!target) {
    return null;
  }

  /* =======================================================
     CONTRAST
     ======================================================= */

  if (
    issue.type === "contrast" &&
    isText(target)
  ) {
    const backgroundIsLight =
      luminance(background) > 0.5;

    const recommendedColor =
      backgroundIsLight
        ? "#111111"
        : "#FFFFFF";

    if (
      contrastRatio(
        target.color,
        background
      ) < 4.5
    ) {
      return {
        issueId: issue.id,
        title: "Improve contrast",
        description:
          "Falcon increased the contrast of this text.",
        elementId: target.id,
        patch: {
          color:
            recommendedColor,
        },
      };
    }

    return null;
  }

  /* =======================================================
     READABILITY
     ======================================================= */

  if (
    issue.type === "readability" &&
    isText(target)
  ) {
    const patch:
      Partial<TextElement> =
      {};

    if (
      target.fontSize < 14
    ) {
      patch.fontSize = 14;
    }

    if (
      target.lineHeight < 1.15
    ) {
      patch.lineHeight = 1.3;
    }

    if (
      Object.keys(patch).length === 0
    ) {
      return null;
    }

    return {
      issueId: issue.id,
      title:
        "Improve readability",
      description:
        "Falcon improved this text's readability.",
      elementId: target.id,
      patch,
    };
  }

  /* =======================================================
     HIERARCHY
     ======================================================= */

  if (
    issue.type === "hierarchy" &&
    isText(target)
  ) {
    const texts =
      editable.filter(isText);

    if (texts.length < 2) {
      return null;
    }

    const sorted =
      [...texts].sort(
        (a, b) =>
          b.fontSize -
          a.fontSize
      );

    const heading =
      sorted[0];

    /*
     * Only fix the actual primary
     * heading identified by analysis.
     */
    if (
      heading.id !== target.id
    ) {
      return null;
    }

    const second =
      sorted[1];

    const desiredSize =
      clamp(
        Math.round(
          Math.max(
            heading.fontSize,
            second.fontSize * 1.6
          )
        ),
        24,
        72
      );

    if (
      heading.fontSize >=
      desiredSize
    ) {
      return null;
    }

    return {
      issueId: issue.id,
      title:
        "Strengthen hierarchy",
      description:
        "Falcon strengthened the primary headline.",
      elementId: target.id,
      patch: {
        fontSize:
          desiredSize,
        fontWeight:
          Math.max(
            heading.fontWeight,
            700
          ),
      },
    };
  }

  /* =======================================================
     ALIGNMENT
     ======================================================= */

  if (
    issue.type === "alignment" &&
    isText(target)
  ) {
    const texts =
      editable.filter(isText);

    if (texts.length < 2) {
      return null;
    }

    const sorted =
      [...texts].sort(
        (a, b) =>
          a.y - b.y
      );

    const anchor =
      sorted[0];

    if (
      target.id === anchor.id
    ) {
      return null;
    }

    const difference =
      Math.abs(
        target.x -
          anchor.x
      );

    /*
     * Never move a distant element
     * across the composition.
     */
    if (
      difference <= 12 ||
      difference > 300
    ) {
      return null;
    }

    return {
      issueId: issue.id,
      title:
        "Align text",
      description:
        "Falcon aligned this text with the existing visual anchor.",
      elementId: target.id,
      patch: {
        /*
         * ONLY X changes.
         *
         * Y is intentionally untouched.
         */
        x: anchor.x,
      },
    };
  }

  /* =======================================================
     SPACING
     *
     * Intentionally no automatic position
     * change.
     * ======================================================= */

  if (
    issue.type === "spacing"
  ) {
    return null;
  }

  /* =======================================================
     LAYOUT / OVERLAP
     *
     * Intentionally no automatic position
     * change.
     * ======================================================= */

  if (
    issue.type === "layout"
  ) {
    return null;
  }

  return null;
}