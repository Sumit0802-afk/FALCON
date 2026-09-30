import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/router";

import {
  CanvasElement,
  DesignPage,
  isImage,
  isText,
  isShape,
  isFrame,
  ImageElement,
  TextElement,
  ShapeElement,
  FrameElement,
  PageSize,
} from "@/types";

import { useCanvasEditor } from "@/hooks/useCanvasEditor";
import { useZoomPan } from "@/hooks/useZoomPan";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

import { Toolbar, SidebarTab } from "@/components/Toolbar/Toolbar";
import { TopBar } from "@/components/TopBar/TopBar";
import { Canvas } from "@/components/Canvas/Canvas";
import { LayersPanel } from "@/components/Sidebar/LayersPanel";
import { TextPanel } from "@/components/Sidebar/TextPanel";
import { FontsPanel } from "@/components/Sidebar/FontsPanel";
import { ElementsPanel } from "@/components/Sidebar/ElementsPanel";
import { FramesPanel } from "@/components/Sidebar/FramesPanel";
import { ImageFiltersPanel } from "@/components/Sidebar/ImageFiltersPanel";
import { UploadsPanel } from "@/components/Sidebar/UploadsPanel";
import { BackgroundsPanel } from "@/components/Sidebar/BackgroundsPanel";
import { StickersPanel } from "@/components/Sidebar/StickersPanel";
import { PhotosPanel } from "@/components/Sidebar/PhotosPanel";
import { BrandKitPanel } from "@/components/Sidebar/BrandKitPanel";
import { AssetAdminModal } from "@/components/Sidebar/AssetAdminModal";
import { ApplyToPagePrompt, PromptItemType } from "@/components/Editor/ApplyToPagePrompt";
import { BackgroundItem } from "@/data/backgrounds";
import { Sticker } from "@/types/sticker";
import { BackgroundRemoverModal } from "@/components/Editor/BackgroundRemoverModal";
import { LayoutSelectorModal } from "@/components/Editor/LayoutSelectorModal";
import { ColorPickerPopover } from "@/components/common/ColorPickerPopover";
import { FontSizeControl } from "@/components/Editor/FontSizeControl";

import { FrameDefinition } from "@/data/frameDefinitions";
import { loadGoogleFont } from "@/services/fontService";
import { TextDesignStyle } from "@/data/textDesignStyles";

import { exportService } from "@/services/exportService";
import { projectService } from "@/services/projectService";

import {
  analyzeDesign,
  generateImprovements,
  DesignAnalysis,
  DesignIssue,
} from "@/services/designAnalysisService";

import {
  generateRemixes,
  RemixVariant,
} from "@/services/remixService";

import {
  generateDesignDNA,
  DesignDNA,
} from "@/services/designDNAService";

import {
  generateCampaign,
  CampaignVariant,
  CampaignFormat,
  CAMPAIGN_FORMATS,
} from "@/services/campaignService";

import {
  Brain,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Wand2,
  Zap,
  X,
  Check,
  Palette,
  Type,
  LayoutGrid,
  Wrench,
  Group,
  Ungroup,
  Scissors,
  Copy,
  Trash2,
  RotateCcw,
  Sliders,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Crown,
  StickyNote,
  Timer,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  FlipHorizontal,
  FlipVertical,
  Plus,
  Minus,
  Maximize,
  Eye,
  Layers,
  Frame,
  Image as ImageIcon,
} from "lucide-react";

interface EditorLayoutProps {
  projectId: string;
  projectTitle: string;
  initialPage: DesignPage;
  onBack: () => void;
}

