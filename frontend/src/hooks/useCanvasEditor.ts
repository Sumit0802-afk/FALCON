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

      const base = {
        id: generateId(),
        width: 200,
        height: 120,
        rotation: 0,
        opacity: 1,
        locked: false,
        hidden: false,
        zIndex,
        x: partial.x,
        y: partial.y,
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
      const groups =
        selectedElements.filter(
          (
            element
          ): element is GroupElement =>
            element.type ===
            "group"
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