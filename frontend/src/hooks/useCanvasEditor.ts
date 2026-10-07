import { useCallback, useMemo, useState } from "react";

import {
  CanvasElement,
  DesignPage,
  ToolId,
  ShapeElement,
  TextElement,
  ImageElement,
  GroupElement,
  FrameElement,
} from "@/types";

import { generateId } from "@/utils/id";

import {
  DEFAULT_FONT_FAMILY,
  DEFAULT_SHAPE_FILL,
  DEFAULT_SHAPE_STROKE,
  DEFAULT_TEXT_COLOR,
} from "@/utils/constants";

import { useHistory } from "./useHistory";

interface UseCanvasEditorArgs {
  initialPage: DesignPage;
}

export function useCanvasEditor({
  initialPage,
}: UseCanvasEditorArgs) {
  const {
    state: page,
    set: setPage,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<DesignPage>(initialPage);

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [activeTool, setActiveTool] =
    useState<ToolId>("select");

  /*
   * =======================================================
   * SELECTED ELEMENTS
   * =======================================================
   */

  const selectedElements = useMemo(
    () =>
      page.elements.filter((el) =>
        selectedIds.includes(el.id)
      ),
    [page.elements, selectedIds]
  );

  /*
   * =======================================================
   * ADD ELEMENT
   * =======================================================
   */

  const addElement = useCallback(
    (
      partial: Partial<CanvasElement> &
        Pick<
          CanvasElement,
          "type" | "x" | "y"
        >
    ) => {
      const zIndex =
        page.elements.length;

      // Things added one after another land on the same default spot; step each
      // new one down and right so none is hidden exactly behind the last
      let x = partial.x;
      let y = partial.y;
      for (let i = 0; i < 12 && page.elements.some((el) => Math.abs(el.x - x) < 2 && Math.abs(el.y - y) < 2); i++) {
        x += 24;
        y += 24;
      }

      const base = {
        id: generateId(),
        width: 200,
        height: 120,
        rotation: 0,
        opacity: 1,
        locked: false,
        hidden: false,
        zIndex,
        x,
        y,
      };

      let element: CanvasElement;

      /*
       * =====================================================
       * TEXT
       * =====================================================
       */

      if (partial.type === "text") {
        const text =
          partial as Partial<TextElement>;

        element = {
          ...base,
          ...partial,

          type: "text",

          text:
            text.text ||
            "Double-click to edit",

          fontFamily:
            text.fontFamily ||
            DEFAULT_FONT_FAMILY,

          fontSize:
            text.fontSize || 32,

          fontWeight:
            text.fontWeight || 600,

          color:
            text.color ||
            DEFAULT_TEXT_COLOR,

          align:
            text.align || "left",

          lineHeight:
            text.lineHeight || 1.2,

          width:
            text.width || 240,

          height:
            text.height || 40,
        } as TextElement;
      }

      /*
       * =====================================================
       * IMAGE
       * =====================================================
       */

      else if (
        partial.type === "image"
      ) {
        const image =
          partial as Partial<ImageElement>;

        element = {
          ...base,
          ...partial,

          type: "image",

          src:
            image.src || "",

          naturalWidth:
            image.naturalWidth || 200,

          naturalHeight:
            image.naturalHeight || 120,
        } as ImageElement;
      }

      /*
       * =====================================================
       * FRAME
       * =====================================================
       */

      else if (partial.type === "frame") {
        const frame = partial as Partial<FrameElement>;

        element = {
          ...base,
          ...partial,
          type: "frame",
          frameShape: frame.frameShape || "circle",
          width: frame.width || 220,
          height: frame.height || 220,
          imageSrc: frame.imageSrc || "",
          imageNaturalWidth: frame.imageNaturalWidth || 0,
          imageNaturalHeight: frame.imageNaturalHeight || 0,
          imageOffsetX: frame.imageOffsetX ?? 0,
          imageOffsetY: frame.imageOffsetY ?? 0,
          imageZoom: frame.imageZoom ?? 1,
          stroke: frame.stroke || "transparent",
          strokeWidth: frame.strokeWidth ?? 0,
        } as FrameElement;
      }

      /*
       * =====================================================
       * SHAPES
       * =====================================================
       */

      else {
        const shape =
          partial as Partial<ShapeElement>;

        element = {
          ...base,
          ...partial,

          fill:
            shape.fill ||
            DEFAULT_SHAPE_FILL,

          stroke:
            shape.stroke ||
            DEFAULT_SHAPE_STROKE,

          strokeWidth:
            shape.strokeWidth !==
            undefined
              ? shape.strokeWidth
              : 0,

          cornerRadius:
            shape.cornerRadius !==
            undefined
              ? shape.cornerRadius
              : partial.type ===
                "rectangle"
              ? 8
              : undefined,
        } as ShapeElement;
      }

      /*
       * =====================================================
       * ADD TO PAGE
       * =====================================================
       */

      // The stepped-aside position, which the spread of the caller's values above would otherwise undo
      element = { ...element, x, y } as CanvasElement;

      setPage({
        ...page,

        elements: [
          ...page.elements,
          element,
        ],
      });

      /*
       * =====================================================
       * SELECT NEW ELEMENT
       * =====================================================
       */

      setSelectedIds([
        element.id,
      ]);

      return element;
    },
    [page, setPage]
  );

  /*
   * =======================================================
   * UPDATE ELEMENT
   * =======================================================
   */

  const updateElement = useCallback(
    (
      id: string,
      patch: Partial<CanvasElement>,
      opts?: {
        commit?: boolean;
      }
    ) => {
      // Moving one member of a group moves the whole group. A resize also changes
      // position, but comes with a new width or height, so it is left alone.
      const target = page.elements.find((el) => el.id === id);
      const isMove = ("x" in patch || "y" in patch) && !("width" in patch) && !("height" in patch);
      const groupId = target?.groupId;
      const dx = isMove && target && groupId && typeof patch.x === "number" ? patch.x - target.x : 0;
      const dy = isMove && target && groupId && typeof patch.y === "number" ? patch.y - target.y : 0;

      const next: DesignPage = {
        ...page,

        elements:
          page.elements.map(
            (el) =>
              el.id === id
                ? ({
                    ...el,
                    ...patch,
                  } as CanvasElement)
                : groupId && (dx || dy) && (el.groupId === groupId || el.id === groupId) && !el.locked
                ? ({ ...el, x: el.x + dx, y: el.y + dy } as CanvasElement)
                : el
          ),
      };

      setPage(
        next,
        opts
      );
    },
    [page, setPage]
  );

  /*
   * =======================================================
   * DELETE SELECTED
   * =======================================================
   */

  const deleteSelected =
    useCallback(() => {
      if (
        selectedIds.length === 0
      ) {
        return;
      }

      /*
       * If a group is selected,
       * delete the group and its
       * children.
       */

      const idsToDelete =
        new Set<string>(
          selectedIds
        );

      page.elements.forEach(
        (element) => {
          if (
            element.type ===
              "group" &&
            selectedIds.includes(
              element.id
            )
          ) {
            element.childIds.forEach(
              (childId) =>
                idsToDelete.add(
                  childId
                )
            );
          }
        }
      );

      setPage({
        ...page,

        elements:
          page.elements.filter(
            (el) =>
              !idsToDelete.has(
                el.id
              )
          ),
      });

      setSelectedIds([]);
    }, [
      page,
      selectedIds,
      setPage,
    ]);

  /*
   * =======================================================
   * BRING FORWARD
   * =======================================================
   */

  const bringForward =
    useCallback(
      (id: string) => {
        const elements = [
          ...page.elements,
        ].sort(
          (a, b) =>
            a.zIndex -
            b.zIndex
        );

        const index =
          elements.findIndex(
            (el) =>
              el.id === id
          );

        if (
          index < 0 ||
          index ===
            elements.length - 1
        ) {
          return;
        }

        [
          elements[index]
            .zIndex,
          elements[index + 1]
            .zIndex,
        ] = [
          elements[index + 1]
            .zIndex,
          elements[index]
            .zIndex,
        ];

        setPage({
          ...page,
          elements,
        });
      },
      [page, setPage]
    );

  /*
   * =======================================================
   * SEND BACKWARD
   * =======================================================
   */

  const sendBackward =
    useCallback(
      (id: string) => {
        const elements = [
          ...page.elements,
        ].sort(
          (a, b) =>
            a.zIndex -
            b.zIndex
        );

        const index =
          elements.findIndex(
            (el) =>
              el.id === id
          );

        if (index <= 0) {
          return;
        }

        [
          elements[index]
            .zIndex,
          elements[index - 1]
            .zIndex,
        ] = [
          elements[index - 1]
            .zIndex,
          elements[index]
            .zIndex,
        ];

        setPage({
          ...page,
          elements,
        });
      },
      [page, setPage]
    );

  /*
   * =======================================================
   * DUPLICATE SELECTED
   * =======================================================
   */

  const duplicateSelected =
    useCallback(() => {
      if (
        selectedElements.length ===
        0
      ) {
        return;
      }

      const copies =
        selectedElements.map(
          (el) => ({
            ...el,

            id: generateId(),

            x: el.x + 16,

            y: el.y + 16,

            zIndex:
              page.elements.length,
          })
        );

      setPage({
        ...page,

        elements: [
          ...page.elements,
          ...copies,
        ],
      });

      setSelectedIds(
        copies.map(
          (copy) =>
            copy.id
        )
      );
    }, [
      page,
      selectedElements,
      setPage,
    ]);

  /*
   * =======================================================
   * GROUP SELECTED
   * =======================================================
   */

  const groupSelected =
    useCallback(() => {
      /*
       * Need at least two elements.
       */

      if (
        selectedElements.length <
        2
      ) {
        return;
      }

      /*
       * Don't group locked
       * elements.
       */

      const groupable =
        selectedElements.filter(
          (element) =>
            !element.locked &&
            !element.hidden
        );

      if (
        groupable.length < 2
      ) {
        return;
      }

      /*
       * If selected elements
       * already include a group,
       * avoid nesting groups for
       * now.
       */

      if (
        groupable.some(
          (element) =>
            element.type ===
            "group"
        )
      ) {
        return;
      }

      /*
       * Calculate bounding box.
       */

      const minX =
        Math.min(
          ...groupable.map(
            (element) =>
              element.x
          )
        );

      const minY =
        Math.min(
          ...groupable.map(
            (element) =>
              element.y
          )
        );

      const maxX =
        Math.max(
          ...groupable.map(
            (element) =>
              element.x +
              element.width
          )
        );

      const maxY =
        Math.max(
          ...groupable.map(
            (element) =>
              element.y +
              element.height
          )
        );

      const groupWidth =
        Math.max(
          1,
          maxX - minX
        );

      const groupHeight =
        Math.max(
          1,
          maxY - minY
        );

      /*
       * Group gets the highest
       * z-index of selected items.
       */

      const groupZIndex =
        Math.max(
          ...groupable.map(
            (element) =>
              element.zIndex
          )
        );

      const groupId =
        generateId("group");

      const group: GroupElement =
        {
          id: groupId,

          type: "group",

          zIndex:
            groupZIndex,

          x: minX,

          y: minY,

          width:
            groupWidth,

          height:
            groupHeight,

          rotation: 0,

          opacity: 1,

          locked: false,

          hidden: false,

          childIds:
            groupable.map(
              (element) =>
                element.id
            ),
        };

      /*
       * Keep children on the page.
       *
       * The group is a logical
       * container around them.
       */

      const nextElements =
        page.elements.map(
          (element) => {
            if (
              groupable.some(
                (item) =>
                  item.id ===
                  element.id
              )
            ) {
              return {
                ...element,

                groupId,
              };
            }

            return element;
          }
        );

      /*
       * Add group as a new layer.
       */

      nextElements.push(
        group
      );

      /*
       * Normalize z-index values.
       */

      const normalized =
        nextElements
          .sort(
            (a, b) =>
              a.zIndex -
              b.zIndex
          )
          .map(
            (
              element,
              index
            ) => ({
              ...element,
              zIndex:
                index,
            })
          );

      setPage({
        ...page,
        elements:
          normalized,
      });

      /*
       * Select the group.
       */

      setSelectedIds([
        groupId,
      ]);
    }, [
      page,
      selectedElements,
      setPage,
    ]);

  /*
   * =======================================================
   * UNGROUP SELECTED
   * =======================================================
   */

  const ungroupSelected =
    useCallback(() => {
      const memberGroupIds = new Set(selectedElements.map((element) => element.groupId).filter(Boolean));
      const groups =
        page.elements.filter(
          (
            element
          ): element is GroupElement =>
            element.type ===
            "group" && (selectedIds.includes(element.id) || memberGroupIds.has(element.id))
        );

      if (
        groups.length === 0
      ) {
        return;
      }

      const groupIds =
        new Set(
          groups.map(
            (group) =>
              group.id
          )
        );

      /*
       * Remove groupId from
       * children and remove the
       * group element itself.
       */

      const nextElements =
        page.elements
          .filter(
            (element) =>
              !groupIds.has(
                element.id
              )
          )
          .map(
            (element) => {
              const belongsToGroup =
                groups.some(
                  (group) =>
                    group.childIds.includes(
                      element.id
                    )
                );

              if (
                belongsToGroup
              ) {
                const {
                  groupId:
                    _groupId,
                  ...rest
                } = element;

                return rest as CanvasElement;
              }

              return element;
            }
          );

      /*
       * Preserve existing
       * z-index order.
       */

      const normalized =
        nextElements
          .sort(
            (a, b) =>
              a.zIndex -
              b.zIndex
          )
          .map(
            (
              element,
              index
            ) => ({
              ...element,
              zIndex:
                index,
            })
          );

      setPage({
        ...page,
        elements:
          normalized,
      });

      /*
       * Select children after
       * ungrouping.
       */

      const childIds =
        groups.flatMap(
          (group) =>
            group.childIds
        );

      setSelectedIds(
        childIds.filter(
          (id) =>
            normalized.some(
              (element) =>
                element.id ===
                id
            )
        )
      );
    }, [
      page,
      selectedElements,
      setPage,
    ]);

  /*
   * =======================================================
   * SELECT ELEMENT
   * =======================================================
   */

  const selectElement =
    useCallback(
      (
        id: string | null,
        additive = false
      ) => {
        if (id === null) {
          setSelectedIds([]);
          return;
        }

        /*
         * Selecting a group selects
         * the group itself.
         *
         * Children remain internally
         * connected through childIds.
         */

        setSelectedIds(
          (prev) =>
            additive
              ? Array.from(
                  new Set([
                    ...prev,
                    id,
                  ])
                )
              : [id]
        );
      },
      []
    );

  /*
   * =======================================================
   * MOVE, SELECT ALL, PASTE
   * =======================================================
   */

  /** Moves the selection by a number of design pixels; locked elements stay put */
  const moveSelected = useCallback(
    (dx: number, dy: number) => {
      if (!selectedIds.length) return;
      setPage({
        ...page,
        elements: page.elements.map((el) =>
          selectedIds.includes(el.id) && !el.locked ? ({ ...el, x: el.x + dx, y: el.y + dy } as CanvasElement) : el
        ),
      });
    },
    [page, selectedIds, setPage]
  );

  const selectAll = useCallback(() => {
    setSelectedIds(page.elements.filter((el) => !el.hidden && !el.locked).map((el) => el.id));
  }, [page.elements]);

  /**
   * Adds several ready-made elements as one group, so a chart or a table
   * moves as a whole while each bar, label and cell stays editable.
   */
  const insertElements = useCallback(
    (source: CanvasElement[]) => {
      if (!source.length) return;
      const groupId = generateId("group");
      const start = page.elements.length;
      const members = source.map((el, index) => ({ ...el, id: generateId(), groupId, zIndex: start + index, locked: false, hidden: false }) as CanvasElement);
      const minX = Math.min(...members.map((m) => m.x));
      const minY = Math.min(...members.map((m) => m.y));
      const maxX = Math.max(...members.map((m) => m.x + m.width));
      const maxY = Math.max(...members.map((m) => m.y + m.height));
      const group = {
        id: groupId, type: "group", zIndex: start + members.length, x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY),
        rotation: 0, opacity: 1, locked: false, hidden: false, childIds: members.map((m) => m.id),
      } as GroupElement;
      setPage({ ...page, elements: [...page.elements, ...members, group] });
      setSelectedIds([members[0].id]);
    },
    [page, setPage]
  );

  /** Adds copies of the given elements, a little offset from the originals, and selects them */
  const pasteElements = useCallback(
    (source: CanvasElement[]) => {
      if (!source.length) return;
      const groupIds = new Map<string, string>();
      const copies = source.map((el, index) => {
        let groupId = el.groupId;
        if (groupId) {
          if (!groupIds.has(groupId)) groupIds.set(groupId, generateId());
          groupId = groupIds.get(groupId);
        }
        return { ...el, id: generateId(), groupId, x: el.x + 24, y: el.y + 24, zIndex: page.elements.length + index, locked: false } as CanvasElement;
      });
      setPage({ ...page, elements: [...page.elements, ...copies] });
      setSelectedIds(copies.map((copy) => copy.id));
    },
    [page, setPage]
  );

  /*
   * =======================================================
   * RETURN EDITOR API
   * =======================================================
   */

  return {
    page,
    setPage,

    selectedIds,
    selectedElements,

    selectElement,

    activeTool,
    setActiveTool,

    addElement,
    updateElement,

    deleteSelected,
    duplicateSelected,

    moveSelected,
    selectAll,
    pasteElements,
    insertElements,

    /*
     * Layer controls
     */
    bringForward,
    sendBackward,

    /*
     * Group controls
     */
    groupSelected,
    ungroupSelected,

    /*
     * History
     */
    undo,
    redo,

    canUndo,
    canRedo,
  };
}