export function EditorLayout({
  projectId,
  projectTitle,
  initialPage,
  onBack,
}: EditorLayoutProps) {
  const router = useRouter();

  const editor = useCanvasEditor({
    initialPage,
  });

  const {
    zoom,
    pan,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    onWheel,
  } = useZoomPan();

  // Ref on the canvas wrapper so we can measure its dimensions for fit-to-screen
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const handleFitToScreen = useCallback(() => {
    const el = canvasWrapperRef.current;
    if (!el) return;
    fitToScreen(
      el.clientWidth,
      el.clientHeight,
      editor.page.size.width,
      editor.page.size.height
    );
  }, [fitToScreen, editor.page.size]);

  // Auto-fit whenever the editor first loads or the page dimensions change
  useEffect(() => {
    handleFitToScreen();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.page.size.width, editor.page.size.height]);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const imagePositionRef = useRef({
    x: 100,
    y: 100,
  });

  /* =======================================================
     AI COACH
     ======================================================= */

  const [coachOpen, setCoachOpen] =
    useState(false);

  const [analysis, setAnalysis] =
    useState<DesignAnalysis | null>(null);

  const [isImproving, setIsImproving] =
    useState(false);

  const [
    improvementMessage,
    setImprovementMessage,
  ] = useState("");

  const [
    fixingIssueId,
    setFixingIssueId,
  ] = useState<string | null>(null);

  const [
    issueFixMessage,
    setIssueFixMessage,
  ] = useState("");

  /* =======================================================
     DESIGN DNA
     ======================================================= */

  const [designDNA, setDesignDNA] =
    useState<DesignDNA | null>(null);

  /* =======================================================
     SMART REMIX
     ======================================================= */

  const [remixOpen, setRemixOpen] =
    useState(false);

  const [remixes, setRemixes] =
    useState<RemixVariant[]>([]);

  const [selectedRemix, setSelectedRemix] =
    useState<RemixVariant | null>(null);

  const [
    isGeneratingRemixes,
    setIsGeneratingRemixes,
  ] = useState(false);

  const [remixMessage, setRemixMessage] =
    useState("");

  /* =======================================================
     ONE → MANY
     ======================================================= */

  const [campaignOpen, setCampaignOpen] =
    useState(false);

  const [
    campaignVariants,
    setCampaignVariants,
  ] = useState<CampaignVariant[]>([]);

  const [
    selectedCampaignFormats,
    setSelectedCampaignFormats,
  ] = useState<CampaignFormat[]>(
    CAMPAIGN_FORMATS.map(
      (format) => format.id
    )
  );

  const [
    isGeneratingCampaign,
    setIsGeneratingCampaign,
  ] = useState(false);

  const [
    campaignMessage,
    setCampaignMessage,
  ] = useState("");

  const [
    isCreatingCampaignProjects,
    setIsCreatingCampaignProjects,
  ] = useState(false);

  /* =======================================================
     GROUP / UNGROUP
     ======================================================= */

  const canGroup =
    editor.selectedElements.length >= 2 &&
    editor.selectedElements.every(
      (element) =>
        !element.locked &&
        !element.hidden &&
        element.type !== "group"
    );

  const canUngroup =
    editor.selectedElements.some(
      (element) =>
        element.type === "group"
    );

  /* =======================================================
     BACKGROUND REMOVER
     ======================================================= */

  const [bgRemoverOpen, setBgRemoverOpen] = useState(false);
  const [layoutSelectorOpen, setLayoutSelectorOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const colorPickerAnchorRef = useRef<HTMLButtonElement | null>(null);

  /* =======================================================
     SIDEBAR TAB STATE
     ======================================================= */

  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>(null);
  const [assetAdminOpen, setAssetAdminOpen] = useState(false);

  /* =======================================================
     EDITOR THEME (DARK / LIGHT)
     ======================================================= */

  const [editorTheme, setEditorTheme] = useState<"dark" | "light">("dark");

  /* =======================================================
     IMAGE BLEND POPOVER STATE
     ======================================================= */

  const [blendPopoverOpen, setBlendPopoverOpen] = useState(false);
  const [transparencyPopoverOpen, setTransparencyPopoverOpen] = useState(false);

  /* =======================================================
     UPLOADS STATE (tracks recent uploads for UploadsPanel)
     ======================================================= */

  const [recentUploads, setRecentUploads] = useState<string[]>([]);

  /* =======================================================
     APPLY TO COMPLETE PAGE PROMPT STATE
     ======================================================= */
  const [applyPrompt, setApplyPrompt] = useState<{
    itemType: PromptItemType;
    itemName?: string;
    elementId?: string;
    backgroundValue?: string;
  } | null>(null);

  function handleApplyPrompt() {
    if (!applyPrompt) return;

    if (applyPrompt.itemType === "background" && applyPrompt.backgroundValue) {
      editor.setPage({
        ...editor.page,
        background: applyPrompt.backgroundValue,
      });
    } else if (applyPrompt.elementId) {
      const el = editor.page.elements.find((e) => e.id === applyPrompt.elementId);
      if (el) {
        const otherElements = editor.page.elements
          .filter((e) => e.id !== applyPrompt.elementId)
          .map((e, idx) => ({ ...e, zIndex: idx + 1 }));

        const updatedEl = {
          ...el,
          x: 0,
          y: 0,
          width: editor.page.size.width,
          height: editor.page.size.height,
          rotation: 0,
          zIndex: 0,
        };

        editor.setPage({
          ...editor.page,
          elements: [updatedEl, ...otherElements],
        });
      }
    }
  }

  function handleSelectBackground(bg: BackgroundItem) {
    editor.setPage({
      ...editor.page,
      background: bg.value,
    });
    setApplyPrompt({
      itemType: "background",
      itemName: bg.name,
      backgroundValue: bg.value,
    });
  }

  function handleChangeLayout(newSize: PageSize) {
    setLayoutSelectorOpen(false);
    editor.setPage({
      ...editor.page,
      size: newSize,
    });
  }

  const selectedElement = editor.selectedElements[0];
  const isSelectedImage = Boolean(
    selectedElement &&
    editor.selectedElements.length === 1 &&
    isImage(selectedElement)
  );
  const isSelectedText = Boolean(
    selectedElement &&
    editor.selectedElements.length === 1 &&
    isText(selectedElement)
  );
  const isSelectedShape = Boolean(
    selectedElement &&
    editor.selectedElements.length === 1 &&
    isShape(selectedElement)
  );
  const isSelectedFrame = Boolean(
    selectedElement &&
    editor.selectedElements.length === 1 &&
    isFrame(selectedElement)
  );

  /* =======================================================
     GROUP / UNGROUP KEYBOARD SHORTCUTS
     ======================================================= */

  useEffect(() => {
    function handleGroupShortcuts(
      event: KeyboardEvent
    ) {
      const target =
        event.target as HTMLElement | null;

      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (
        event.ctrlKey &&
        event.key.toLowerCase() === "g"
      ) {
        event.preventDefault();

        if (event.shiftKey) {
          if (canUngroup) {
            editor.ungroupSelected();
          }
        } else {
          if (canGroup) {
            editor.groupSelected();
          }
        }
      }
    }

    window.addEventListener(
      "keydown",
      handleGroupShortcuts
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleGroupShortcuts
      );
    };
  }, [
    canGroup,
    canUngroup,
    editor,
  ]);

  /* =======================================================
     DESIGN ANALYSIS
     ======================================================= */

  function runDesignAnalysis() {
    const result =
      analyzeDesign(
        editor.page.elements,
        editor.page.background
      );

    setAnalysis(result);
  }

  /* =======================================================
     DESIGN DNA
     ======================================================= */

  function runDesignDNA() {
    const dna =
      generateDesignDNA(
        editor.page.elements,
        editor.page.background
      );

    setDesignDNA(dna);
  }

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        runDesignAnalysis();
        runDesignDNA();
      }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    editor.page.elements,
    editor.page.background,
  ]);

  /* =======================================================
     INDIVIDUAL AI ISSUE FIX
     ======================================================= */

  function handleFixIssue(
    issue: DesignIssue
  ) {
    if (
      fixingIssueId ||
      isImproving
    ) {
      return;
    }

    const currentElements =
      editor.page.elements;

    const currentBackground =
      editor.page.background;

    const currentAnalysis =
      analyzeDesign(
        currentElements,
        currentBackground
      );

    setAnalysis(currentAnalysis);

    const latestIssue =
      currentAnalysis.issues.find(
        (item) =>
          item.id === issue.id
      );

    if (!latestIssue) {
      setIssueFixMessage(
        "This issue is already fixed."
      );
      return;
    }

    setFixingIssueId(issue.id);
    setIssueFixMessage("");

    window.setTimeout(() => {
      const target =
        latestIssue.elementId
          ? currentElements.find(
              (element) =>
                element.id ===
                latestIssue.elementId
            )
          : undefined;

      if (!target) {
        setIssueFixMessage(
          "Falcon couldn't find the affected element."
        );
        setFixingIssueId(null);
        return;
      }

      if (
        target.locked ||
        target.hidden
      ) {
        setIssueFixMessage(
          "This element is locked or hidden."
        );
        setFixingIssueId(null);
        return;
      }

      let patch: Partial<CanvasElement> =
        {};

      if (
        latestIssue.type ===
        "contrast"
      ) {
        if (
          target.type !== "text"
        ) {
          setIssueFixMessage(
            "Contrast fix is available for text elements."
          );
          setFixingIssueId(null);
          return;
        }

        patch = {
          color:
            getLuminance(
              currentBackground
            ) > 0.5
              ? "#111111"
              : "#FFFFFF",
        };
      } else if (
        latestIssue.type ===
        "readability"
      ) {
        if (
          target.type !== "text"
        ) {
          setIssueFixMessage(
            "Readability fix is available for text elements."
          );
          setFixingIssueId(null);
          return;
        }

        const readabilityPatch: Partial<TextElement> =
          {};

        if (
          target.fontSize < 14
        ) {
          readabilityPatch.fontSize = 14;
        }

        if (
          target.lineHeight < 1.15
        ) {
          readabilityPatch.lineHeight = 1.3;
        }

        if (
          Object.keys(
            readabilityPatch
          ).length === 0
        ) {
          setIssueFixMessage(
            "This text is already readable."
          );
          setFixingIssueId(null);
          return;
        }

        patch =
          readabilityPatch;
      } else if (
        latestIssue.type ===
        "hierarchy"
      ) {
        if (
          target.type !== "text"
        ) {
          setIssueFixMessage(
            "Hierarchy fix is available for text elements."
          );
          setFixingIssueId(null);
          return;
        }

        const texts =
          currentElements.filter(
            (
              element
            ): element is TextElement =>
              element.type ===
                "text" &&
              !element.hidden &&
              !element.locked
          );

        if (texts.length < 2) {
          setIssueFixMessage(
            "There are not enough text elements to improve hierarchy."
          );
          setFixingIssueId(null);
          return;
        }

        const sorted = [
          ...texts,
        ].sort(
          (a, b) =>
            b.fontSize -
            a.fontSize
        );

        const heading =
          sorted[0];

        const second =
          sorted[1];

        if (
          heading.id !==
          target.id
        ) {
          setIssueFixMessage(
            "Falcon identified another text element as the primary heading."
          );
          setFixingIssueId(null);
          return;
        }

        const desiredSize =
          Math.min(
            72,
            Math.max(
              24,
              Math.round(
                Math.max(
                  heading.fontSize,
                  second.fontSize *
                    1.6
                )
              )
            )
          );

        if (
          heading.fontSize >=
          desiredSize
        ) {
          setIssueFixMessage(
            "Hierarchy is already strong."
          );
          setFixingIssueId(null);
          return;
        }

        patch = {
          fontSize:
            desiredSize,
          fontWeight:
            Math.max(
              heading.fontWeight,
              700
            ),
        };
      } else if (
        latestIssue.type ===
        "alignment"
      ) {
        if (
          target.type !== "text"
        ) {
          setIssueFixMessage(
            "Alignment fix is available for text elements."
          );
          setFixingIssueId(null);
          return;
        }

        const texts =
          currentElements.filter(
            (
              element
            ): element is TextElement =>
              element.type ===
                "text" &&
              !element.hidden &&
              !element.locked
          );

        if (texts.length < 2) {
          setIssueFixMessage(
            "There are not enough text elements to align."
          );
          setFixingIssueId(null);
          return;
        }

        const anchor = [
          ...texts,
        ].sort(
          (a, b) =>
            a.y - b.y
        )[0];

        if (
          anchor.id ===
          target.id
        ) {
          setIssueFixMessage(
            "This element is already the alignment anchor."
          );
          setFixingIssueId(null);
          return;
        }

        const difference =
          Math.abs(
            target.x -
              anchor.x
          );

        if (
          difference <= 12
        ) {
          setIssueFixMessage(
            "This element is already aligned."
          );
          setFixingIssueId(null);
          return;
        }

        if (
          difference > 300
        ) {
          setIssueFixMessage(
            "Falcon avoided moving a distant element."
          );
          setFixingIssueId(null);
          return;
        }

        patch = {
          x: anchor.x,
        };
      } else if (
        latestIssue.type ===
        "spacing"
      ) {
        setIssueFixMessage(
          "Manual review recommended so Falcon doesn't disturb your composition."
        );
        setFixingIssueId(null);
        return;
      } else if (
        latestIssue.type ===
        "layout"
      ) {
        setIssueFixMessage(
          "Manual review recommended because the overlap may be intentional."
        );
        setFixingIssueId(null);
        return;
      }

      if (
        Object.keys(patch)
          .length === 0
      ) {
        setIssueFixMessage(
          "Falcon couldn't find a safe fix."
        );
        setFixingIssueId(null);
        return;
      }

      const nextElements: CanvasElement[] =
        currentElements.map(
          (element) => {
            if (
              element.id !==
              target.id
            ) {
              return element;
            }

            const safePatch: Record<
              string,
              unknown
            > = {
              ...patch,
            };

            delete safePatch.id;
            delete safePatch.type;
            delete safePatch.y;

            return {
              ...element,
              ...safePatch,
              id: element.id,
              type: element.type,
              y: element.y,
            } as CanvasElement;
          }
        );

      editor.setPage({
        ...editor.page,
        elements:
          nextElements,
      });

      editor.selectElement(
        target.id
      );

      const updatedAnalysis =
        analyzeDesign(
          nextElements,
          currentBackground
        );

      setAnalysis(
        updatedAnalysis
      );

      const updatedDNA =
        generateDesignDNA(
          nextElements,
          currentBackground
        );

      setDesignDNA(
        updatedDNA
      );

      setIssueFixMessage(
        `${latestIssue.title} fixed successfully.`
      );

      setFixingIssueId(null);
    }, 250);
  }

  /* =======================================================
     IMPROVE DESIGN
     ======================================================= */

  function handleImproveDesign() {
    if (isImproving) {
      return;
    }

    const currentElements =
      editor.page.elements;

    const currentBackground =
      editor.page.background;

    const currentAnalysis =
      analyzeDesign(
        currentElements,
        currentBackground
      );

    setAnalysis(
      currentAnalysis
    );

    if (
      currentAnalysis.issues
        .length === 0
    ) {
      setImprovementMessage(
        "Your design is already looking strong."
      );

      return;
    }

    setIsImproving(true);

    setImprovementMessage(
      "Falcon is improving your design..."
    );

    window.setTimeout(() => {
      const result =
        generateImprovements(
          currentElements,
          currentBackground,
          currentAnalysis
        );

      const patchMap =
        new Map<string, any>();

      for (
        const improvement of
          result.improvements
      ) {
        if (
          !improvement.elementId ||
          !improvement.patch
        ) {
          continue;
        }

        const previousPatch =
          patchMap.get(
            improvement.elementId
          ) ?? {};

        patchMap.set(
          improvement.elementId,
          {
            ...previousPatch,
            ...improvement.patch,
          }
        );
      }

      if (
        patchMap.size === 0
      ) {
        setImprovementMessage(
          "Falcon couldn't find a safe automatic improvement."
        );

        setIsImproving(false);

        return;
      }

      const safeElements =
        currentElements.map(
          (element) => {
            const patch =
              patchMap.get(
                element.id
              );

            if (!patch) {
              return element;
            }

            const safePatch = {
              ...patch,
            };

            delete safePatch.x;
            delete safePatch.y;
            delete safePatch.id;
            delete safePatch.type;

            return {
              ...element,
              ...safePatch,
              x: element.x,
              y: element.y,
            };
          }
        );

      editor.setPage({
        ...editor.page,
        elements:
          safeElements,
      });

      const appliedCount =
        patchMap.size;

      setImprovementMessage(
        `Falcon applied ${appliedCount} safe improvement${
          appliedCount === 1
            ? ""
            : "s"
        }.`
      );

      setIsImproving(false);

      window.setTimeout(() => {
        const updatedAnalysis =
          analyzeDesign(
            safeElements,
            currentBackground
          );

        setAnalysis(
          updatedAnalysis
        );

        const updatedDNA =
          generateDesignDNA(
            safeElements,
            currentBackground
          );

        setDesignDNA(
          updatedDNA
        );
      }, 100);
    }, 450);
  }

  /* =======================================================
     SMART REMIX
     ======================================================= */

  function handleOpenRemix() {
    if (
      isGeneratingRemixes
    ) {
      return;
    }

    setRemixOpen(true);
    setRemixMessage("");
    setSelectedRemix(null);
    setIsGeneratingRemixes(true);

    window.setTimeout(() => {
      const generated =
        generateRemixes(
          editor.page.elements
        );

      setRemixes(generated);

      if (
        generated.length > 0
      ) {
        setSelectedRemix(
          generated[0]
        );
      }

      setIsGeneratingRemixes(
        false
      );
    }, 350);
  }

  function handleCloseRemix() {
    if (
      isGeneratingRemixes
    ) {
      return;
    }

    setRemixOpen(false);
    setSelectedRemix(null);
    setRemixMessage("");
  }

  function handleApplyRemix() {
    if (!selectedRemix) {
      return;
    }

    editor.setPage({
      ...editor.page,
      elements:
        selectedRemix.elements.map(
          (element) => ({
            ...element,
          })
        ),
    });

    setRemixMessage(
      `${selectedRemix.name} remix applied successfully.`
    );

    setRemixOpen(false);
    setSelectedRemix(null);

    window.setTimeout(() => {
      runDesignAnalysis();
      runDesignDNA();
    }, 150);
  }

  /* =======================================================
     ONE → MANY
     ======================================================= */

  function handleOpenCampaign() {
    if (
      isGeneratingCampaign
    ) {
      return;
    }

    setCampaignOpen(true);
    setCampaignMessage("");
    setCampaignVariants([]);
  }

  function handleCloseCampaign() {
    if (
      isGeneratingCampaign ||
      isCreatingCampaignProjects
    ) {
      return;
    }

    setCampaignOpen(false);
    setCampaignVariants([]);
    setCampaignMessage("");
  }

  function toggleCampaignFormat(
    format: CampaignFormat
  ) {
    setSelectedCampaignFormats(
      (current) => {
        if (
          current.includes(format)
        ) {
          return current.filter(
            (item) =>
              item !== format
          );
        }

        return [
          ...current,
          format,
        ];
      }
    );
  }

  function handleGenerateCampaign() {
    if (
      selectedCampaignFormats.length ===
      0
    ) {
      setCampaignMessage(
        "Select at least one format."
      );

      return;
    }

    if (
      isGeneratingCampaign
    ) {
      return;
    }

    setIsGeneratingCampaign(
      true
    );

    setCampaignMessage("");

    window.setTimeout(() => {
      const generated =
        generateCampaign(
          editor.page,
          selectedCampaignFormats
        );

      setCampaignVariants(
        generated
      );

      setIsGeneratingCampaign(
        false
      );

      if (
        generated.length ===
        0
      ) {
        setCampaignMessage(
          "Falcon couldn't generate campaign variants."
        );
      } else {
        setCampaignMessage(
          `${generated.length} campaign variant${
            generated.length ===
            1
              ? ""
              : "s"
          } generated successfully.`
        );
      }
    }, 450);
  }

  async function handleCreateCampaignProjects() {
    if (
      campaignVariants.length ===
      0
    ) {
      return;
    }

    if (
      isCreatingCampaignProjects
    ) {
      return;
    }

    setIsCreatingCampaignProjects(
      true
    );

    let createdCount = 0;

    for (
      const variant of
        campaignVariants
    ) {
      try {
        const project =
          await projectService.create(
            `${
              projectTitle ||
              "Design"
            } — ${
              variant.name
            }`,
            "local-user"
          );

        await projectService.save({
          ...project,
          title:
            `${
              projectTitle ||
              "Design"
            } — ${
              variant.name
            }`,
          pages: [
            {
              ...variant.page,
              id: project.pages[0]?.id || variant.page.id,
            },
          ],
        });

        createdCount++;
      } catch (err) {
        console.error("Failed to save campaign project variant:", err);
      }
    }

    setIsCreatingCampaignProjects(
      false
    );

    setCampaignMessage(
      `${createdCount} campaign designs created successfully.`
    );
  }

  /* =======================================================
     CAMPAIGN ICON
     ======================================================= */

  function getCampaignIcon(
    _format: CampaignFormat
  ) {
    return LayoutGrid;
  }

  /* =======================================================
     AUTO SAVE
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const project =
          await projectService.get(
            projectId
          );

        if (!project || cancelled) {
          return;
        }

        await projectService.save({
          ...project,
          pages: [
            {
              ...project.pages[0],
              ...editor.page,
            },
          ],
        });
      } catch (err) {
        console.warn("Auto-save notification:", err);
      }
    }, 1000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    editor.page,
    projectId,
  ]);

  /* =======================================================
     KEYBOARD SHORTCUTS
     ======================================================= */

  useKeyboardShortcuts({
    onDelete:
      editor.deleteSelected,

    onUndo:
      editor.undo,

    onRedo:
      editor.redo,

    onDuplicate:
      editor.duplicateSelected,

    onDeselect: () =>
      editor.selectElement(null),
  });

  /* =======================================================
     TITLE
     ======================================================= */

  async function handleTitleChange(
    title: string
  ) {
    try {
      const project =
        await projectService.get(
          projectId
        );

      if (!project) {
        return;
      }

      await projectService.save({
        ...project,
        title,
      });
    } catch (err) {
      console.error("Title change save failed:", err);
    }
  }

  /* =======================================================
     TOOL SELECTION
     ======================================================= */

  function handleToolSelect(
    tool: typeof editor.activeTool
  ) {
    if (tool === "crop") {
      const selected =
        editor.selectedElements[0];

      if (!selected) {
        alert(
          "Select an image first."
        );

        return;
      }

      if (!isImage(selected)) {
        alert(
          "Crop can only be used on an image."
        );

        return;
      }

      editor.setActiveTool(
        "crop"
      );

      return;
    }

    editor.setActiveTool(
      tool
    );
  }

  /* =======================================================
     CANVAS CLICK
     ======================================================= */

  function handleCanvasClick(
    x: number,
    y: number
  ) {
    if (
      editor.activeTool ===
        "select" ||
      editor.activeTool ===
        "hand" ||
      editor.activeTool ===
        "crop"
    ) {
      return;
    }

    if (
      editor.activeTool ===
      "image"
    ) {
      imagePositionRef.current = {
        x,
        y,
      };

      fileInputRef.current?.click();

      return;
    }

    editor.addElement({
      type:
        editor.activeTool as any,
      x,
      y,
    });

    editor.setActiveTool(
      "select"
    );
  }

  /* =======================================================
     ADD FRAME TO CANVAS
     ======================================================= */

  function handleAddFrame(frameDef: FrameDefinition) {
    const canvasWidth = editor.page.size.width;
    const canvasHeight = editor.page.size.height;
    const w = frameDef.defaultWidth ?? 220;
    const h = frameDef.defaultHeight ?? 220;
    editor.addElement({
      type: "frame",
      x: Math.round((canvasWidth - w) / 2),
      y: Math.round((canvasHeight - h) / 2),
      width: w,
      height: h,
      frameShape: frameDef.id,
    });
  }

  /* =======================================================
     FONT SELECTION
     ======================================================= */

  function handleSelectFont(fontFamily: string) {
    // Load the font into the document first
    loadGoogleFont(fontFamily, [300, 400, 500, 600, 700, 800]);
    // Apply to currently selected text element(s)
    const textEls = editor.selectedElements.filter(isText);
    if (textEls.length > 0) {
      textEls.forEach((el) => {
        editor.updateElement(el.id, { fontFamily });
      });
    }
  }

  function handleAddTextWithFont(fontFamily: string) {
    loadGoogleFont(fontFamily, [300, 400, 500, 600, 700, 800]);
    const canvasWidth = editor.page.size.width;
    const canvasHeight = editor.page.size.height;
    editor.addElement({
      type: "text",
      x: Math.round(canvasWidth / 4),
      y: Math.round(canvasHeight / 2 - 20),
      text: "Your Text Here",
      fontFamily,
      fontSize: 32,
      fontWeight: 600,
    });
  }

  /* =======================================================
     ADD SHAPE FROM ELEMENTS PANEL
     ======================================================= */

  function handleAddShape(type: "rectangle" | "ellipse" | "line") {
    const canvasWidth = editor.page.size.width;
    const canvasHeight = editor.page.size.height;
    const newEl = editor.addElement({
      type,
      x: Math.round((canvasWidth - 200) / 2),
      y: Math.round((canvasHeight - 120) / 2),
    });
    if (newEl) {
      setApplyPrompt({
        itemType: "element",
        itemName: `${type.charAt(0).toUpperCase() + type.slice(1)} Shape`,
        elementId: newEl.id,
      });
    }
  }

  /* =======================================================
     ADD TEXT PRESETS
     ======================================================= */

  function handleAddHeading() {
    const canvasWidth = editor.page.size.width;
    const canvasHeight = editor.page.size.height;
    editor.addElement({
      type: "text",
      x: Math.round((canvasWidth - 340) / 2),
      y: Math.round(canvasHeight * 0.3),
      text: "Add a heading",
      fontSize: 40,
      fontWeight: 700,
      width: 340,
    });
  }

  function handleAddSubheading() {
    const canvasWidth = editor.page.size.width;
    const canvasHeight = editor.page.size.height;
    editor.addElement({
      type: "text",
      x: Math.round((canvasWidth - 300) / 2),
      y: Math.round(canvasHeight * 0.45),
      text: "Add a subheading",
      fontSize: 26,
      fontWeight: 600,
      width: 300,
    });
  }

  function handleAddBodyText() {
    const canvasWidth = editor.page.size.width;
    const canvasHeight = editor.page.size.height;
    editor.addElement({
      type: "text",
      x: Math.round((canvasWidth - 280) / 2),
      y: Math.round(canvasHeight * 0.6),
      text: "Add body text here",
      fontSize: 16,
      fontWeight: 400,
      width: 280,
    });
  }

  function handleAddStyledText(style: TextDesignStyle) {
    const canvasWidth = editor.page.size.width;
    const canvasHeight = editor.page.size.height;
    loadGoogleFont(style.fontFamily, [style.fontWeight || 400], style.fontStyle === "italic");
    const width = Math.min(canvasWidth * 0.8, 380);
    const height = Math.round(style.fontSize * 1.8);
    editor.addElement({
      type: "text",
      x: Math.round((canvasWidth - width) / 2),
      y: Math.round((canvasHeight - height) / 2),
      width,
      height,
      text: style.sampleText,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      color: style.color,
      italic: style.fontStyle === "italic",
      textShadow: style.textShadow,
      stroke: style.stroke,
      strokeWidth: style.strokeWidth,
      letterSpacing: style.letterSpacing,
      textTransform: style.textTransform,
      backgroundGradient: style.backgroundGradient,
      badgeBg: style.badgeBg,
      badgeBorder: style.badgeBorder,
      badgeRadius: style.badgeRadius,
      badgePadding: style.badgePadding,
      textPresetId: style.id,
      align: "center",
      lineHeight: 1.2,
    });
  }

  /* =======================================================
     UPLOADS PANEL HANDLER
     ======================================================= */

  function handleUploadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result !== "string") return;
      setRecentUploads((prev) => [result, ...prev].slice(0, 20));
    };
    reader.readAsDataURL(file);
  }

  function handleAddImageToCanvas(src: string) {
    const img = document.createElement("img");
    img.onload = () => {
      const nw = img.naturalWidth || 300;
      const nh = img.naturalHeight || 300;
      const MAX = 400;
      let w = nw, h = nh;
      if (w > MAX || h > MAX) {
        const scale = Math.min(MAX / w, MAX / h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const cx = Math.round((editor.page.size.width - w) / 2);
      const cy = Math.round((editor.page.size.height - h) / 2);
      const newEl = editor.addElement({
        type: "image",
        x: cx,
        y: cy,
        width: w,
        height: h,
        src,
        naturalWidth: nw,
        naturalHeight: nh,
        cropX: 0,
        cropY: 0,
        cropWidth: nw,
        cropHeight: nh,
      });
      if (newEl) {
        setApplyPrompt({
          itemType: "image",
          itemName: "Image",
          elementId: newEl.id,
        });
      }
    };
    img.src = src;
  }

  function handleAddVideoToCanvas(src: string, name?: string) {
    const w = 480;
    const h = 270;
    const cx = Math.round((editor.page.size.width - w) / 2);
    const cy = Math.round((editor.page.size.height - h) / 2);
    const newEl = editor.addElement({
      type: "image",
      x: cx,
      y: cy,
      width: w,
      height: h,
      src,
      naturalWidth: w,
      naturalHeight: h,
      cropX: 0,
      cropY: 0,
      cropWidth: w,
      cropHeight: h,
    });
    if (newEl) {
      setApplyPrompt({
        itemType: "image",
        itemName: name || "Video Clip",
        elementId: newEl.id,
      });
    }
  }

  function handleApplyBrandColor(color: string) {
    const sel = editor.selectedElements[0];
    if (sel) {
      if (isShape(sel)) {
        editor.updateElement(sel.id, { fill: color });
      } else if (isText(sel)) {
        editor.updateElement(sel.id, { color });
      } else {
        editor.setPage({ ...editor.page, background: color });
      }
    } else {
      editor.setPage({ ...editor.page, background: color });
    }
  }

  function handleApplyBrandFont(fontFamily: string) {
    handleSelectFont(fontFamily);
  }

  function handleAddBrandHeadingText(fontFamily: string) {
    loadGoogleFont(fontFamily, [700]);
    const canvasWidth = editor.page.size.width;
    const canvasHeight = editor.page.size.height;
    editor.addElement({
      type: "text",
      x: Math.round((canvasWidth - 360) / 2),
      y: Math.round(canvasHeight * 0.35),
      text: "Brand Heading",
      fontFamily,
      fontSize: 42,
      fontWeight: 700,
      width: 360,
    });
  }

  function handleAddBrandBodyText(fontFamily: string) {
    loadGoogleFont(fontFamily, [400]);
    const canvasWidth = editor.page.size.width;
    const canvasHeight = editor.page.size.height;
    editor.addElement({
      type: "text",
      x: Math.round((canvasWidth - 300) / 2),
      y: Math.round(canvasHeight * 0.5),
      text: "Consistent brand body text goes here.",
      fontFamily,
      fontSize: 18,
      fontWeight: 400,
      width: 300,
    });
  }

  /* =======================================================
     ADD STICKER TO CANVAS
     ======================================================= */
  function handleAddSticker(sticker: Sticker) {
    const src = sticker.fileUrl;
    const w = sticker.width || 160;
    const h = sticker.height || 160;
    const MAX = 220;
    let finalW = w;
    let finalH = h;
    if (finalW > MAX || finalH > MAX) {
      const scale = Math.min(MAX / finalW, MAX / finalH);
      finalW = Math.round(finalW * scale);
      finalH = Math.round(finalH * scale);
    }
    const cx = Math.round((editor.page.size.width - finalW) / 2);
    const cy = Math.round((editor.page.size.height - finalH) / 2);
    const newEl = editor.addElement({
      type: "image",
      x: cx,
      y: cy,
      width: finalW,
      height: finalH,
      src,
      naturalWidth: w,
      naturalHeight: h,
      cropX: 0,
      cropY: 0,
      cropWidth: w,
      cropHeight: h,
    });
    if (newEl) {
      editor.selectElement(newEl.id);
    }
  }

  /* =======================================================
     CANVAS DROP HANDLER (for frame drag from FramesPanel)
     ======================================================= */

  function handleCanvasDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const res = ev.target?.result;
          if (typeof res === "string") {
            handleAddImageToCanvas(res);
          }
        };
        reader.readAsDataURL(file);
        return;
      }
    }
    const frameData = e.dataTransfer.getData("application/falcon-frame");
    if (!frameData) return;
    try {
      const frameDef: FrameDefinition = JSON.parse(frameData);
      const surface = canvasWrapperRef.current;
      if (!surface) {
        handleAddFrame(frameDef);
        return;
      }
      const rect = surface.getBoundingClientRect();
      // Convert drop position to canvas coordinates
      const dropX = e.clientX - rect.left;
      const dropY = e.clientY - rect.top;
      const canvasOriginX = rect.width / 2 + (editor.page.size.width / 2) * -1;
      const w = frameDef.defaultWidth ?? 220;
      const h = frameDef.defaultHeight ?? 220;
      // Simplified: place centered at canvas center (accurate positioning requires zoom/pan math)
      const cx = Math.round((editor.page.size.width - w) / 2);
      const cy = Math.round((editor.page.size.height - h) / 2);
      editor.addElement({
        type: "frame",
        x: cx,
        y: cy,
        width: w,
        height: h,
        frameShape: frameDef.id,
      });
    } catch {
      // Ignore malformed data
    }
  }

  /* =======================================================
     IMAGE UPLOAD
     ======================================================= */

  function handleImageUpload(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please select an image file."
      );

      e.target.value = "";

      return;
    }

    const reader =
      new FileReader();

    reader.onload = (
      event
    ) => {
      const result =
        event.target?.result;

      if (
        typeof result !==
        "string"
      ) {
        alert(
          "Unable to read image."
        );

        return;
      }

      const {
        x,
        y,
      } = imagePositionRef.current;

      const img =
        document.createElement(
          "img"
        );

      img.onload = () => {
        const naturalWidth =
          img.naturalWidth ||
          300;

        const naturalHeight =
          img.naturalHeight ||
          300;

        const MAX_SIZE = 400;

        let width =
          naturalWidth;

        let height =
          naturalHeight;

        if (
          width > MAX_SIZE ||
          height > MAX_SIZE
        ) {
          const scale =
            Math.min(
              MAX_SIZE / width,
              MAX_SIZE / height
            );

          width =
            Math.round(
              width * scale
            );

          height =
            Math.round(
              height * scale
            );
        }

        editor.addElement({
          type: "image",
          x,
          y,
          width,
          height,
          src: result,
          naturalWidth,
          naturalHeight,
          cropX: 0,
          cropY: 0,
          cropWidth:
            naturalWidth,
          cropHeight:
            naturalHeight,
        });

        editor.setActiveTool(
          "select"
        );

        if (
          fileInputRef.current
        ) {
          fileInputRef.current.value =
            "";
        }
      };

      img.onerror = () => {
        alert(
          "Unable to load this image."
        );

        if (
          fileInputRef.current
        ) {
          fileInputRef.current.value =
            "";
        }
      };

      img.src = result;
    };

    reader.onerror = () => {
      alert(
        "Unable to read this image."
      );

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    };

    reader.readAsDataURL(
      file
    );
  }

  /* =======================================================
     REORDER LAYERS
     ======================================================= */

  function handleReorderLayers(
    draggedId: string,
    targetId: string
  ) {
    if (
      draggedId === targetId
    ) {
      return;
    }

    const ordered = [
      ...editor.page.elements,
    ].sort(
      (a, b) =>
        b.zIndex - a.zIndex
    );

    const draggedIndex =
      ordered.findIndex(
        (el) =>
          el.id === draggedId
      );

    const targetIndex =
      ordered.findIndex(
        (el) =>
          el.id === targetId
      );

    if (
      draggedIndex < 0 ||
      targetIndex < 0
    ) {
      return;
    }

    const next = [
      ...ordered,
    ];

    const [dragged] =
      next.splice(
        draggedIndex,
        1
      );

    const newTargetIndex =
      next.findIndex(
        (el) =>
          el.id === targetId
      );

    next.splice(
      newTargetIndex,
      0,
      dragged
    );

    const reordered =
      next.map(
        (el, index) => ({
          ...el,
          zIndex:
            next.length -
            1 -
            index,
        })
      );

    editor.setPage({
      ...editor.page,
      elements:
        reordered,
    });
  }

  /* =======================================================
     EXPORT
     ======================================================= */

  async function handleExportPng() {
    await exportService.downloadAsPng(
      editor.page,
      `${
        projectTitle ||
        "design"
      }.png`
    );
  }

  /* =======================================================
     ISSUE CLICK
     ======================================================= */

  function handleIssueClick(
    elementId?: string
  ) {
    if (!elementId) {
      return;
    }

    editor.selectElement(
      elementId
    );
  }

  /* =======================================================
     SCORE
     ======================================================= */

  const score =
    analysis?.score ?? 0;

  function scoreLabel(
    value: number
  ) {
    if (value >= 90) {
      return "Excellent";
    }

    if (value >= 75) {
      return "Strong";
    }

    if (value >= 60) {
      return "Needs work";
    }

    return "Needs attention";
  }

  /* =======================================================
     RENDER
     ======================================================= */

  const isDark = editorTheme === "dark";

  return (
    <div className={`flex h-screen w-screen flex-col transition-colors duration-300 ${isDark ? "bg-zinc-950" : "bg-slate-100"}`}>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={
          handleImageUpload
        }
        className="hidden"
      />

      {/* ===================================================
          TOP BAR
          =================================================== */}

      <TopBar
        title={projectTitle}
        onTitleChange={handleTitleChange}
        zoomPercent={Math.round(zoom * 100)}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onFitToScreen={handleFitToScreen}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        onUndo={editor.undo}
        onRedo={editor.redo}
        onExportPng={handleExportPng}
        onBack={onBack}
        theme={editorTheme}
        onToggleTheme={() => setEditorTheme(prev => prev === "dark" ? "light" : "dark")}
        onOpenAssetAdmin={() => setAssetAdminOpen(true)}
      />

      {/* ===================================================
          EDITOR AREA
          =================================================== */}

      <div className="relative flex min-h-0 flex-1 overflow-hidden">

        {/* =================================================
            LEFT TOOLBAR
            ================================================= */}

        <Toolbar
          activeTool={editor.activeTool}
          onSelectTool={handleToolSelect}
          activeTab={activeSidebarTab}
          onSelectTab={setActiveSidebarTab}
          onOpenBgRemover={() => setBgRemoverOpen(true)}
          theme={editorTheme}
        />

        {/* =================================================
            SIDEBAR PANELS — rendered based on active tab
            ================================================= */}

        {/* TEXT PANEL */}
        {activeSidebarTab === "text" && (
          <TextPanel
            selectedElement={editor.selectedElements[0]}
            onAddHeading={handleAddHeading}
            onAddSubheading={handleAddSubheading}
            onAddBodyText={handleAddBodyText}
            onAddStyledText={handleAddStyledText}
            onUpdateElement={(patch) => {
              const sel = editor.selectedElements[0];
              if (sel) editor.updateElement(sel.id, patch as Partial<CanvasElement>);
            }}
            onOpenFontLibrary={() => setActiveSidebarTab("fonts")}
            onMagicWrite={() => setCoachOpen(true)}
          />
        )}

        {/* FONT LIBRARY PANEL */}
        {activeSidebarTab === "fonts" && (
          <FontsPanel
            currentFontFamily={
              (() => {
                const sel = editor.selectedElements[0];
                return sel && isText(sel) ? sel.fontFamily : "Inter";
              })()
            }
            hasSelectedText={
              editor.selectedElements.some(isText)
            }
            onSelectFont={handleSelectFont}
            onAddTextWithFont={handleAddTextWithFont}
          />
        )}

        {/* ELEMENTS PANEL */}
        {activeSidebarTab === "elements" && (
          <ElementsPanel
            onAddShape={handleAddShape}
          />
        )}

        {/* FRAMES PANEL */}
        {activeSidebarTab === "frames" && (
          <FramesPanel
            onAddFrame={handleAddFrame}
          />
        )}

        {/* UPLOADS PANEL */}
        {activeSidebarTab === "uploads" && (
          <UploadsPanel
            onAddImageToCanvas={handleAddImageToCanvas}
            onAddVideoToCanvas={handleAddVideoToCanvas}
          />
        )}

        {/* PHOTOS PANEL */}
        {activeSidebarTab === "photos" && (
          <PhotosPanel
            onAddImageToCanvas={handleAddImageToCanvas}
          />
        )}


        {/* BRAND KIT PANEL */}
        {activeSidebarTab === "brand-kit" && (
          <BrandKitPanel
            onApplyColor={handleApplyBrandColor}
            onApplyFont={handleApplyBrandFont}
            onAddLogoToCanvas={handleAddImageToCanvas}
            onAddHeadingText={handleAddBrandHeadingText}
            onAddBodyText={handleAddBrandBodyText}
          />
        )}

        {/* BACKGROUNDS PANEL */}
        {activeSidebarTab === "backgrounds" && (
          <BackgroundsPanel
            currentBackground={editor.page.background}
            onSelectBackground={handleSelectBackground}
            onCustomColorChange={(color) => {
              editor.setPage({
                ...editor.page,
                background: color,
              });
            }}
          />
        )}

        {/* STICKERS PANEL */}
        {activeSidebarTab === "stickers" && (
          <StickersPanel
            onAddSticker={handleAddSticker}
          />
        )}

        {/* LAYERS PANEL */}
        {activeSidebarTab === "layers" && (
          <LayersPanel
            elements={editor.page.elements}
            selectedIds={editor.selectedIds}
            onSelect={editor.selectElement}
            onToggleHidden={(id) => {
              const element = find(editor, id);
              if (!element) return;
              editor.updateElement(id, { hidden: !element.hidden });
            }}
            onToggleLocked={(id) => {
              const element = find(editor, id);
              if (!element) return;
              editor.updateElement(id, { locked: !element.locked });
            }}
            onBringForward={editor.bringForward}
            onSendBackward={editor.sendBackward}
            onReorder={handleReorderLayers}
          />
        )}


        {/* IMAGE FILTERS & ADJUSTMENTS PANEL */}
        {activeSidebarTab === "filters" && selectedElement && isImage(selectedElement) && (
          <ImageFiltersPanel
            element={selectedElement}
            onChange={(patch) => editor.updateElement(selectedElement.id, patch)}
            onClose={() => setActiveSidebarTab(null)}
          />
        )}

        {/* DRAWER COLLAPSE / EXPAND TOGGLE PILL (Canva border pill handle) */}
        {activeSidebarTab && (
          <button
            type="button"
            onClick={() => setActiveSidebarTab(null)}
            className="absolute left-[442px] top-1/2 z-40 -translate-y-1/2 flex h-14 w-4 items-center justify-center rounded-r-md border-y border-r border-white/[0.1] bg-[#18191b] text-zinc-400 shadow-md transition hover:bg-[#25262b] hover:text-white"
            title="Collapse side panel"
          >
            <ChevronLeft size={14} />
          </button>
        )}

        {/* =================================================
            CANVAS WORKSPACE (CANVA DESIGN SYSTEM)
            ================================================= */}

        <div
          ref={canvasWrapperRef}
          className={`relative flex min-w-0 flex-1 flex-col h-full overflow-hidden select-none transition-colors duration-300 ${isDark ? "bg-[#0e0f12]" : "bg-slate-200"}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
        >
          {/* APPLY TO COMPLETE PAGE PROMPT */}
          {applyPrompt && (
            <ApplyToPagePrompt
              itemType={applyPrompt.itemType}
              itemName={applyPrompt.itemName}
              onApply={handleApplyPrompt}
              onDismiss={() => setApplyPrompt(null)}
            />
          )}

          {/* ── CANVA CONTEXTUAL FLOATING TOOLBAR ── */}
          <div className="absolute left-1/2 top-3.5 z-40 -translate-x-1/2 flex items-center gap-1.5 rounded-2xl border border-white/[0.09] bg-[#1a1b1e]/95 p-1.5 shadow-2xl backdrop-blur-xl text-white">
            {/* 1. When Image is Selected */}
            {isSelectedImage && !canGroup && !canUngroup && (
              <>
                <button
                  type="button"
                  onClick={() => setCoachOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/25 border border-purple-500/30 px-3 py-1.5 text-xs font-semibold text-purple-200 hover:text-white transition"
                  title="Ask Falcon AI"
                >
                  <Sparkles size={13} className="text-purple-400" />
                  <span>Ask Falcon</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSidebarTab("filters")}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                    activeSidebarTab === "filters"
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                  }`}
                  title="Image filters & adjustment sliders"
                >
                  <Sliders size={13} className="text-indigo-400" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white transition"
                  title="Replace image"
                >
                  <ImageIcon size={13} className="text-zinc-400" />
                  <span>Replace</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBgRemoverOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 px-2.5 py-1.5 text-xs font-semibold text-purple-200 hover:bg-purple-600/30 hover:text-white transition"
                  title="AI Background Remover"
                >
                  <Crown size={12} className="text-amber-400" />
                  <span>BG Remover</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    editor.setActiveTool(editor.activeTool === "crop" ? "select" : "crop");
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                    editor.activeTool === "crop"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                  }`}
                  title={editor.activeTool === "crop" ? "Exit crop mode" : "Crop image"}
                >
                  <Scissors size={13} className={editor.activeTool === "crop" ? "text-white" : "text-zinc-400"} />
                  <span>{editor.activeTool === "crop" ? "Done" : "Crop"}</span>
                </button>

                {selectedElement &&
                  isImage(selectedElement) &&
                  (selectedElement.cropX ||
                    selectedElement.cropY ||
                    (selectedElement.cropWidth &&
                      selectedElement.cropWidth !== selectedElement.naturalWidth) ||
                    (selectedElement.cropHeight &&
                      selectedElement.cropHeight !== selectedElement.naturalHeight)) && (
                    <button
                      type="button"
                      onClick={() => {
                        const el = selectedElement as ImageElement;
                        const currentCropWidth = el.cropWidth ?? el.naturalWidth;
                        const scale = el.width / (currentCropWidth || 1);
                        const fullWidth = Math.round(el.naturalWidth * scale);
                        const fullHeight = Math.round(el.naturalHeight * scale);
                        const offsetX = Math.round((el.cropX ?? 0) * scale);
                        const offsetY = Math.round((el.cropY ?? 0) * scale);
                        editor.updateElement(el.id, {
                          x: Math.round(el.x - offsetX),
                          y: Math.round(el.y - offsetY),
                          width: fullWidth,
                          height: fullHeight,
                          cropX: 0,
                          cropY: 0,
                          cropWidth: el.naturalWidth,
                          cropHeight: el.naturalHeight,
                        });
                        if (editor.activeTool === "crop") {
                          editor.setActiveTool("select");
                        }
                      }}
                      className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-400/10 transition"
                      title="Reset image crop to original full view"
                    >
                      <RotateCcw size={12} />
                      <span>Reset Crop</span>
                    </button>
                  )}

                {selectedElement &&
                  isImage(selectedElement) &&
                  selectedElement.originalSrc &&
                  selectedElement.originalSrc !== selectedElement.src && (
                    <button
                      type="button"
                      onClick={() => {
                        editor.updateElement(selectedElement.id, {
                          src: selectedElement.originalSrc,
                        });
                      }}
                      className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-400/10 transition"
                      title="Revert to original"
                    >
                      <RotateCcw size={12} />
                      <span>Revert</span>
                    </button>
                  )}

                <div className="mx-0.5 h-4 w-px bg-white/[0.1]" />

                {/* ── IMAGE BLEND (Circular / Linear) ── */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setBlendPopoverOpen(v => !v); setTransparencyPopoverOpen(false); }}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                      (selectedElement as ImageElement).blendMask && (selectedElement as ImageElement).blendMask !== "none"
                        ? "bg-indigo-600/30 border border-indigo-500/50 text-indigo-200"
                        : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                    }`}
                    title="Image Blend Mode (Circular / Linear)"
                  >
                    <Layers size={13} className="text-indigo-400" />
                    <span>Blend</span>
                    <ChevronDown size={11} className="text-zinc-400" />
                  </button>

                  {blendPopoverOpen && (
                    <>
                      {/* Backdrop */}
                      <div className="fixed inset-0 z-40" onClick={() => setBlendPopoverOpen(false)} />
                      <div className="absolute left-0 top-full mt-2 z-50 w-64 rounded-2xl border border-white/10 bg-[#161a24] p-3 shadow-2xl backdrop-blur-xl">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Image Blend Mask</p>

                        <div className="grid grid-cols-2 gap-2">
                          {/* None */}
                          <button
                            type="button"
                            onClick={() => { editor.updateElement(selectedElement.id, { blendMask: "none" }); setBlendPopoverOpen(false); }}
                            className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs transition ${
                              !((selectedElement as ImageElement).blendMask) || (selectedElement as ImageElement).blendMask === "none"
                                ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                                : "border-white/10 text-zinc-400 hover:border-indigo-400/50 hover:text-white"
                            }`}
                          >
                            <div className="h-9 w-full rounded-lg bg-white/10 flex items-center justify-center">
                              <div className="h-6 w-6 rounded bg-zinc-500" />
                            </div>
                            <span>None</span>
                          </button>

                          {/* Circular Blend */}
                          <button
                            type="button"
                            onClick={() => { editor.updateElement(selectedElement.id, { blendMask: "circular" }); setBlendPopoverOpen(false); }}
                            className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs transition ${
                              (selectedElement as ImageElement).blendMask === "circular"
                                ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                                : "border-white/10 text-zinc-400 hover:border-indigo-400/50 hover:text-white"
                            }`}
                          >
                            <div className="h-9 w-full rounded-lg overflow-hidden flex items-center justify-center bg-zinc-800">
                              <div className="h-8 w-8 rounded-full" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.9) 0%, transparent 70%)" }} />
                            </div>
                            <span>Circular</span>
                          </button>

                          {/* Linear (bottom) */}
                          <button
                            type="button"
                            onClick={() => { editor.updateElement(selectedElement.id, { blendMask: "linear" }); setBlendPopoverOpen(false); }}
                            className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs transition ${
                              (selectedElement as ImageElement).blendMask === "linear"
                                ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                                : "border-white/10 text-zinc-400 hover:border-indigo-400/50 hover:text-white"
                            }`}
                          >
                            <div className="h-9 w-full rounded-lg overflow-hidden bg-zinc-800">
                              <div className="h-full w-full" style={{ background: "linear-gradient(to top, transparent, rgba(99,102,241,0.7))" }} />
                            </div>
                            <span>Linear ↑</span>
                          </button>

                          {/* Linear Top */}
                          <button
                            type="button"
                            onClick={() => { editor.updateElement(selectedElement.id, { blendMask: "linear-top" }); setBlendPopoverOpen(false); }}
                            className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs transition ${
                              (selectedElement as ImageElement).blendMask === "linear-top"
                                ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                                : "border-white/10 text-zinc-400 hover:border-indigo-400/50 hover:text-white"
                            }`}
                          >
                            <div className="h-9 w-full rounded-lg overflow-hidden bg-zinc-800">
                              <div className="h-full w-full" style={{ background: "linear-gradient(to bottom, transparent, rgba(99,102,241,0.7))" }} />
                            </div>
                            <span>Linear ↓</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* ── TRANSPARENCY (dark + light mode) ── */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setTransparencyPopoverOpen(v => !v); setBlendPopoverOpen(false); }}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                      isDark
                        ? "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                    title={`Transparency: ${Math.round((selectedElement.opacity ?? 1) * 100)}%`}
                  >
                    <Eye size={13} className={isDark ? "text-zinc-400" : "text-slate-400"} />
                    <span>{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                    <ChevronDown size={11} className={isDark ? "text-zinc-400" : "text-slate-400"} />
                  </button>

                  {transparencyPopoverOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setTransparencyPopoverOpen(false)} />
                      <div className={`absolute left-0 top-full mt-2 z-50 w-52 rounded-2xl border p-3.5 shadow-2xl backdrop-blur-xl ${
                        isDark
                          ? "border-white/10 bg-[#161a24]"
                          : "border-slate-200 bg-white"
                      }`}>
                        <p className={`mb-2.5 text-[10px] font-semibold uppercase tracking-wider ${
                          isDark ? "text-zinc-400" : "text-slate-500"
                        }`}>Transparency</p>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={Math.round((selectedElement.opacity ?? 1) * 100)}
                            onChange={(e) => editor.updateElement(selectedElement.id, { opacity: Number(e.target.value) / 100 })}
                            className={`flex-1 h-1.5 cursor-pointer ${
                              isDark ? "accent-indigo-500" : "accent-indigo-600"
                            }`}
                          />
                          <span className={`w-9 text-right text-xs font-semibold tabular-nums ${
                            isDark ? "text-white" : "text-slate-800"
                          }`}>
                            {Math.round((selectedElement.opacity ?? 1) * 100)}%
                          </span>
                        </div>
                        {/* Quick presets */}
                        <div className="mt-2.5 flex gap-1.5">
                          {[100, 75, 50, 25].map(v => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => editor.updateElement(selectedElement.id, { opacity: v / 100 })}
                              className={`flex-1 rounded-lg py-1 text-[10px] font-medium transition ${
                                Math.round((selectedElement.opacity ?? 1) * 100) === v
                                  ? "bg-indigo-600 text-white"
                                  : isDark
                                  ? "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                              }`}
                            >
                              {v}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mx-0.5 h-4 w-px bg-white/[0.1]" />

                <button
                  type="button"
                  onClick={() => {
                    const el = selectedElement as ImageElement;
                    editor.updateElement(el.id, {
                      rotation: (el.rotation + 180) % 360,
                    });
                  }}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white transition"
                  title="Rotate / Flip (180°)"
                >
                  <FlipHorizontal size={14} />
                </button>

                <div className="mx-0.5 h-4 w-px bg-white/[0.1]" />

                <button
                  type="button"
                  onClick={() => editor.duplicateSelected()}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white transition"
                  title="Duplicate (Ctrl+D)"
                >
                  <Copy size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => editor.deleteSelected()}
                  className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/15 transition"
                  title="Delete (Del)"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}

            {/* 2. When Text is Selected */}
            {isSelectedText && !canGroup && !canUngroup && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveSidebarTab("fonts")}
                  className="flex items-center gap-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] px-3 py-1.5 text-xs text-white transition max-w-[140px]"
                  title="Change font family"
                >
                  <span className="truncate font-medium" style={{ fontFamily: (selectedElement as TextElement).fontFamily }}>
                    {(selectedElement as TextElement).fontFamily}
                  </span>
                  <ChevronDown size={12} className="text-zinc-400 shrink-0" />
                </button>

                <FontSizeControl
                  fontSize={(selectedElement as TextElement).fontSize}
                  onChange={(newSize, opts) => {
                    editor.updateElement(
                      selectedElement!.id,
                      { fontSize: newSize },
                      opts
                    );
                  }}
                />

                {/* ─ COLOR PICKER SWATCH ─ */}
                <div className="relative">
                  <button
                    ref={colorPickerAnchorRef}
                    type="button"
                    onClick={() => setColorPickerOpen((v) => !v)}
                    className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition"
                    title="Text color"
                  >
                    <span className="relative flex h-5 w-5 items-center justify-center">
                      {/* Big "A" */}
                      <span className="text-sm font-bold text-white leading-none">A</span>
                      {/* Color underline bar */}
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full"
                        style={{
                          backgroundColor:
                            (selectedElement as TextElement).backgroundGradient
                              ? "transparent"
                              : (selectedElement as TextElement).color || "#ffffff",
                          background: (selectedElement as TextElement).backgroundGradient
                            ? (selectedElement as TextElement).backgroundGradient
                            : undefined,
                        }}
                      />
                    </span>
                  </button>

                  {colorPickerOpen && isSelectedText && (
                    <ColorPickerPopover
                      color={
                        /^#[0-9a-fA-F]{6}$/i.test((selectedElement as TextElement).color || "")
                          ? (selectedElement as TextElement).color!
                          : "#ffffff"
                      }
                      onChange={(hex) => {
                        editor.updateElement(selectedElement!.id, {
                          color: hex,
                          // Remove gradient if manually setting a solid color
                          backgroundGradient: undefined,
                        } as Partial<TextElement>);
                      }}
                      onClose={() => setColorPickerOpen(false)}
                      designColors={editor.page.elements
                        .filter(isText)
                        .map((el) => (el as TextElement).color)
                        .filter((c): c is string => /^#[0-9a-fA-F]{6}$/i.test(c || ""))}
                      anchorRef={colorPickerAnchorRef as React.RefObject<HTMLElement | null>}
                    />
                  )}
                </div>

                <div className="mx-0.5 h-4 w-px bg-white/[0.1]" />

                <button
                  type="button"
                  onClick={() => {
                    const el = selectedElement as TextElement;
                    editor.updateElement(el.id, {
                      fontWeight: el.fontWeight >= 700 ? 400 : 700,
                    });
                  }}
                  className={`rounded-lg p-1.5 transition ${
                    (selectedElement as TextElement).fontWeight >= 700
                      ? "bg-white/20 text-white"
                      : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                  title="Bold"
                >
                  <Bold size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = selectedElement as TextElement;
                    editor.updateElement(el.id, {
                      italic: !el.italic,
                    });
                  }}
                  className={`rounded-lg p-1.5 transition ${
                    (selectedElement as TextElement).italic
                      ? "bg-white/20 text-white"
                      : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                  title="Italic"
                >
                  <Italic size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = selectedElement as TextElement;
                    editor.updateElement(el.id, {
                      textTransform: el.textTransform === "uppercase" ? "none" : "uppercase",
                    });
                  }}
                  className={`rounded-lg px-1.5 py-1 text-xs font-semibold transition ${
                    (selectedElement as TextElement).textTransform === "uppercase"
                      ? "bg-white/20 text-white"
                      : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                  title="Uppercase (aA)"
                >
                  aA
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = selectedElement as TextElement;
                    const nextAlign: Record<string, "left" | "center" | "right"> = {
                      left: "center",
                      center: "right",
                      right: "left",
                    };
                    editor.updateElement(el.id, {
                      align: nextAlign[el.align || "left"],
                    });
                  }}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white transition"
                  title={`Alignment: ${(selectedElement as TextElement).align || "left"}`}
                >
                  {(selectedElement as TextElement).align === "center" ? (
                    <AlignCenter size={13} />
                  ) : (selectedElement as TextElement).align === "right" ? (
                    <AlignRight size={13} />
                  ) : (
                    <AlignLeft size={13} />
                  )}
                </button>

                <div className="mx-0.5 h-4 w-px bg-white/[0.1]" />

                {/* Effects (Opens Text Tab with 100+ Styles) */}
                <button
                  type="button"
                  onClick={() => setActiveSidebarTab("text")}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
                    activeSidebarTab === "text"
                      ? "bg-[#8b3dff] text-white"
                      : "bg-[#8b3dff]/15 border border-[#8b3dff]/30 text-purple-300 hover:text-white hover:bg-[#8b3dff]/25"
                  }`}
                  title="Browse 100+ Text Design Styles"
                >
                  <Sparkles size={13} className="text-purple-400" />
                  <span>Effects</span>
                </button>

                {/* Transparency for Text (dark + light mode) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setTransparencyPopoverOpen(v => !v); setBlendPopoverOpen(false); }}
                    className={`flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-medium transition ${
                      isDark
                        ? "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                    title={`Transparency: ${Math.round((selectedElement.opacity ?? 1) * 100)}%`}
                  >
                    <Eye size={13} className={isDark ? "text-zinc-400" : "text-slate-400"} />
                    <span>{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                  </button>

                  {transparencyPopoverOpen && isSelectedText && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setTransparencyPopoverOpen(false)} />
                      <div className={`absolute left-0 top-full mt-2 z-50 w-52 rounded-2xl border p-3.5 shadow-2xl backdrop-blur-xl ${
                        isDark
                          ? "border-white/10 bg-[#161a24]"
                          : "border-slate-200 bg-white"
                      }`}>
                        <p className={`mb-2.5 text-[10px] font-semibold uppercase tracking-wider ${
                          isDark ? "text-zinc-400" : "text-slate-500"
                        }`}>Transparency</p>
                        <div className="flex items-center gap-3">
                          <input
                            type="range" min={0} max={100}
                            value={Math.round((selectedElement.opacity ?? 1) * 100)}
                            onChange={(e) => editor.updateElement(selectedElement.id, { opacity: Number(e.target.value) / 100 })}
                            className={`flex-1 h-1.5 cursor-pointer ${
                              isDark ? "accent-indigo-500" : "accent-indigo-600"
                            }`}
                          />
                          <span className={`w-9 text-right text-xs font-semibold tabular-nums ${
                            isDark ? "text-white" : "text-slate-800"
                          }`}>{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                        </div>
                        <div className="mt-2.5 flex gap-1.5">
                          {[100, 75, 50, 25].map(v => (
                            <button key={v} type="button"
                              onClick={() => editor.updateElement(selectedElement.id, { opacity: v / 100 })}
                              className={`flex-1 rounded-lg py-1 text-[10px] font-medium transition ${
                                Math.round((selectedElement.opacity ?? 1) * 100) === v
                                  ? "bg-indigo-600 text-white"
                                  : isDark
                                  ? "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                              }`}>{v}%</button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mx-0.5 h-4 w-px bg-white/[0.1]" />

                <button
                  type="button"
                  onClick={() => editor.duplicateSelected()}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white transition"
                  title="Duplicate text"
                >
                  <Copy size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => editor.deleteSelected()}
                  className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/15 transition"
                  title="Delete text"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}

            {/* 3. When Shape is Selected */}
            {isSelectedShape && !canGroup && !canUngroup && (
              <>
                <span className="text-xs font-medium text-zinc-300 px-2 capitalize">
                  {(selectedElement as ShapeElement).type}
                </span>

                <div className="flex items-center gap-1.5 px-2">
                  <span className="text-[11px] text-zinc-400">Fill</span>
                  <input
                    type="color"
                    value={(selectedElement as ShapeElement).fill || "#ffffff"}
                    onChange={(e) =>
                      editor.updateElement(selectedElement.id, { fill: e.target.value })
                    }
                    className="h-6 w-6 cursor-pointer rounded-full border border-white/20 bg-transparent"
                    title="Shape fill color"
                  />
                </div>

                <div className="flex items-center gap-1.5 px-2">
                  <span className="text-[11px] text-zinc-400">Border</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={(selectedElement as ShapeElement).strokeWidth || 0}
                    onChange={(e) =>
                      editor.updateElement(selectedElement.id, {
                        strokeWidth: Number(e.target.value),
                      })
                    }
                    className="h-6 w-12 rounded bg-zinc-800 px-1 text-center text-xs text-white"
                  />
                </div>

                <div className="mx-0.5 h-4 w-px bg-white/[0.1]" />

                <button
                  type="button"
                  onClick={() => editor.duplicateSelected()}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white transition"
                  title="Duplicate shape"
                >
                  <Copy size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => editor.deleteSelected()}
                  className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/15 transition"
                  title="Delete shape"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}

            {/* 4. When Frame is Selected */}
            {isSelectedFrame && !canGroup && !canUngroup && (
              <>
                <span className="text-xs font-semibold text-pink-300 px-2 flex items-center gap-1.5">
                  <Frame size={13} />
                  <span>{(selectedElement as FrameElement).frameShape} frame</span>
                </span>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-xl bg-pink-500/20 border border-pink-500/30 px-3 py-1.5 text-xs font-medium text-pink-200 hover:bg-pink-500/30 transition"
                  title="Upload / Replace image inside frame"
                >
                  <ImageIcon size={13} />
                  <span>{(selectedElement as FrameElement).imageSrc ? "Replace Image" : "Add Image"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSidebarTab("frames")}
                  className="rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.06] transition"
                  title="Browse frame shapes"
                >
                  Change Shape
                </button>

                <div className="mx-0.5 h-4 w-px bg-white/[0.1]" />

                <button
                  type="button"
                  onClick={() => editor.duplicateSelected()}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white transition"
                  title="Duplicate frame"
                >
                  <Copy size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => editor.deleteSelected()}
                  className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/15 transition"
                  title="Delete frame"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}

            {/* 5. Group / Ungroup controls */}
            {canGroup && (
              <button
                type="button"
                onClick={() => editor.groupSelected()}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/30 transition"
                title="Group selected elements (Ctrl+G)"
              >
                <Group size={14} />
                <span>Group</span>
                <span className="text-[10px] text-zinc-400 font-mono">Ctrl G</span>
              </button>
            )}

            {canUngroup && (
              <button
                type="button"
                onClick={() => editor.ungroupSelected()}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/30 transition"
                title="Ungroup (Ctrl+Shift+G)"
              >
                <Ungroup size={14} />
                <span>Ungroup</span>
              </button>
            )}

            {/* 6. When Nothing is Selected (Default Canvas Toolbar) */}
            {!selectedElement && !canGroup && !canUngroup && (
              <>
                <div className="flex items-center gap-2 px-2">
                  <span className="text-xs text-zinc-400 font-medium">Canvas:</span>
                  <span className="text-xs text-white font-mono">
                    {editor.page.size.width} × {editor.page.size.height}
                  </span>
                </div>

                {editor.page.background && editor.page.background !== "transparent" && (
                  <button
                    type="button"
                    onClick={() => {
                      const prev = editor.page;
                      const first = prev.elements[0];
                      const isBgRect =
                        first &&
                        first.type === "rectangle" &&
                        first.width >= prev.size.width * 0.8 &&
                        first.height >= prev.size.height * 0.8;

                      editor.setPage({
                        ...prev,
                        background: "transparent",
                        elements: isBgRect ? prev.elements.slice(1) : prev.elements,
                      });
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/[0.08] transition"
                    title="Remove canvas background color"
                  >
                    <span>Remove Canvas BG</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setLayoutSelectorOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition"
                  title="Change layout dimensions"
                >
                  <LayoutGrid size={13} className="text-emerald-400" />
                  <span>Change Layout</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/ai-studio")}
                  className="flex items-center gap-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition"
                  title="Open Falcon AI Studio"
                >
                  <Sparkles size={13} className="text-indigo-400" />
                  <span>AI Studio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCoachOpen((prev) => !prev)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-medium transition ${
                    coachOpen
                      ? "bg-indigo-600 text-white"
                      : "border border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08]"
                  }`}
                  title="Falcon AI Coach"
                >
                  <Brain size={13} className="text-indigo-400" />
                  <span>AI Coach</span>
                </button>
              </>
            )}
          </div>

          {/* ── CANVAS WORKSPACE ── */}
          <div className="relative flex-1 w-full overflow-hidden">
            <Canvas
              page={editor.page}
              zoom={zoom}
              pan={pan}
              selectedIds={editor.selectedIds}
              activeTool={editor.activeTool}
              onSelect={editor.selectElement}
              onElementChange={(id, patch, opts) =>
                editor.updateElement(id, patch as any, opts)
              }
              onCanvasClick={handleCanvasClick}
              onWheel={onWheel}
              onToolChange={editor.setActiveTool}
            />
          </div>

          {/* ── CANVA BOTTOM FILMSTRIP & CONTROLS FOOTER ── */}
          <div className="flex h-13 w-full shrink-0 items-center justify-between border-t border-white/[0.08] bg-[#111214] px-4 select-none z-30">
            {/* Left: Notes & Timer */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
                title="Design notes"
              >
                <StickyNote size={13} />
                <span>Notes</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
                title="Timer"
              >
                <Timer size={13} />
                <span>Timer</span>
              </button>
            </div>

            {/* Center: Page Filmstrip Thumbnails */}
            <div className="flex items-center gap-2">
              <div
                className="group relative flex h-8 w-12 items-center justify-center overflow-hidden rounded-md border-2 border-[#8b3dff] bg-white shadow-md cursor-pointer transition hover:scale-105"
                title="Page 1"
              >
                <div
                  className="h-full w-full"
                  style={{
                    backgroundColor:
                      editor.page.background === "transparent"
                        ? "#ffffff"
                        : editor.page.background || "#ffffff",
                  }}
                />
                <span className="absolute bottom-0.5 left-1 rounded bg-black/60 px-1 text-[8px] font-bold text-white">
                  1
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddHeading}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-dashed border-zinc-700 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
                title="Add element to page"
              >
                <Plus size={13} />
              </button>
            </div>

            {/* Right: Zoom Slider & View Options */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="rounded p-1 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
                  title="Zoom out"
                >
                  <Minus size={13} />
                </button>

                <input
                  type="range"
                  min={10}
                  max={300}
                  value={Math.round(zoom * 100)}
                  onChange={(e) => {
                    const targetZoom = Number(e.target.value) / 100;
                    if (targetZoom > zoom) {
                      zoomIn();
                    } else {
                      zoomOut();
                    }
                  }}
                  className="w-20 h-1 accent-white cursor-pointer bg-zinc-700 rounded"
                />

                <button
                  type="button"
                  onClick={zoomIn}
                  className="rounded p-1 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
                  title="Zoom in"
                >
                  <Plus size={13} />
                </button>

                <button
                  type="button"
                  onClick={resetZoom}
                  className="font-mono text-xs text-zinc-300 hover:text-white transition w-10 text-right"
                  title="Reset zoom to 100%"
                >
                  {Math.round(zoom * 100)}%
                </button>
              </div>

              <div className="h-4 w-px bg-white/[0.1]" />

              <button
                type="button"
                onClick={handleFitToScreen}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
                title="Fit to screen"
              >
                <Maximize2 size={13} />
                <span>Fit</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
                title="Pages view"
              >
                <LayoutGrid size={13} />
                <span>1 / 1</span>
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            AI COACH PANEL
            PROPERTIES PANEL IS GONE
            ================================================= */}

        {coachOpen && (
          <aside
            className="
              relative
              z-50
              flex
              h-full
              min-h-0
              w-[320px]
              shrink-0
              flex-col
              overflow-hidden
              border-l
              border-white/[0.07]
              bg-[#0d0d10]
            "
          >

            {/* =================================================
                AI COACH HEADER
                ================================================= */}

            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-4 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Brain
                    size={19}
                  />
                </div>

                <div>
                  <p className="text-base font-semibold text-white">
                    Falcon AI Coach
                  </p>

                  <p className="text-xs text-zinc-500">
                    Design intelligence
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-1.5">

                <button
                  type="button"
                  onClick={() => {
                    runDesignAnalysis();
                    runDesignDNA();
                  }}
                  className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
                  title="Analyze design"
                >
                  <RefreshCw
                    size={16}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCoachOpen(false)
                  }
                  className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
                  title="Close AI Coach"
                >
                  <X
                    size={17}
                  />
                </button>

              </div>

            </div>

            {/* =================================================
                DESIGN SCORE
                ================================================= */}

            <div className="shrink-0 border-b border-white/[0.07] p-4">

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      Design Score
                    </p>

                    <div className="mt-2 flex items-end gap-2">

                      <span className="text-5xl font-semibold tracking-tight text-white">
                        {score}
                      </span>

                      <span className="mb-1.5 text-base text-zinc-600">
                        / 100
                      </span>

                    </div>

                    <p className="mt-1 text-sm text-indigo-400">
                      {scoreLabel(
                        score
                      )}
                    </p>

                  </div>

                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-500/5">

                    <Sparkles
                      size={22}
                      className="text-indigo-400"
                    />

                  </div>

                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{
                      width: `${score}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">

              {/* =================================================
                  DESIGN HEALTH
                  ================================================= */}

              <div className="border-b border-white/[0.07] p-4">

                <div className="mb-3 flex items-center justify-between">

                  <p className="text-sm font-medium text-zinc-300">
                    Design health
                  </p>

                  <button
                    type="button"
                    onClick={
                      runDesignAnalysis
                    }
                    className="text-xs text-zinc-500 hover:text-white"
                  >
                    Re-analyze
                  </button>

                </div>

                <div className="space-y-3">

                  {analysis && (
                    <>
                      <ScoreRow
                        label="Alignment"
                        value={
                          analysis
                            .breakdown
                            .alignment
                        }
                      />

                      <ScoreRow
                        label="Spacing"
                        value={
                          analysis
                            .breakdown
                            .spacing
                        }
                      />

                      <ScoreRow
                        label="Contrast"
                        value={
                          analysis
                            .breakdown
                            .contrast
                        }
                      />

                      <ScoreRow
                        label="Hierarchy"
                        value={
                          analysis
                            .breakdown
                            .hierarchy
                        }
                      />

                      <ScoreRow
                        label="Readability"
                        value={
                          analysis
                            .breakdown
                            .readability
                        }
                      />
                    </>
                  )}

                </div>

              </div>

              {/* =================================================
                  DESIGN DNA
                  ================================================= */}

              <div className="border-b border-white/[0.07] p-4">

                <div className="mb-3 flex items-center justify-between">

                  <div className="flex items-center gap-2.5">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Sparkles
                        size={15}
                      />
                    </div>

                    <div>

                      <p className="text-sm font-medium text-zinc-300">
                        Design DNA
                      </p>

                      <p className="text-xs text-zinc-600">
                        Your visual identity
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      runDesignDNA
                    }
                    className="rounded-lg p-2 text-zinc-600 transition hover:bg-white/[0.05] hover:text-indigo-300"
                    title="Refresh Design DNA"
                  >
                    <RefreshCw
                      size={14}
                    />
                  </button>

                </div>

                {designDNA ? (
                  <div className="space-y-3">

                    <div className="grid grid-cols-2 gap-2">

                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">

                        <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600">
                          Visual style
                        </p>

                        <p className="mt-1 text-xs font-medium capitalize text-zinc-300">
                          {
                            designDNA.visualStyle
                          }
                        </p>

                      </div>

                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">

                        <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600">
                          Typography
                        </p>

                        <p className="mt-1 text-xs font-medium capitalize text-zinc-300">
                          {
                            designDNA.typographyStyle
                          }
                        </p>

                      </div>

                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">

                      <div className="mb-2 flex items-center gap-2">

                        <Type
                          size={14}
                          className="text-indigo-400"
                        />

                        <p className="text-xs font-medium text-zinc-400">
                          Typography system
                        </p>

                      </div>

                      <div className="space-y-2">

                        <div className="flex items-center justify-between gap-3">

                          <div className="min-w-0">

                            <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-700">
                              Heading
                            </p>

                            <p className="truncate text-xs text-zinc-300">
                              {
                                designDNA.headingFont
                              }
                            </p>

                          </div>

                          <span className="shrink-0 rounded-md bg-white/[0.04] px-2 py-1 text-[10px] text-zinc-500">
                            {
                              designDNA.headingWeight
                            }
                          </span>

                        </div>

                        <div className="h-px bg-white/[0.05]" />

                        <div className="flex items-center justify-between gap-3">

                          <div className="min-w-0">

                            <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-700">
                              Body
                            </p>

                            <p className="truncate text-xs text-zinc-300">
                              {
                                designDNA.bodyFont
                              }
                            </p>

                          </div>

                          <span className="shrink-0 rounded-md bg-white/[0.04] px-2 py-1 text-[10px] text-zinc-500">
                            {
                              designDNA.bodyWeight
                            }
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">

                      <div className="mb-2 flex items-center gap-2">

                        <Palette
                          size={14}
                          className="text-indigo-400"
                        />

                        <p className="text-xs font-medium text-zinc-400">
                          Color palette
                        </p>

                      </div>

                      <div className="grid grid-cols-3 gap-2">

                        <ColorSwatch
                          label="Primary"
                          value={
                            designDNA.primaryColor
                          }
                        />

                        <ColorSwatch
                          label="Secondary"
                          value={
                            designDNA.secondaryColor
                          }
                        />

                        <ColorSwatch
                          label="Background"
                          value={
                            designDNA.backgroundColor
                          }
                        />

                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-2">

                      <MiniStat
                        label="Avg spacing"
                        value={`${designDNA.averageSpacing}px`}
                      />

                      <MiniStat
                        label="Corner radius"
                        value={`${designDNA.averageCornerRadius}px`}
                      />

                    </div>

                  </div>
                ) : (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4 text-center">

                    <Sparkles
                      size={17}
                      className="mx-auto text-indigo-400"
                    />

                    <p className="mt-2 text-xs text-zinc-500">
                      Generating your visual identity...
                    </p>

                  </div>
                )}

              </div>

              {/* =================================================
                  COACH INSIGHTS
                  ================================================= */}

              <div className="p-4">

                <div className="mb-3 flex items-center justify-between">

                  <p className="text-sm font-medium text-zinc-300">
                    Coach insights
                  </p>

                  <span className="text-xs text-zinc-600">
                    {
                      analysis?.issues
                        .length ??
                      0
                    }{" "}
                    issues
                  </span>

                </div>

                {issueFixMessage && (
                  <div className="mb-3 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] px-3 py-2.5">

                    <div className="flex items-center gap-2">

                      <CheckCircle2
                        size={15}
                        className="shrink-0 text-emerald-400"
                      />

                      <p className="text-xs leading-4 text-emerald-300">
                        {
                          issueFixMessage
                        }
                      </p>

                    </div>

                  </div>
                )}

                {!analysis ||
                analysis.issues
                  .length === 0 ? (
                  <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.04] p-4">

                    <div className="flex gap-3">

                      <CheckCircle2
                        size={19}
                        className="mt-0.5 shrink-0 text-emerald-400"
                      />

                      <div>

                        <p className="text-sm font-medium text-emerald-300">
                          Looking good
                        </p>

                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          Your design currently has
                          no major issues detected.
                        </p>

                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="space-y-2">

                    {analysis.issues.map(
                      (issue) => {

                        const isFixing =
                          fixingIssueId ===
                          issue.id;

                        const canAutoFix =
                          issue.type !==
                            "spacing" &&
                          issue.type !==
                            "layout";

                        return (
                          <div
                            key={
                              issue.id
                            }
                            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5 transition hover:border-indigo-500/20 hover:bg-white/[0.04]"
                          >

                            <div className="flex gap-3">

                              <div className="mt-0.5 shrink-0">

                                {issue.severity ===
                                "high" ? (
                                  <AlertTriangle
                                    size={17}
                                    className="text-red-400"
                                  />
                                ) : (
                                  <Sparkles
                                    size={17}
                                    className="text-indigo-400"
                                  />
                                )}

                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-2">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleIssueClick(
                                        issue.elementId
                                      )
                                    }
                                    className="min-w-0 text-left"
                                  >

                                    <p className="text-sm font-medium text-zinc-200">
                                      {
                                        issue.title
                                      }
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                                      {
                                        issue.description
                                      }
                                    </p>

                                  </button>

                                  <ChevronRight
                                    size={14}
                                    className="mt-1 shrink-0 text-zinc-700"
                                  />

                                </div>

                                <p className="mt-2 text-xs leading-4 text-indigo-400/80">
                                  {
                                    issue.suggestion
                                  }
                                </p>

                                <div className="mt-3 flex items-center gap-2">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleIssueClick(
                                        issue.elementId
                                      )
                                    }
                                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
                                  >

                                    <ChevronRight
                                      size={12}
                                    />

                                    Inspect

                                  </button>

                                  {canAutoFix ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleFixIssue(
                                          issue
                                        )
                                      }
                                      disabled={
                                        !!fixingIssueId ||
                                        isImproving
                                      }
                                      className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                      {isFixing ? (
                                        <>
                                          <RefreshCw
                                            size={12}
                                            className="animate-spin"
                                          />

                                          Fixing...
                                        </>
                                      ) : (
                                        <>
                                          <Wrench
                                            size={12}
                                          />

                                          Fix
                                        </>
                                      )}

                                    </button>
                                  ) : (
                                    <span className="rounded-lg border border-white/[0.06] px-2.5 py-1.5 text-[11px] text-zinc-600">
                                      Manual review
                                    </span>
                                  )}

                                </div>

                              </div>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              </div>

            </div>

            {/* =================================================
                AI ACTIONS
                ================================================= */}

            <div className="shrink-0 border-t border-white/[0.07] bg-[#0d0d10] p-3">

              <button
                type="button"
                onClick={
                  handleOpenCampaign
                }
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/[0.08] hover:text-white"
              >
                <LayoutGrid
                  size={16}
                  className="text-indigo-400"
                />

                One → Many
              </button>

              {remixMessage && (
                <div className="mb-2 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] px-3 py-2.5">

                  <div className="flex items-start gap-2">

                    <Check
                      size={15}
                      className="mt-0.5 shrink-0 text-emerald-400"
                    />

                    <p className="text-xs leading-4 text-emerald-300">
                      {
                        remixMessage
                      }
                    </p>

                  </div>

                </div>
              )}

              <button
                type="button"
                onClick={
                  handleOpenRemix
                }
                disabled={
                  isGeneratingRemixes
                }
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.08] px-4 py-3 text-sm font-semibold text-indigo-300 transition hover:border-indigo-500/40 hover:bg-indigo-500/[0.14] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >

                {isGeneratingRemixes ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />

                    Creating remixes...
                  </>
                ) : (
                  <>
                    <Zap
                      size={16}
                    />

                    Smart Remix
                  </>
                )}

              </button>

              {improvementMessage && (
                <div className="mb-2 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.04] px-3 py-2.5">

                  <p className="text-xs leading-4 text-indigo-300">
                    {
                      improvementMessage
                    }
                  </p>

                </div>
              )}

              <button
                type="button"
                onClick={
                  handleImproveDesign
                }
                disabled={
                  isImproving
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {isImproving ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />

                    Improving...
                  </>
                ) : (
                  <>
                    <Wand2
                      size={16}
                    />

                    Improve Design
                  </>
                )}

              </button>

              <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/[0.025] px-3 py-2.5">

                <Sparkles
                  size={15}
                  className="text-indigo-400"
                />

                <p className="text-xs leading-4 text-zinc-500">
                  Falcon analyzes your composition and
                  applies safe visual improvements.
                </p>

              </div>

            </div>

          </aside>
        )}

        {/* =================================================
            ONE → MANY MODAL
            ================================================= */}

        {campaignOpen && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/65 p-6 backdrop-blur-sm">

            <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/[0.09] bg-[#111114] shadow-2xl">

              <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <LayoutGrid
                      size={20}
                    />
                  </div>

                  <div>

                    <p className="text-base font-semibold text-white">
                      One → Many
                    </p>

                    <p className="text-xs text-zinc-500">
                      Turn one design into a complete campaign
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    handleCloseCampaign
                  }
                  disabled={
                    isGeneratingCampaign ||
                    isCreatingCampaignProjects
                  }
                  className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                >
                  <X
                    size={18}
                  />
                </button>

              </div>

              <div className="max-h-[70vh] overflow-y-auto p-6">

                <div className="mb-6">

                  <p className="text-sm font-medium text-zinc-300">
                    Choose campaign formats
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Falcon will adapt your current composition to each selected platform.
                  </p>

                </div>

                <div className="grid grid-cols-5 gap-3">

                  {CAMPAIGN_FORMATS.map(
                    (format) => {

                      const selected =
                        selectedCampaignFormats.includes(
                          format.id
                        );

                      const Icon =
                        getCampaignIcon(
                          format.id
                        );

                      return (
                        <button
                          key={
                            format.id
                          }
                          type="button"
                          onClick={() =>
                            toggleCampaignFormat(
                              format.id
                            )
                          }
                          disabled={
                            isGeneratingCampaign ||
                            isCreatingCampaignProjects
                          }
                          className={`relative rounded-2xl border p-4 text-left transition ${
                            selected
                              ? "border-indigo-500/40 bg-indigo-500/[0.08]"
                              : "border-white/[0.07] bg-white/[0.025] hover:border-white/[0.14]"
                          }`}
                        >

                          {selected && (
                            <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white">

                              <Check
                                size={12}
                              />

                            </div>
                          )}

                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              selected
                                ? "bg-indigo-500 text-white"
                                : "bg-white/[0.05] text-zinc-500"
                            }`}
                          >
                            <Icon
                              size={18}
                            />
                          </div>

                          <p className="mt-3 text-sm font-medium text-white">
                            {
                              format.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            {
                              format.width
                            }{" "}
                            ×{" "}
                            {
                              format.height
                            }
                          </p>

                        </button>
                      );
                    }
                  )}

                </div>

                <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm font-medium text-zinc-300">
                        Campaign setup
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        {
                          selectedCampaignFormats.length
                        }{" "}
                        format
                        {selectedCampaignFormats.length ===
                        1
                          ? ""
                          : "s"}{" "}
                        selected
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={
                        handleGenerateCampaign
                      }
                      disabled={
                        isGeneratingCampaign ||
                        selectedCampaignFormats.length ===
                          0
                      }
                      className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
                    >

                      {isGeneratingCampaign ? (
                        <>
                          <RefreshCw
                            size={15}
                            className="animate-spin"
                          />

                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles
                            size={15}
                          />

                          Generate Campaign
                        </>
                      )}

                    </button>

                  </div>

                </div>

                {campaignMessage && (
                  <div className="mt-4 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.04] px-4 py-3">

                    <div className="flex items-center gap-2">

                      <CheckCircle2
                        size={16}
                        className="text-indigo-400"
                      />

                      <p className="text-xs text-indigo-300">
                        {
                          campaignMessage
                        }
                      </p>

                    </div>

                  </div>
                )}

                {campaignVariants.length >
                  0 && (
                  <div className="mt-6">

                    <div className="mb-3 flex items-center justify-between">

                      <div>

                        <p className="text-sm font-medium text-zinc-300">
                          Generated campaign
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                          Your original design remains unchanged.
                        </p>

                      </div>

                      <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-300">
                        {
                          campaignVariants.length
                        }{" "}
                        ready
                      </span>

                    </div>

                    <div className="grid grid-cols-2 gap-3">

                      {campaignVariants.map(
                        (variant) => {

                          const Icon =
                            getCampaignIcon(
                              variant.format
                            );

                          return (
                            <div
                              key={
                                variant.id
                              }
                              className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
                            >

                              <div className="flex items-start justify-between gap-3">

                                <div className="flex items-center gap-3">

                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">

                                    <Icon
                                      size={18}
                                    />

                                  </div>

                                  <div>

                                    <p className="text-sm font-medium text-white">
                                      {
                                        variant.name
                                      }
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-600">
                                      {
                                        variant.width
                                      }{" "}
                                      ×{" "}
                                      {
                                        variant.height
                                      }
                                    </p>

                                  </div>

                                </div>

                                <CheckCircle2
                                  size={17}
                                  className="text-emerald-400"
                                />

                              </div>

                              <p className="mt-3 text-xs leading-4 text-zinc-500">
                                {
                                  variant.description
                                }
                              </p>

                              <div className="mt-3 grid grid-cols-2 gap-2">

                                <MiniStat
                                  label="Elements"
                                  value={
                                    variant
                                      .page
                                      .elements
                                      .length
                                  }
                                />

                                <MiniStat
                                  label="Status"
                                  value="Ready"
                                />

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>
                )}

              </div>

              <div className="flex items-center justify-between border-t border-white/[0.07] px-6 py-4">

                <p className="text-xs text-zinc-600">
                  One source design • Multiple platform-ready designs
                </p>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={
                      handleCloseCampaign
                    }
                    disabled={
                      isGeneratingCampaign ||
                      isCreatingCampaignProjects
                    }
                    className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleCreateCampaignProjects
                    }
                    disabled={
                      campaignVariants.length ===
                        0 ||
                      isGeneratingCampaign ||
                      isCreatingCampaignProjects
                    }
                    className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-40"
                  >

                    {isCreatingCampaignProjects ? (
                      <>
                        <RefreshCw
                          size={15}
                          className="animate-spin"
                        />

                        Creating...
                      </>
                    ) : (
                      <>
                        <LayoutGrid
                          size={15}
                        />

                        Create Designs
                      </>
                    )}

                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            SMART REMIX MODAL
            ================================================= */}

        {remixOpen && (
          <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">

            <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/[0.09] bg-[#111114] shadow-2xl">

              <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Zap
                      size={20}
                    />
                  </div>

                  <div>

                    <p className="text-base font-semibold text-white">
                      Smart Remix
                    </p>

                    <p className="text-xs text-zinc-500">
                      Explore alternate versions of your design
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    handleCloseRemix
                  }
                  className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <X
                    size={18}
                  />
                </button>

              </div>

              <div className="p-6">

                {isGeneratingRemixes ? (
                  <div className="flex min-h-[280px] flex-col items-center justify-center">

                    <RefreshCw
                      size={26}
                      className="animate-spin text-indigo-400"
                    />

                    <p className="mt-5 text-base font-medium text-white">
                      Falcon is creating variations...
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Analyzing your current composition
                    </p>

                  </div>
                ) : (
                  <>
                    <div className="mb-5">

                      <p className="text-sm font-medium text-zinc-300">
                        Choose a direction
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Your original design will remain unchanged until you apply a remix.
                      </p>

                    </div>

                    <div className="grid grid-cols-4 gap-3">

                      {remixes.map(
                        (remix) => {

                          const active =
                            selectedRemix?.id ===
                            remix.id;

                          return (
                            <button
                              key={
                                remix.id
                              }
                              type="button"
                              onClick={() =>
                                setSelectedRemix(
                                  remix
                                )
                              }
                              className={`rounded-2xl border p-4 text-left transition ${
                                active
                                  ? "border-indigo-500/50 bg-indigo-500/[0.08]"
                                  : "border-white/[0.07] bg-white/[0.025] hover:border-white/[0.14]"
                              }`}
                            >

                              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">

                                {remix.style ===
                                "bold" ? (
                                  <Zap
                                    size={18}
                                  />
                                ) : remix.style ===
                                  "premium" ? (
                                  <Wand2
                                    size={18}
                                  />
                                ) : remix.style ===
                                  "social" ? (
                                  <Brain
                                    size={18}
                                  />
                                ) : (
                                  <Sparkles
                                    size={18}
                                  />
                                )}

                              </div>

                              <p className="text-sm font-medium text-white">
                                {
                                  remix.name
                                }
                              </p>

                              <p className="mt-1 text-xs leading-5 text-zinc-500">
                                {
                                  remix.description
                                }
                              </p>

                              {active && (
                                <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-300">

                                  <Check
                                    size={13}
                                  />

                                  Selected

                                </div>
                              )}

                            </button>
                          );
                        }
                      )}

                    </div>

                    {selectedRemix && (
                      <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">

                        <div className="flex items-center justify-between">

                          <div>

                            <p className="text-sm font-medium text-white">
                              {
                                selectedRemix.name
                              }{" "}
                              remix
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              {
                                selectedRemix.description
                              }
                            </p>

                          </div>

                          <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1.5 text-xs text-indigo-300">
                            Preview ready
                          </span>

                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">

                          <MiniStat
                            label="Elements"
                            value={
                              selectedRemix
                                .elements
                                .length
                            }
                          />

                          <MiniStat
                            label="Direction"
                            value={
                              selectedRemix.name
                            }
                          />

                          <MiniStat
                            label="Status"
                            value="Ready"
                          />

                        </div>

                      </div>
                    )}

                  </>
                )}

              </div>

              {!isGeneratingRemixes && (
                <div className="flex items-center justify-between border-t border-white/[0.07] px-6 py-4">

                  <p className="text-xs text-zinc-600">
                    Original design is protected until Apply.
                  </p>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={
                        handleCloseRemix
                      }
                      className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleApplyRemix
                      }
                      disabled={
                        !selectedRemix
                      }
                      className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-40"
                    >

                      <Check
                        size={15}
                      />

                      Apply Remix

                    </button>

                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* =================================================
          BACKGROUND REMOVER MODAL
          ================================================= */}
      <BackgroundRemoverModal
        isOpen={bgRemoverOpen}
        onClose={() => setBgRemoverOpen(false)}
        element={
          selectedElement && isImage(selectedElement)
            ? (selectedElement as ImageElement)
            : null
        }
        canvasImages={
          editor.page.elements.filter(isImage) as ImageElement[]
        }
        onSelectCanvasImage={(img) => {
          editor.selectElement(img.id);
        }}
        onApply={(newSrc, origSrc) => {
          if (selectedElement && isImage(selectedElement)) {
            editor.updateElement(selectedElement.id, {
              src: newSrc,
              originalSrc: origSrc,
            });
          }
        }}
        onAddAsNew={(src, origSrc, w, h) => {
          const maxDim = 450;
          let width = w || 400;
          let height = h || 400;
          if (width > maxDim || height > maxDim) {
            const scale = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const cx = Math.max(
            40,
            Math.round((editor.page.size.width - width) / 2)
          );
          const cy = Math.max(
            40,
            Math.round((editor.page.size.height - height) / 2)
          );
          editor.addElement({
            type: "image",
            x: cx,
            y: cy,
            width,
            height,
            src,
            originalSrc: origSrc,
            naturalWidth: w || width,
            naturalHeight: h || height,
            cropX: 0,
            cropY: 0,
            cropWidth: w || width,
            cropHeight: h || height,
            rotation: 0,
            opacity: 1,
            locked: false,
            hidden: false,
          } as CanvasElement);
        }}
      />

      {/* =================================================
          CHANGE LAYOUT MODAL
          ================================================= */}
      {layoutSelectorOpen && (
        <LayoutSelectorModal
          title="Change Canvas Layout"
          currentLayoutName={editor.page.size.name}
          onSelect={handleChangeLayout}
          onClose={() => setLayoutSelectorOpen(false)}
        />
      )}

      {/* =================================================
          ASSET GOVERNANCE & ADMIN MODAL
          ================================================= */}
      <AssetAdminModal
        isOpen={assetAdminOpen}
        onClose={() => setAssetAdminOpen(false)}
      />
    </div>
  );
}

/* =========================================================
   SCORE ROW
   ========================================================= */

function ScoreRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>

      <div className="mb-1.5 flex items-center justify-between">

        <span className="text-xs text-zinc-500">
          {label}
        </span>

        <span className="text-xs font-medium text-zinc-400">
          {value}
        </span>

      </div>

      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">

        <div
          className="h-full rounded-full bg-indigo-500/70 transition-all duration-500"
          style={{
            width: `${value}%`,
          }}
        />

      </div>

    </div>
  );
}

/* =========================================================
   MINI STAT
   ========================================================= */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2.5">

      <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-zinc-300">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   COLOR SWATCH
   ========================================================= */

function ColorSwatch({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">

      <div
        className="h-8 w-full rounded-lg border border-white/[0.08]"
        style={{
          backgroundColor: value,
        }}
      />

      <p className="mt-1 text-[10px] text-zinc-700">
        {label}
      </p>

      <p className="truncate text-[10px] font-mono text-zinc-500">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   FIND ELEMENT
   ========================================================= */

function find(
  editor: ReturnType<
    typeof useCanvasEditor
  >,
  id: string
) {
  return editor.page.elements.find(
    (el) =>
      el.id === id
  );
}

/* =========================================================
   COLOR LUMINANCE
   ========================================================= */

function getLuminance(
  color: string
): number {
  let value =
    color
      .replace("#", "")
      .trim();

  if (
    value.length === 3
  ) {
    value = value
      .split("")
      .map(
        (char) =>
          char + char
      )
      .join("");
  }

  if (
    value.length !== 6
  ) {
    return 0.5;
  }

  const r =
    parseInt(
      value.slice(0, 2),
      16
    ) / 255;

  const g =
    parseInt(
      value.slice(2, 4),
      16
    ) / 255;

  const b =
    parseInt(
      value.slice(4, 6),
      16
    ) / 255;

  if (
    Number.isNaN(r) ||
    Number.isNaN(g) ||
    Number.isNaN(b)
  ) {
    return 0.5;
  }

  const convert =
    (channel: number) =>
      channel <= 0.03928
        ? channel / 12.92
        : Math.pow(
            (channel + 0.055) /
              1.055,
            2.4
          );

  const rr =
    convert(r);

  const gg =
    convert(g);

  const bb =
    convert(b);

  return (
    0.2126 * rr +
    0.7152 * gg +
    0.0722 * bb
  );
}