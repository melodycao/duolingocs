import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  PanResponder,
} from "react-native";
import { getLessonDefinition } from "../../src/lessons";
import type { ComparisonOp, CounterQuestion, LessonQuestion } from "../../src/lessons/types";

function evaluateComparison(op: ComparisonOp, left: number, right: number) {
  switch (op) {
    case ">":
      return left > right;
    case ">=":
      return left >= right;
    case "<":
      return left < right;
    case "<=":
      return left <= right;
    case "==":
      return left === right;
    case "!=":
      return left !== right;
    default: {
      const _exhaustive: never = op;
      return _exhaustive;
    }
  }
}

function formatStatement(statement: CounterQuestion["statement"]) {
  return `${statement.variable} ${statement.op} ${statement.value}`;
}

type DragOrderBoardProps = {
  options: string[];
  disabled: boolean;
  resetKey: number;
  onOrderChange: (order: string[]) => void;
  onDragStateChange: (isDragging: boolean) => void;
};

type DragMatchBoardProps = {
  leftItems: string[];
  values: string[];
  appendEqualsToLeftItems?: boolean;
  disabled: boolean;
  resetKey: number;
  onMatchChange: (valuesBySlot: string[]) => void;
  onDragStateChange: (isDragging: boolean) => void;
};

type TokenAssembleRowProps = {
  slotCount: number;
  slotRows?: number;
  tokens: string[];
  values: string[];
  disabled: boolean;
  onValuesChange: (next: string[]) => void;
  onDragStateChange: (isDragging: boolean) => void;
};

const TOKEN_ID_SEPARATOR = "__TOKEN__";
const encodeTokenValue = (token: string, index: number) => `${index}${TOKEN_ID_SEPARATOR}${token}`;
const decodeTokenLabel = (value: string) => {
  const sepIndex = value.indexOf(TOKEN_ID_SEPARATOR);
  if (sepIndex === -1) return value;
  return value.slice(sepIndex + TOKEN_ID_SEPARATOR.length);
};

function TokenAssembleRow({
  slotCount,
  slotRows = 1,
  tokens,
  values,
  disabled,
  onValuesChange,
  onDragStateChange,
}: TokenAssembleRowProps) {
  const slotLayoutsRef = React.useRef<Record<number, { x: number; y: number; width: number; height: number }>>({});
  const panBySlotRef = React.useRef<Record<number, Animated.ValueXY>>({});
  const draggingSlotRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const next: Record<number, Animated.ValueXY> = {};
    for (let i = 0; i < slotCount; i += 1) {
      next[i] = panBySlotRef.current[i] ?? new Animated.ValueXY({ x: 0, y: 0 });
      next[i].setValue({ x: 0, y: 0 });
    }
    panBySlotRef.current = next;
  }, [slotCount, values]);

  const placeToken = (token: string, tokenIdx: number) => {
    if (disabled) return;
    const firstEmpty = values.findIndex((v) => !v);
    if (firstEmpty === -1) return;
    const next = [...values];
    next[firstEmpty] = encodeTokenValue(token, tokenIdx);
    onValuesChange(next);
  };

  const slotColumns = Math.max(1, Math.ceil(slotCount / slotRows));
  const slotWidth = `${Math.floor(100 / slotColumns)}%` as `${number}%`;

  const removeTokenAt = (slotIdx: number) => {
    if (disabled || draggingSlotRef.current !== null) return;
    const next = [...values];
    next[slotIdx] = "";
    onValuesChange(next);
  };

  const getResponder = (slotIdx: number) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_evt, gesture) => Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2,
      onPanResponderGrant: () => {
        draggingSlotRef.current = slotIdx;
        onDragStateChange(true);
      },
      onPanResponderMove: (_evt, gesture) => {
        const pan = panBySlotRef.current[slotIdx];
        pan?.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_evt, gesture) => {
        const pan = panBySlotRef.current[slotIdx];
        pan?.setValue({ x: 0, y: 0 });
        const sourceLayout = slotLayoutsRef.current[slotIdx];
        if (!sourceLayout) {
          draggingSlotRef.current = null;
          onDragStateChange(false);
          return;
        }
        const sourceCenterX = sourceLayout.x + sourceLayout.width / 2 + gesture.dx;
        const sourceCenterY = sourceLayout.y + sourceLayout.height / 2 + gesture.dy;
        const nearestSlot = Object.entries(slotLayoutsRef.current)
          .map(([idx, rect]) => ({
            idx: Number(idx),
            dist: Math.hypot(sourceCenterX - (rect.x + rect.width / 2), sourceCenterY - (rect.y + rect.height / 2)),
          }))
          .sort((a, b) => a.dist - b.dist)[0];

        if (nearestSlot && nearestSlot.idx !== slotIdx) {
          const next = [...values];
          const temp = next[slotIdx];
          next[slotIdx] = next[nearestSlot.idx];
          next[nearestSlot.idx] = temp;
          onValuesChange(next);
        }
        draggingSlotRef.current = null;
        onDragStateChange(false);
      },
      onPanResponderTerminate: () => {
        const pan = panBySlotRef.current[slotIdx];
        pan?.setValue({ x: 0, y: 0 });
        draggingSlotRef.current = null;
        onDragStateChange(false);
      },
    });

  return (
    <View style={styles.tokenAssembleContainer}>
      <View style={styles.tokenSlotsRow}>
        {Array.from({ length: slotCount }).map((_, idx) => {
          const tokenValue = values[idx];
          const token = tokenValue ? decodeTokenLabel(tokenValue) : "";
          const pan = panBySlotRef.current[idx] ?? new Animated.ValueXY({ x: 0, y: 0 });
          return (
            <View
              key={`slot-${idx}`}
              style={[styles.tokenSlotBox, { width: slotWidth }]}
              onLayout={(e) => {
                const { x, y, width, height } = e.nativeEvent.layout;
                slotLayoutsRef.current[idx] = { x, y, width, height };
              }}
            >
              {token ? (
                <Animated.View style={[styles.tokenPlacedPill, { transform: pan.getTranslateTransform() }]} {...getResponder(idx).panHandlers}>
                  <Pressable onPress={() => removeTokenAt(idx)} disabled={disabled} style={styles.tokenPlacedPressable}>
                    <Text style={styles.tokenPlacedText}>{token}</Text>
                  </Pressable>
                </Animated.View>
              ) : null}
            </View>
          );
        })}
      </View>
      <View style={styles.tokenBankRow}>
        {tokens.map((token, tokenIdx) => {
          const encodedToken = encodeTokenValue(token, tokenIdx);
          const isUsed = values.includes(encodedToken);
          return (
          <TouchableOpacity
            key={`bank-${token}-${tokenIdx}`}
            onPress={() => placeToken(token, tokenIdx)}
            disabled={disabled || isUsed}
            style={[styles.tokenBankPill, isUsed && styles.tokenBankPillUsed]}
            activeOpacity={0.85}
          >
            <Text style={styles.tokenBankText}>{token}</Text>
          </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function DragMatchBoard({
  leftItems,
  values,
  appendEqualsToLeftItems = true,
  disabled,
  resetKey,
  onMatchChange,
  onDragStateChange,
}: DragMatchBoardProps) {
  const SLOT_HEIGHT = 52;
  const GAP = 10;
  const CARD_HEIGHT = 44;
  const [boardWidth, setBoardWidth] = useState(0);
  const [slots, setSlots] = useState<(string | null)[]>([]);
  const [itemLayoutReady, setItemLayoutReady] = useState(false);

  const ids = useMemo(() => values.map((label, idx) => `${idx}__${label}`), [values]);
  const valueById = useMemo(() => {
    const map: Record<string, string> = {};
    ids.forEach((id, idx) => {
      map[id] = values[idx];
    });
    return map;
  }, [ids, values]);

  const slotLayoutsRef = React.useRef<Record<number, { x: number; y: number; width: number; height: number }>>({});
  const rowLayoutsRef = React.useRef<Record<number, { y: number; x: number }>>({});
  const slotLocalLayoutsRef = React.useRef<Record<number, { x: number; y: number; width: number; height: number }>>({});
  const homeRef = React.useRef<Record<string, { x: number; y: number }>>({});
  const inSlotRef = React.useRef<Record<string, number | null>>({});
  const panRef = React.useRef<Record<string, Animated.ValueXY>>({});
  const dragStartRef = React.useRef<Record<string, { x: number; y: number }>>({});
  const originSlotRef = React.useRef<Record<string, number | null>>({});
  const responderRef = React.useRef<Record<string, ReturnType<typeof PanResponder.create>>>({});
  const disabledRef = React.useRef(disabled);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  React.useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    setSlots(Array(leftItems.length).fill(null));
    setItemLayoutReady(false);
    onMatchChange([]);
    slotLayoutsRef.current = {};
    rowLayoutsRef.current = {};
    slotLocalLayoutsRef.current = {};
    homeRef.current = {};
    inSlotRef.current = {};
    panRef.current = {};
    dragStartRef.current = {};
    originSlotRef.current = {};
    responderRef.current = {};
    setActiveDragId(null);
  }, [leftItems.length, values, resetKey, onMatchChange]);

  useEffect(() => {
    onMatchChange(slots.map((id) => (id ? valueById[id] : "")));
  }, [slots, valueById, onMatchChange]);

  const leftWidth = boardWidth > 0 ? Math.floor(boardWidth * 0.52) : 170;
  const rightWidth = boardWidth > 0 ? boardWidth - leftWidth - 10 : 130;
  const bankTop = leftItems.length * (SLOT_HEIGHT + GAP) + 16;
  const rows = Math.ceil(values.length / 2);
  const cardWidth = boardWidth > 0 ? (boardWidth - GAP) / 2 : 150;
  const boardHeight = bankTop + rows * (CARD_HEIGHT + GAP) + 8;

  useEffect(() => {
    if (boardWidth <= 0 || itemLayoutReady) return;
    ids.forEach((id, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const homeX = col * (cardWidth + GAP);
      const homeY = bankTop + row * (CARD_HEIGHT + GAP);
      homeRef.current[id] = { x: homeX, y: homeY };
      dragStartRef.current[id] = { x: homeX, y: homeY };
      inSlotRef.current[id] = null;
      originSlotRef.current[id] = null;
      panRef.current[id] = new Animated.ValueXY({ x: homeX, y: homeY });
    });
    setItemLayoutReady(true);
  }, [boardWidth, itemLayoutReady, ids, cardWidth, bankTop]);

  const snapTo = (id: string, x: number, y: number) => {
    const pan = panRef.current[id];
    if (!pan) return;
    Animated.spring(pan, { toValue: { x, y }, useNativeDriver: false, bounciness: 5 }).start();
  };

  const getPanResponder = (id: string) => {
    const existingResponder = responderRef.current[id];
    if (existingResponder) return existingResponder;
    const responder = PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current,
      onStartShouldSetPanResponderCapture: () => !disabledRef.current,
      onMoveShouldSetPanResponderCapture: () => !disabledRef.current,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        onDragStateChange(true);
        setActiveDragId(id);
        const pan = panRef.current[id];
        if (!pan) return;
        originSlotRef.current[id] = inSlotRef.current[id] ?? null;
        pan.stopAnimation((value) => {
          dragStartRef.current[id] = value;
        });
      },
      onPanResponderMove: (_evt, gestureState) => {
        const pan = panRef.current[id];
        if (!pan) return;
        const start = dragStartRef.current[id] ?? { x: 0, y: 0 };
        pan.setValue({ x: start.x + gestureState.dx, y: start.y + gestureState.dy });
      },
      onPanResponderRelease: () => {
        onDragStateChange(false);
        setActiveDragId(null);
        const pan = panRef.current[id];
        if (!pan) return;
        pan.stopAnimation((value) => {
          const pos = value as { x: number; y: number };
          const overlappingSlots = Object.entries(slotLayoutsRef.current)
            .map(([slot, rect]) => ({ slotIndex: Number(slot), rect }))
            .filter(({ rect }) => {
              const cardLeft = pos.x;
              const cardRight = pos.x + cardWidth;
              const cardTop = pos.y;
              const cardBottom = pos.y + CARD_HEIGHT;
              return (
                cardRight >= rect.x - 12 &&
                cardLeft <= rect.x + rect.width + 12 &&
                cardBottom >= rect.y - 12 &&
                cardTop <= rect.y + rect.height + 12
              );
            });
          const cardCenterX = pos.x + cardWidth / 2;
          const cardCenterY = pos.y + CARD_HEIGHT / 2;
          const candidate =
            overlappingSlots.length === 0
              ? null
              : overlappingSlots.reduce((best, current) => {
                  const currentCenterX = current.rect.x + current.rect.width / 2;
                  const currentCenterY = current.rect.y + current.rect.height / 2;
                  const currentDist = Math.hypot(cardCenterX - currentCenterX, cardCenterY - currentCenterY);
                  if (!best) return { ...current, dist: currentDist };
                  return currentDist < best.dist ? { ...current, dist: currentDist } : best;
                }, null as ({ slotIndex: number; rect: { x: number; y: number; width: number; height: number }; dist: number } | null));
          const originSlot = originSlotRef.current[id] ?? null;
          const droppedInBank = pos.y + CARD_HEIGHT / 2 >= bankTop - 8;

          if (originSlot !== null && droppedInBank) {
            setSlots((prev) => {
              const next = [...prev];
              if (next[originSlot] === id) next[originSlot] = null;
              return next;
            });
            const home = homeRef.current[id];
            if (home) {
              inSlotRef.current[id] = null;
              dragStartRef.current[id] = home;
              snapTo(id, home.x, home.y);
            }
            return;
          }

          if (candidate) {
            const targetSlot = candidate.slotIndex;
            const targetRect = candidate.rect;
            const targetPos = { x: targetRect.x, y: targetRect.y + (SLOT_HEIGHT - CARD_HEIGHT) / 2 };
            const occupyingId = slots[targetSlot];
            setSlots((prev) => {
              const next = [...prev];
              if (originSlot !== null && next[originSlot] === id) next[originSlot] = null;
              next[targetSlot] = id;
              if (occupyingId && occupyingId !== id && originSlot !== null) next[originSlot] = occupyingId;
              return next;
            });
            inSlotRef.current[id] = targetSlot;
            dragStartRef.current[id] = targetPos;
            snapTo(id, targetPos.x, targetPos.y);
            if (occupyingId && occupyingId !== id) {
              if (originSlot !== null) {
                const originRect = slotLayoutsRef.current[originSlot];
                if (originRect) {
                  const occupyingPos = { x: originRect.x, y: originRect.y + (SLOT_HEIGHT - CARD_HEIGHT) / 2 };
                  inSlotRef.current[occupyingId] = originSlot;
                  dragStartRef.current[occupyingId] = occupyingPos;
                  snapTo(occupyingId, occupyingPos.x, occupyingPos.y);
                }
              } else {
                const home = homeRef.current[occupyingId];
                if (home) {
                  inSlotRef.current[occupyingId] = null;
                  dragStartRef.current[occupyingId] = home;
                  snapTo(occupyingId, home.x, home.y);
                }
              }
            }
            return;
          }
          if (originSlot !== null) {
            const originRect = slotLayoutsRef.current[originSlot];
            if (originRect) {
              const originPos = { x: originRect.x, y: originRect.y + (SLOT_HEIGHT - CARD_HEIGHT) / 2 };
              inSlotRef.current[id] = originSlot;
              dragStartRef.current[id] = originPos;
              snapTo(id, originPos.x, originPos.y);
              return;
            }
          }
          const home = homeRef.current[id];
          if (home) {
            inSlotRef.current[id] = null;
            dragStartRef.current[id] = home;
            snapTo(id, home.x, home.y);
          }
        });
      },
      onPanResponderTerminate: () => {
        onDragStateChange(false);
        setActiveDragId(null);
      },
    });
    responderRef.current[id] = responder;
    return responder;
  };

  return (
    <View style={[styles.dragBoard, { height: boardHeight }]} onLayout={(e) => setBoardWidth(e.nativeEvent.layout.width)}>
      {leftItems.map((left, idx) => (
        <View
          key={`match-${idx}`}
          style={styles.matchRow}
          onLayout={(e) => {
            const { y, x } = e.nativeEvent.layout;
            rowLayoutsRef.current[idx] = { y, x };
            const local = slotLocalLayoutsRef.current[idx];
            if (!local) return;
            slotLayoutsRef.current[idx] = {
              x: x + local.x,
              y: y + local.y,
              width: local.width,
              height: local.height,
            };
          }}
        >
          <View style={[styles.matchLeftCell, { width: leftWidth }]}>
            <Text style={styles.matchLeftText}>
              {appendEqualsToLeftItems ? `${left} =` : left}
            </Text>
          </View>
          <View
            onLayout={(e) => {
              const { x, y, width, height } = e.nativeEvent.layout;
              slotLocalLayoutsRef.current[idx] = { x, y, width, height };
              const rowLayout = rowLayoutsRef.current[idx] ?? { x: 0, y: 0 };
              slotLayoutsRef.current[idx] = {
                x: rowLayout.x + x,
                y: rowLayout.y + y,
                width,
                height,
              };
            }}
            style={[styles.matchDropSlot, { width: rightWidth }]}
          >
            <Text style={styles.dropSlotText}>{slots[idx] ? valueById[slots[idx] as string] : "Drop value"}</Text>
          </View>
        </View>
      ))}
      {itemLayoutReady &&
        ids.map((id) => {
          const pan = panRef.current[id];
          if (!pan) return null;
          const responder = getPanResponder(id);
          return (
            <Animated.View
              key={id}
              {...responder.panHandlers}
              style={[
                styles.draggableCard,
                {
                  width: cardWidth,
                  height: CARD_HEIGHT,
                  transform: pan.getTranslateTransform(),
                  zIndex: activeDragId === id ? 100 : 10,
                  elevation: activeDragId === id ? 8 : 1,
                },
              ]}
            >
              <Text style={styles.draggableCardText}>{valueById[id]}</Text>
            </Animated.View>
          );
        })}
    </View>
  );
}

function DragOrderBoard({
  options,
  disabled,
  resetKey,
  onOrderChange,
  onDragStateChange,
}: DragOrderBoardProps) {
  const SLOT_HEIGHT = 48;
  const GAP = 10;
  const CARD_HEIGHT = 46;
  const [boardWidth, setBoardWidth] = useState(0);
  const [slots, setSlots] = useState<(string | null)[]>([]);
  const [itemLayoutReady, setItemLayoutReady] = useState(false);

  const ids = useMemo(
    () => options.map((label, idx) => `${idx}__${label}`),
    [options]
  );
  const labelById = useMemo(() => {
    const map: Record<string, string> = {};
    ids.forEach((id, idx) => {
      map[id] = options[idx];
    });
    return map;
  }, [ids, options]);

  const slotLayoutsRef = React.useRef<Record<number, { x: number; y: number; width: number; height: number }>>({});
  const homeRef = React.useRef<Record<string, { x: number; y: number }>>({});
  const inSlotRef = React.useRef<Record<string, number | null>>({});
  const panRef = React.useRef<Record<string, Animated.ValueXY>>({});
  const dragStartRef = React.useRef<Record<string, { x: number; y: number }>>({});
  const originSlotRef = React.useRef<Record<string, number | null>>({});
  const responderRef = React.useRef<Record<string, ReturnType<typeof PanResponder.create>>>({});
  const disabledRef = React.useRef(disabled);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  React.useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    setSlots(Array(options.length).fill(null));
    setItemLayoutReady(false);
    onOrderChange([]);
    slotLayoutsRef.current = {};
    homeRef.current = {};
    inSlotRef.current = {};
    panRef.current = {};
    dragStartRef.current = {};
    originSlotRef.current = {};
    responderRef.current = {};
    setActiveDragId(null);
  }, [options, resetKey, onOrderChange]);

  useEffect(() => {
    onOrderChange(slots.filter((s): s is string => Boolean(s)).map((id) => labelById[id]));
  }, [slots, labelById, onOrderChange]);

  const cardWidth = boardWidth > 0 ? (boardWidth - GAP) / 2 : 150;
  const bankTop = options.length * (SLOT_HEIGHT + GAP) + 14;
  const rows = Math.ceil(options.length / 2);
  const boardHeight = bankTop + rows * (CARD_HEIGHT + GAP) + 8;

  useEffect(() => {
    if (boardWidth <= 0 || itemLayoutReady) return;
    ids.forEach((id, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const homeX = col * (cardWidth + GAP);
      const homeY = bankTop + row * (CARD_HEIGHT + GAP);
      homeRef.current[id] = { x: homeX, y: homeY };
      dragStartRef.current[id] = { x: homeX, y: homeY };
      inSlotRef.current[id] = null;
      originSlotRef.current[id] = null;
      panRef.current[id] = new Animated.ValueXY({ x: homeX, y: homeY });
    });
    setItemLayoutReady(true);
  }, [boardWidth, ids, itemLayoutReady, cardWidth, bankTop]);

  const snapTo = (id: string, x: number, y: number) => {
    const pan = panRef.current[id];
    if (!pan) return;
    Animated.spring(pan, {
      toValue: { x, y },
      useNativeDriver: false,
      bounciness: 5,
    }).start();
  };

  const getPanResponder = (id: string) => {
    const existingResponder = responderRef.current[id];
    if (existingResponder) return existingResponder;
    const responder = PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current,
      onStartShouldSetPanResponderCapture: () => !disabledRef.current,
      onMoveShouldSetPanResponderCapture: () => !disabledRef.current,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        onDragStateChange(true);
        setActiveDragId(id);
        const pan = panRef.current[id];
        if (!pan) return;
        originSlotRef.current[id] = inSlotRef.current[id] ?? null;
        pan.stopAnimation((value) => {
          dragStartRef.current[id] = value;
        });
      },
      onPanResponderMove: (_evt, gestureState) => {
        const pan = panRef.current[id];
        if (!pan) return;
        const start = dragStartRef.current[id] ?? { x: 0, y: 0 };
        pan.setValue({ x: start.x + gestureState.dx, y: start.y + gestureState.dy });
      },
      onPanResponderRelease: () => {
        onDragStateChange(false);
        setActiveDragId(null);
        const pan = panRef.current[id];
        if (!pan) return;
        pan.stopAnimation((value) => {
          const pos = value as { x: number; y: number };
          const overlappingSlots = Object.entries(slotLayoutsRef.current)
            .map(([slot, rect]) => ({ slotIndex: Number(slot), rect }))
            .filter(({ rect }) => {
              const cardLeft = pos.x;
              const cardRight = pos.x + cardWidth;
              const cardTop = pos.y;
              const cardBottom = pos.y + CARD_HEIGHT;
              const slotLeft = rect.x - 14;
              const slotRight = rect.x + rect.width + 14;
              const slotTop = rect.y - 14;
              const slotBottom = rect.y + rect.height + 14;
              return (
                cardRight >= slotLeft &&
                cardLeft <= slotRight &&
                cardBottom >= slotTop &&
                cardTop <= slotBottom
              );
            });

          const cardCenterX = pos.x + cardWidth / 2;
          const cardCenterY = pos.y + CARD_HEIGHT / 2;
          const candidateSlot =
            overlappingSlots.length === 0
              ? null
              : overlappingSlots.reduce((best, current) => {
                  const currentCenterX = current.rect.x + current.rect.width / 2;
                  const currentCenterY = current.rect.y + current.rect.height / 2;
                  const currentDist = Math.hypot(cardCenterX - currentCenterX, cardCenterY - currentCenterY);
                  if (!best) return { ...current, dist: currentDist };
                  return currentDist < best.dist ? { ...current, dist: currentDist } : best;
                }, null as ({ slotIndex: number; rect: { x: number; y: number; width: number; height: number }; dist: number } | null));

          const originSlot = originSlotRef.current[id] ?? null;

          if (candidateSlot) {
            const targetSlot = candidateSlot.slotIndex;
            const targetRect = candidateSlot.rect;
            const targetPos = { x: targetRect.x, y: targetRect.y + (SLOT_HEIGHT - CARD_HEIGHT) / 2 };

            if (originSlot !== null && targetSlot === originSlot) {
              dragStartRef.current[id] = targetPos;
              inSlotRef.current[id] = originSlot;
              snapTo(id, targetPos.x, targetPos.y);
              return;
            }

            const occupyingId = slots[targetSlot];
            setSlots((prev) => {
              const next = [...prev];
              if (originSlot !== null && next[originSlot] === id) {
                next[originSlot] = null;
              }
              next[targetSlot] = id;
              if (occupyingId && occupyingId !== id) {
                if (originSlot !== null) {
                  next[originSlot] = occupyingId;
                }
              }
              return next;
            });

            inSlotRef.current[id] = targetSlot;
            dragStartRef.current[id] = targetPos;
            snapTo(id, targetPos.x, targetPos.y);

            if (occupyingId && occupyingId !== id) {
              if (originSlot !== null) {
                const originRect = slotLayoutsRef.current[originSlot];
                if (originRect) {
                  const occupyingTarget = {
                    x: originRect.x,
                    y: originRect.y + (SLOT_HEIGHT - CARD_HEIGHT) / 2,
                  };
                  inSlotRef.current[occupyingId] = originSlot;
                  dragStartRef.current[occupyingId] = occupyingTarget;
                  snapTo(occupyingId, occupyingTarget.x, occupyingTarget.y);
                }
              } else {
                const occupyingHome = homeRef.current[occupyingId];
                if (occupyingHome) {
                  inSlotRef.current[occupyingId] = null;
                  dragStartRef.current[occupyingId] = occupyingHome;
                  snapTo(occupyingId, occupyingHome.x, occupyingHome.y);
                }
              }
            }

            return;
          }

          if (originSlot !== null) {
            const originRect = slotLayoutsRef.current[originSlot];
            if (originRect) {
              const originPos = { x: originRect.x, y: originRect.y + (SLOT_HEIGHT - CARD_HEIGHT) / 2 };
              inSlotRef.current[id] = originSlot;
              dragStartRef.current[id] = originPos;
              snapTo(id, originPos.x, originPos.y);
              return;
            }
          }

          const home = homeRef.current[id];
          inSlotRef.current[id] = null;
          if (home) {
            dragStartRef.current[id] = home;
            snapTo(id, home.x, home.y);
          }
        });
      },
      onPanResponderTerminate: () => {
        onDragStateChange(false);
        setActiveDragId(null);
        const originSlot = originSlotRef.current[id] ?? null;
        if (originSlot !== null) {
          const originRect = slotLayoutsRef.current[originSlot];
          if (originRect) {
            const originPos = { x: originRect.x, y: originRect.y + (SLOT_HEIGHT - CARD_HEIGHT) / 2 };
            inSlotRef.current[id] = originSlot;
            dragStartRef.current[id] = originPos;
            snapTo(id, originPos.x, originPos.y);
            return;
          }
        }
        const home = homeRef.current[id];
        if (home) {
          inSlotRef.current[id] = null;
          dragStartRef.current[id] = home;
          snapTo(id, home.x, home.y);
        }
      },
    });
    responderRef.current[id] = responder;
    return responder;
  };

  return (
    <View
      style={[styles.dragBoard, { height: boardHeight }]}
      onLayout={(e) => setBoardWidth(e.nativeEvent.layout.width)}
    >
      {options.map((_, idx) => (
        <View
          key={`slot-${idx}`}
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            slotLayoutsRef.current[idx] = { x, y, width, height };
          }}
          style={styles.dropSlot}
        >
          <Text style={styles.dropSlotText}>
            {slots[idx] ? labelById[slots[idx] as string] : `${idx + 1}. Drop here`}
          </Text>
        </View>
      ))}

      {itemLayoutReady &&
        ids.map((id) => {
          const pan = panRef.current[id];
          if (!pan) return null;
          const responder = getPanResponder(id);
          return (
            <Animated.View
              key={id}
              {...responder.panHandlers}
              style={[
                styles.draggableCard,
                {
                  width: cardWidth,
                  height: CARD_HEIGHT,
                  transform: pan.getTranslateTransform(),
                  zIndex: activeDragId === id ? 100 : 10,
                  elevation: activeDragId === id ? 8 : 1,
                },
              ]}
            >
              <Text style={styles.draggableCardText}>{labelById[id]}</Text>
            </Animated.View>
          );
        })}
    </View>
  );
}

export default function LessonScreen() {
  const router = useRouter();
  const { lessonId, title } = useLocalSearchParams<{
    lessonId?: string;
    title?: string;
  }>();

  const lesson = useMemo(() => getLessonDefinition(lessonId), [lessonId]);
  const displayTitle = title ?? lesson?.title ?? `Lesson ${lessonId ?? ""}`.trim();

  const totalQuestions = lesson?.questions.length ?? 1;

  const [questionIndex, setQuestionIndex] = useState(0);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [isQuestionComplete, setIsQuestionComplete] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [lastResultCorrect, setLastResultCorrect] = useState<boolean | null>(null);
  const sheetAnim = useState(() => new Animated.Value(0))[0];

  // choice/order questions
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [multiSelection, setMultiSelection] = useState<string[]>([]);
  const [matchSelection, setMatchSelection] = useState<string[]>([]);
  const [tokenAssembleSelection, setTokenAssembleSelection] = useState<string[]>([]);
  const [orderSelection, setOrderSelection] = useState<string[]>([]);
  const [orderBoardResetKey, setOrderBoardResetKey] = useState(0);
  const [matchBoardResetKey, setMatchBoardResetKey] = useState(0);
  const [isDraggingOrderCard, setIsDraggingOrderCard] = useState(false);

  // counter questions
  const [counterText, setCounterText] = useState("0");
  const [submittedCounter, setSubmittedCounter] = useState(false);
  const [counterCorrect, setCounterCorrect] = useState<boolean | null>(null);
  const [shortAnswerText, setShortAnswerText] = useState("");
  const [showHint, setShowHint] = useState(false);
  // typing questions
  const [typedText, setTypedText] = useState("");
  const shakeAnim = useState(() => new Animated.Value(0))[0];
  const [showTypingErrorGlow, setShowTypingErrorGlow] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  const currentQuestion: LessonQuestion | null = lesson?.questions[questionIndex] ?? null;
  const isLastQuestion = questionIndex === totalQuestions - 1;
  const progress = totalQuestions > 0 ? (questionIndex + 1) / totalQuestions : 0;

  const resetForQuestion = (q: LessonQuestion | null) => {
    setSelectedChoice(null);
    setMultiSelection([]);
    setMatchSelection([]);
    setTokenAssembleSelection([]);
    setOrderSelection([]);
    setOrderBoardResetKey((k) => k + 1);
    setMatchBoardResetKey((k) => k + 1);
    setSubmittedCounter(false);
    setCounterCorrect(null);
    const initial =
      q?.kind === "counter" && typeof q.initialValue === "number"
        ? String(q.initialValue)
        : "-";
    setCounterText(initial);
    setShortAnswerText("");
    setShowHint(false);
    setTypedText("");
    setShowTypingErrorGlow(false);
    setIsQuestionComplete(false);
    setBottomSheetVisible(false);
    setLastResultCorrect(null);
  };

  useEffect(() => {
    setQuestionIndex(0);
    resetForQuestion(lesson?.questions[0] ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  useEffect(() => {
    if (currentQuestion?.kind !== "typing") {
      setCursorVisible(true);
      return;
    }
    const id = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 600);
    return () => clearInterval(id);
  }, [currentQuestion?.kind]);

  const renderInlineCode = (text: string) => {
    const parts = text.split(/(`[^`]+`)/g).filter(Boolean);
    return parts.map((part, idx) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <Text key={`${text}-code-${idx}`} style={styles.inlineCodeText}>
            {part.slice(1, -1)}
          </Text>
        );
      }
      return <React.Fragment key={`${text}-plain-${idx}`}>{part}</React.Fragment>;
    });
  };

  const renderCodeSyntax = (code: string) => {
    const parts = code.split(
      /(\".*?\"|\'.*?\'|\bif\b|\belif\b|\belse\b|\bTrue\b|\bFalse\b|\bprint\b|\bwear\b|==|>=|<=|>|<|=|:|\(|\)|\b\d+\b)/g
    );
    return parts.filter((part) => part.length > 0).map((part, idx) => {
      let tokenStyle = styles.codeTokenDefault;
      if (/^\".*\"$|^\'.*\'$/.test(part)) tokenStyle = styles.codeTokenString;
      else if (/^(if|elif|else)$/.test(part)) tokenStyle = styles.codeTokenKeyword;
      else if (/^(True|False)$/.test(part)) tokenStyle = styles.codeTokenBoolean;
      else if (/^(print|wear)$/.test(part)) tokenStyle = styles.codeTokenFunction;
      else if (/^(==|>=|<=|>|<|=|:|\(|\))$/.test(part)) tokenStyle = styles.codeTokenOperator;
      else if (/^\d+$/.test(part)) tokenStyle = styles.codeTokenNumber;
      return (
        <Text key={`${code}-tok-${idx}`} style={[styles.codeContextText, tokenStyle]}>
          {part}
        </Text>
      );
    });
  };

  const goNext = () => {
    if (isLastQuestion) {
      router.replace({
        pathname: "/lesson/completed",
        params: { lessonId: lessonId ?? "", title: displayTitle },
      });
      return;
    }
    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    resetForQuestion(lesson?.questions[nextIndex] ?? null);
  };

  const renderContextLine = (line: string, key: string) => {
    const codeMatch = line.match(/^(\d+)\.\s?(.*)$/);
    if (!codeMatch) {
      return (
        <Text key={key} style={styles.contextLine}>
          {renderInlineCode(line)}
        </Text>
      );
    }
    const [, lineNumber, codeText] = codeMatch;
    return (
      <View key={key} style={styles.codeContextRow}>
        <Text style={styles.codeContextLineNumber}>{lineNumber}</Text>
        <Text style={styles.codeContextText}>{renderCodeSyntax(codeText)}</Text>
      </View>
    );
  };

  useEffect(() => {
    if (bottomSheetVisible) {
      // slide in animation
      sheetAnim.setValue(0);
      Animated.timing(sheetAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottomSheetVisible]);

  const renderBinary = (q: Extract<LessonQuestion, { kind: "binary" }>) => {
    return (
      <>
        <View style={styles.signContainer}>
          <View style={styles.sign}>
            <Text style={styles.signTitle}>{q.signTitle}</Text>
            <Text style={styles.signSubtitle}>{q.signSubtitle}</Text>
          </View>
        </View>

        <View style={styles.optionsRow}>
          {q.options.map((option) => {
            const isSelected = selectedChoice === option;
            const isCorrect = option === q.correctAnswer;
            const showAsCorrect =
              isCorrect && isQuestionComplete && lastResultCorrect === false;
            const backgroundColor = isSelected
              ? isCorrect
                ? "#58CC02"
                : "#FF4B4B"
              : showAsCorrect
              ? "#58CC02"
              : "#F2F2F7";

            return (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  if (isQuestionComplete) return;
                  setSelectedChoice(option);
                  const isAnswerCorrect = option === q.correctAnswer;
                  setIsQuestionComplete(true);
                  setLastResultCorrect(isAnswerCorrect);
                  setBottomSheetVisible(true);
                }}
                style={[styles.optionButton, { backgroundColor }]}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.optionText,
                    (isSelected || showAsCorrect) && { color: "#FFFFFF" },
                  ]}
                >
                  {renderInlineCode(option)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedChoice && !isQuestionComplete && (
          <Text style={styles.feedbackText}>
            {selectedChoice === q.correctAnswer ? "Correct!" : "Try again."}
          </Text>
        )}
      </>
    );
  };

  const renderSingleChoice = (q: Extract<LessonQuestion, { kind: "singleChoice" }>) => {
    const isCheckXChoice =
      q.options.length === 2 &&
      q.options.includes("✓") &&
      q.options.includes("✕");
    const useGridLayout = !isCheckXChoice && q.options.length === 4;
    return (
      <>
        {q.contextLines?.length ? (
          <View style={[styles.contextCard, styles.codeContextCard]}>
            {q.contextLines.map((line, idx) => renderContextLine(line, `${q.id}-ctx-${idx}`))}
          </View>
        ) : null}

        <View style={isCheckXChoice ? styles.optionsRow : useGridLayout ? [styles.optionsColumn, styles.optionsGrid] : styles.optionsColumn}>
          {q.options.map((option) => {
            const isSelected = selectedChoice === option;
            const isCorrect = option === q.correctAnswer;
            const showAsCorrect =
              isCorrect && isQuestionComplete && lastResultCorrect === false;
            const defaultCheckXColor = option === "✓" ? "#58CC02" : "#FF4B4B";
            const backgroundColor = isCheckXChoice
              ? isSelected
                ? isCorrect
                  ? "#58CC02"
                  : "#FF4B4B"
                : showAsCorrect
                ? "#58CC02"
                : defaultCheckXColor
              : isSelected
              ? isCorrect
                ? "#58CC02"
                : "#FF4B4B"
              : showAsCorrect
              ? "#58CC02"
              : "#F2F2F7";

            return (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  if (isQuestionComplete) return;
                  setSelectedChoice(option);
                  const ok = option === q.correctAnswer;
                  setIsQuestionComplete(true);
                  setLastResultCorrect(ok);
                  setBottomSheetVisible(true);
                }}
                style={[
                  isCheckXChoice ? styles.checkXHalfButton : useGridLayout ? [styles.optionButtonWide, styles.optionGridHalfButton] : styles.optionButtonWide,
                  { backgroundColor },
                ]}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    isCheckXChoice ? styles.checkXButtonText : styles.optionText,
                    (isSelected || showAsCorrect || isCheckXChoice) && { color: "#FFFFFF" },
                  ]}
                >
                  {renderInlineCode(option)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </>
    );
  };

  const renderMultiSelect = (q: Extract<LessonQuestion, { kind: "multiSelect" }>) => {
    const selectedSet = new Set(multiSelection);
    const correctSet = new Set(q.correctAnswers);
    const canSubmit = multiSelection.length === q.requiredSelectionCount;
    const layoutColumns = q.layoutColumns ?? (q.options.length === 4 ? 2 : undefined);

    const submitMultiSelect = () => {
      if (isQuestionComplete || !canSubmit) return;
      const hasExactAnswers =
        q.correctAnswers.length === multiSelection.length &&
        q.correctAnswers.every((answer) => selectedSet.has(answer));
      setIsQuestionComplete(true);
      setLastResultCorrect(hasExactAnswers);
      setBottomSheetVisible(true);
    };

    return (
      <>
        {q.contextLines?.length ? (
          <View style={[styles.contextCard, styles.codeContextCard]}>
            {q.contextLines.map((line, idx) => renderContextLine(line, `${q.id}-ctx-${idx}`))}
          </View>
        ) : null}

        <View style={[styles.optionsColumn, layoutColumns ? styles.optionsGrid : null]}>
          {q.options.map((option) => {
            const isSelected = selectedSet.has(option);
            const isCorrect = correctSet.has(option);
            const showAsCorrect = isCorrect && isQuestionComplete && lastResultCorrect === false;
            const showAsWrongSelected = isSelected && isQuestionComplete && !isCorrect;
            const backgroundColor = isQuestionComplete
              ? showAsWrongSelected
                ? "#FF4B4B"
                : showAsCorrect || (isSelected && isCorrect)
                ? "#58CC02"
                : "#F2F2F7"
              : isSelected
              ? "#1CB0F6"
              : "#F2F2F7";

            return (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  if (isQuestionComplete) return;
                  setMultiSelection((prev) => {
                    if (prev.includes(option)) {
                      return prev.filter((value) => value !== option);
                    }
                    if (prev.length >= q.requiredSelectionCount) return prev;
                    return [...prev, option];
                  });
                }}
                style={[
                  styles.optionButtonWide,
                  layoutColumns ? { width: `${100 / layoutColumns - 2}%` as `${number}%` } : null,
                  { backgroundColor },
                ]}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.optionText,
                    (isSelected || showAsCorrect || showAsWrongSelected) && { color: "#FFFFFF" },
                  ]}
                >
                  {renderInlineCode(option)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.orderActionsRow}>
          <TouchableOpacity
            style={styles.orderSecondaryButton}
            onPress={() => setMultiSelection([])}
            disabled={isQuestionComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.orderSecondaryText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.orderPrimaryButton,
              !canSubmit && styles.optionButtonDisabled,
            ]}
            onPress={submitMultiSelect}
            disabled={isQuestionComplete || !canSubmit}
            activeOpacity={0.9}
          >
            <Text style={styles.orderPrimaryText}>
              Submit ({multiSelection.length}/{q.requiredSelectionCount})
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderOrder = (q: Extract<LessonQuestion, { kind: "order" }>) => {
    const submitOrder = () => {
      if (isQuestionComplete) return;
      if (orderSelection.length !== q.options.length) return;
      const ok = q.correctOrders.some((correct) =>
        correct.length === orderSelection.length &&
        correct.every((step, idx) => step === orderSelection[idx])
      );
      setIsQuestionComplete(true);
      setLastResultCorrect(ok);
      setBottomSheetVisible(true);
    };

    return (
      <>
        {q.contextLines?.length ? (
          <View style={[styles.contextCard, styles.codeContextCard]}>
            {q.contextLines.map((line, idx) => renderContextLine(line, `${q.id}-ctx-${idx}`))}
          </View>
        ) : null}

        <View style={styles.contextCard}>
          <Text style={styles.contextLabel}>Your order</Text>
          <Text style={styles.contextLine}>
            {orderSelection.length
              ? orderSelection.map((s, i) => `${i + 1}. ${s}`).join("  |  ")
              : "Drag options into the 1-4 boxes"}
          </Text>
        </View>

        <DragOrderBoard
          options={q.options}
          disabled={isQuestionComplete}
          resetKey={orderBoardResetKey}
          onOrderChange={setOrderSelection}
          onDragStateChange={setIsDraggingOrderCard}
        />

        <View style={styles.orderActionsRow}>
          <TouchableOpacity
            style={styles.orderSecondaryButton}
            onPress={() => {
              setOrderSelection([]);
              setOrderBoardResetKey((k) => k + 1);
            }}
            disabled={isQuestionComplete || isDraggingOrderCard}
            activeOpacity={0.85}
          >
            <Text style={styles.orderSecondaryText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.orderPrimaryButton,
              orderSelection.length !== q.options.length && styles.optionButtonDisabled,
            ]}
            onPress={submitOrder}
            disabled={isQuestionComplete || isDraggingOrderCard || orderSelection.length !== q.options.length}
            activeOpacity={0.9}
          >
            <Text style={styles.orderPrimaryText}>Submit Order</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderTokenAssemble = (q: Extract<LessonQuestion, { kind: "tokenAssemble" }>) => {
    const values =
      tokenAssembleSelection.length === q.slotCount
        ? tokenAssembleSelection
        : Array.from({ length: q.slotCount }, (_, idx) => tokenAssembleSelection[idx] ?? "");
    const filledCount = values.filter(Boolean).length;
    const decodedValues = values.map((value) => (value ? decodeTokenLabel(value) : ""));
    const compactValues = decodedValues.filter(Boolean);
    const submit = () => {
      if (isQuestionComplete) return;
      if (q.allowPartialFill) {
        if (filledCount === 0) return;
      } else if (filledCount !== q.slotCount) {
        return;
      }
      const acceptableOrders = q.correctOrders?.length ? q.correctOrders : [q.correctOrder];
      const ok = q.allowPartialFill
        ? acceptableOrders.some(
            (order) =>
              order.length === compactValues.length &&
              order.every((value, idx) => value === compactValues[idx])
          )
        : acceptableOrders.some((order) => order.every((value, idx) => value === decodedValues[idx]));
      setIsQuestionComplete(true);
      setLastResultCorrect(ok);
      setBottomSheetVisible(true);
    };

    return (
      <>
        {q.contextLines?.length ? (
          <View style={[styles.contextCard, styles.codeContextCard]}>
            {q.contextLines.map((line, idx) => renderContextLine(line, `${q.id}-ctx-${idx}`))}
          </View>
        ) : null}
        {q.codePrefix || q.codeSuffix ? (
          <View style={[styles.contextCard, styles.codeContextCard]}>
            <View style={styles.inlineCodeBuilderRow}>
              {q.codePrefix ? <Text style={styles.codeContextText}>{q.codePrefix} </Text> : null}
              <View style={styles.inlineCodeBlankBox}>
                <Text style={styles.codeContextText}>{decodedValues[0] || "____"}</Text>
              </View>
              {q.codeSuffix ? <Text style={styles.codeContextText}> {q.codeSuffix}</Text> : null}
            </View>
          </View>
        ) : null}
        <TokenAssembleRow
          slotCount={q.slotCount}
          slotRows={q.slotRows}
          tokens={q.tokens}
          values={values}
          disabled={isQuestionComplete}
          onValuesChange={setTokenAssembleSelection}
          onDragStateChange={setIsDraggingOrderCard}
        />
        <View style={styles.orderActionsRow}>
          <TouchableOpacity
            style={styles.orderSecondaryButton}
            onPress={() => setTokenAssembleSelection(Array(q.slotCount).fill(""))}
            disabled={isQuestionComplete || isDraggingOrderCard}
            activeOpacity={0.85}
          >
            <Text style={styles.orderSecondaryText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.orderPrimaryButton,
              ((q.allowPartialFill && filledCount === 0) ||
                (!q.allowPartialFill && filledCount !== q.slotCount)) &&
                styles.optionButtonDisabled,
            ]}
            onPress={submit}
            disabled={
              isQuestionComplete ||
              isDraggingOrderCard ||
              (q.allowPartialFill ? filledCount === 0 : filledCount !== q.slotCount)
            }
            activeOpacity={0.9}
          >
            <Text style={styles.orderPrimaryText}>Submit ({filledCount}/{q.slotCount})</Text>
          </TouchableOpacity>
        </View>
        {isQuestionComplete && lastResultCorrect === false ? (
          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>Correct answer</Text>
            <Text style={styles.contextLine}>
              {(q.correctOrders?.[0] ?? q.correctOrder).join(" ")}
            </Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderMatchDrag = (q: Extract<LessonQuestion, { kind: "matchDrag" }>) => {
    const submitMatch = () => {
      if (isQuestionComplete) return;
      if (matchSelection.length !== q.leftItems.length || matchSelection.some((v) => !v)) return;
      const ok = q.correctValues.every((value, idx) => value === matchSelection[idx]);
      setIsQuestionComplete(true);
      setLastResultCorrect(ok);
      setBottomSheetVisible(true);
    };

    const selectedCount = matchSelection.filter(Boolean).length;
    return (
      <>
        {q.contextLines?.length ? (
          <View style={[styles.contextCard, styles.codeContextCard]}>
            {q.contextLines.map((line, idx) => renderContextLine(line, `${q.id}-ctx-${idx}`))}
          </View>
        ) : null}

        <DragMatchBoard
          leftItems={q.leftItems}
          values={q.draggableValues}
          appendEqualsToLeftItems={q.appendEqualsToLeftItems}
          disabled={isQuestionComplete}
          resetKey={matchBoardResetKey}
          onMatchChange={setMatchSelection}
          onDragStateChange={setIsDraggingOrderCard}
        />

        <View style={styles.orderActionsRow}>
          <TouchableOpacity
            style={styles.orderSecondaryButton}
            onPress={() => {
              setMatchSelection([]);
              setMatchBoardResetKey((k) => k + 1);
            }}
            disabled={isQuestionComplete || isDraggingOrderCard}
            activeOpacity={0.85}
          >
            <Text style={styles.orderSecondaryText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.orderPrimaryButton,
              selectedCount !== q.leftItems.length && styles.optionButtonDisabled,
            ]}
            onPress={submitMatch}
            disabled={isQuestionComplete || isDraggingOrderCard || selectedCount !== q.leftItems.length}
            activeOpacity={0.9}
          >
            <Text style={styles.orderPrimaryText}>Submit ({selectedCount}/{q.leftItems.length})</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderCounter = (q: Extract<LessonQuestion, { kind: "counter" }>) => {
    const bumpCounter = (delta: number) => {
      if (isQuestionComplete) return;
      const n = Number.parseInt(counterText || "0", 10);
      const base =
        counterText === "-"
          ? 0
          : Number.isFinite(n)
          ? n
          : 0;
      const next = base + delta;
      setCounterText(String(next));
      setSubmittedCounter(false);
      setCounterCorrect(null);
    };

    const submit = () => {
      if (isQuestionComplete) return;
      const x = Number.parseInt(counterText, 10);
      if (!Number.isFinite(x)) {
        setSubmittedCounter(true);
        setCounterCorrect(false);
        return;
      }
      const conditionTrue = evaluateComparison(q.statement.op, x, q.statement.value);
      const ok = q.goal === "TRUE" ? conditionTrue : !conditionTrue;
      setSubmittedCounter(true);
      setCounterCorrect(ok);
      if (ok) {
        setIsQuestionComplete(true);
        setLastResultCorrect(true);
        setBottomSheetVisible(true);
      }
    };

    return (
      <>
        <View style={styles.signContainer}>
          <View style={styles.sign}>
            <Text style={styles.signTitle}>Statement</Text>
            <Text style={styles.statementText}>{formatStatement(q.statement)}</Text>
          </View>
        </View>

        <View style={styles.counterContainer}>
          <TouchableOpacity onPress={() => bumpCounter(1)} style={styles.arrowButton} activeOpacity={0.8}>
            <Text style={styles.arrowText}>▲</Text>
          </TouchableOpacity>

          <TextInput
            value={counterText}
            onChangeText={(t) => {
              if (isQuestionComplete) return;
              let cleaned = t.replace(/[^0-9-]/g, "");

              // Only allow a single leading '-'
              const firstDash = cleaned.indexOf("-");
              if (firstDash > 0) {
                cleaned = cleaned.replace(/-/g, "");
              }
              if (firstDash === 0) {
                cleaned =
                  "-" + cleaned.slice(1).replace(/-/g, "");
              }

              // Prevent numbers like 045 or -012
              const sign = cleaned.startsWith("-") ? "-" : "";
              let digits = sign ? cleaned.slice(1) : cleaned;
              if (digits.length > 1 && digits.startsWith("0")) {
                // trim leading zeros but keep a single zero if all zeros
                digits = digits.replace(/^0+/, "");
                if (digits === "") digits = "0";
              }
              cleaned = sign + digits;

              setCounterText(cleaned);
              setSubmittedCounter(false);
              setCounterCorrect(null);
            }}
            keyboardType="numbers-and-punctuation"
            style={styles.counterInput}
            textAlign="center"
            returnKeyType="done"
          />

          <TouchableOpacity onPress={() => bumpCounter(-1)} style={styles.arrowButton} activeOpacity={0.8}>
            <Text style={styles.arrowText}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.submitRow}>
          <TouchableOpacity style={styles.submitButton} onPress={submit} activeOpacity={0.9}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {submittedCounter && counterCorrect !== null && (
          <Text style={styles.feedbackText}>{counterCorrect ? "Correct!" : "Try again."}</Text>
        )}

      </>
    );
  };

  const renderShortAnswer = (q: Extract<LessonQuestion, { kind: "shortAnswer" }>) => {
    const submit = () => {
      if (isQuestionComplete) return;
      const normalizedInput = q.caseSensitive ? shortAnswerText.trim() : shortAnswerText.trim().toLowerCase();
      const ok = q.acceptableAnswers.some((answer) => {
        const normalizedAnswer = q.caseSensitive ? answer.trim() : answer.trim().toLowerCase();
        return normalizedInput === normalizedAnswer;
      });
      setIsQuestionComplete(true);
      setLastResultCorrect(ok);
      setBottomSheetVisible(true);
    };

    return (
      <>
        {q.contextLines?.length ? (
          <View style={[styles.contextCard, styles.codeContextCard]}>
            {q.contextLines.map((line, idx) => renderContextLine(line, `${q.id}-ctx-${idx}`))}
          </View>
        ) : null}
        <View style={styles.counterContainer}>
          {q.statusEmoji ? (
            <View style={styles.statusEmojiRow}>
              <Text style={styles.statusEmojiText}>{q.statusEmoji}</Text>
              {q.statusEmojiCrossOnCorrect && isQuestionComplete && lastResultCorrect ? (
                <View style={styles.statusEmojiStrike} />
              ) : null}
            </View>
          ) : null}
          {q.inputPrefix ? (
            <View style={styles.shortAnswerPrefixRow}>
              <Text style={styles.shortAnswerPrefixText}>{q.inputPrefix}</Text>
            </View>
          ) : null}
          <TextInput
            style={[styles.counterInput, { fontSize: 22, minWidth: 220 }]}
            value={shortAnswerText}
            onChangeText={setShortAnswerText}
            placeholder={q.placeholder ?? "Type your answer"}
            editable={!isQuestionComplete}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <View style={styles.submitRow}>
          <TouchableOpacity
            style={[styles.submitButton, shortAnswerText.trim().length === 0 && styles.optionButtonDisabled]}
            onPress={submit}
            disabled={isQuestionComplete || shortAnswerText.trim().length === 0}
            activeOpacity={0.9}
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const triggerTypingError = () => {
    setShowTypingErrorGlow(true);
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 2, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 3, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => setShowTypingErrorGlow(false), 200);
    });
  };

  const renderTyping = (q: Extract<LessonQuestion, { kind: "typing" }>) => {
    const code = q.code;
    const matchLength = Math.min(typedText.length, code.length);
    const isPrefixMatch =
      matchLength === typedText.length &&
      code.slice(0, matchLength) === typedText;
    const isComplete = typedText === code;

    const handleTypingChange = (newText: string) => {
      if (isQuestionComplete) return;
      if (newText.length < typedText.length) {
        setTypedText(newText);
        return;
      }
      if (newText.length > typedText.length + 1) {
        triggerTypingError();
        return;
      }
      const addedChar = newText[newText.length - 1];
      const expectedChar = code[typedText.length];
      if (addedChar === expectedChar) {
        setTypedText(newText);
        if (newText === code) {
          setIsQuestionComplete(true);
          setLastResultCorrect(true);
          setBottomSheetVisible(true);
        }
      } else {
        triggerTypingError();
      }
    };

    const shakeTranslateX = shakeAnim.interpolate({
      inputRange: [0, 1, 2, 3, 4],
      outputRange: [0, 8, -8, 8, 0],
    });

    return (
      <>
        <View style={styles.signContainer}>
          <Animated.View
            style={[
              styles.codeBox,
              showTypingErrorGlow && styles.codeBoxError,
              { transform: [{ translateX: shakeTranslateX }] },
            ]}
          >
            <Text style={styles.codeGrey} selectable={false}>
              {code}
            </Text>
            <View style={styles.codeOverlay} pointerEvents="none">
                <Text style={styles.codeColored}>
                  {(isPrefixMatch ? typedText : "")}
                  {isQuestionComplete ? "" : cursorVisible ? "|" : " "}
                </Text>
            </View>
            <TextInput
              style={styles.codeInput}
              value={typedText}
              onChangeText={handleTypingChange}
              placeholder=""
              placeholderTextColor="transparent"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              returnKeyType="done"
              autoFocus
            />
          </Animated.View>
        </View>
        {isComplete && (
          <Text style={styles.feedbackText}>Correct!</Text>
        )}
      </>
    );
  };

  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [120, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => setShowQuitConfirm(true)}
            style={styles.closeButton}
            activeOpacity={0.8}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.progressWrapper}>
            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              {Math.min(questionIndex + 1, totalQuestions)} / {totalQuestions}
            </Text>
          </View>
        </View>

        <Text style={styles.heading}>{displayTitle}</Text>

        {lesson && currentQuestion ? (
          <>
            <View style={styles.characterCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarEmoji}>🧒</Text>
                {"hintText" in currentQuestion && currentQuestion.hintText ? (
                  <TouchableOpacity
                    style={styles.hintBadge}
                    onPress={() => setShowHint((v) => !v)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.hintBadgeText}>💡</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <View style={styles.speechBubble}>
                <Text style={styles.speechText}>{renderInlineCode(currentQuestion.prompt)}</Text>
              </View>
            </View>
            {showHint && "hintText" in currentQuestion && currentQuestion.hintText ? (
              <View style={styles.contextCard}>
                <Text style={styles.contextLabel}>Hint</Text>
                <Text style={styles.contextLine}>{currentQuestion.hintText}</Text>
              </View>
            ) : null}
            {isQuestionComplete &&
            lastResultCorrect &&
            "explanationOnCorrect" in currentQuestion &&
            currentQuestion.explanationOnCorrect ? (
              <View style={styles.contextCard}>
                <Text style={styles.contextLabel}>Duo says</Text>
                <Text style={styles.contextLine}>{currentQuestion.explanationOnCorrect}</Text>
              </View>
            ) : null}

            {currentQuestion.kind === "binary"
              ? renderBinary(currentQuestion)
              : currentQuestion.kind === "singleChoice"
              ? renderSingleChoice(currentQuestion)
              : currentQuestion.kind === "multiSelect"
              ? renderMultiSelect(currentQuestion)
              : currentQuestion.kind === "matchDrag"
              ? renderMatchDrag(currentQuestion)
              : currentQuestion.kind === "tokenAssemble"
              ? renderTokenAssemble(currentQuestion)
              : currentQuestion.kind === "order"
              ? renderOrder(currentQuestion)
              : currentQuestion.kind === "counter"
              ? renderCounter(currentQuestion)
              : currentQuestion.kind === "shortAnswer"
              ? renderShortAnswer(currentQuestion)
              : renderTyping(currentQuestion)}
          </>
        ) : (
          <Text style={styles.subheading}>
            This is a blank lesson screen. We will add questions here next.
          </Text>
        )}

        {bottomSheetVisible && (
          <View style={styles.resultSheetContainer} pointerEvents="box-none">
            <Animated.View
              style={[
                styles.resultSheet,
                lastResultCorrect === false && styles.resultSheetError,
                { transform: [{ translateY: sheetTranslateY }] },
              ]}
            >
              <Text style={styles.resultSheetText}>
                {lastResultCorrect === false
                  ? "Not quite. The correct answer is highlighted."
                  : "Correct!"}
              </Text>
              <View style={styles.resultSheetButtons}>
                <TouchableOpacity
                  style={styles.resultSheetRedoButton}
                  onPress={() => {
                    resetForQuestion(currentQuestion);
                    setIsQuestionComplete(false);
                    setBottomSheetVisible(false);
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={styles.resultSheetRedoText}>Redo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.resultSheetContinueButton}
                  onPress={() => {
                    setBottomSheetVisible(false);
                    setIsQuestionComplete(false);
                    goNext();
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={styles.resultSheetContinueText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        )}

        <Modal
          transparent
          animationType="fade"
          visible={showQuitConfirm}
          onRequestClose={() => setShowQuitConfirm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                Quit and you'll lose all XP gained in this lesson!
              </Text>
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.modalPrimaryButton}
                  onPress={() => setShowQuitConfirm(false)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.modalPrimaryText}>Keep Learning</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSecondaryButton}
                  onPress={() => {
                    setShowQuitConfirm(false);
                    router.back();
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalSecondaryText}>Quit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  root: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  closeButton: {
    padding: 8,
    marginRight: 8,
  },
  closeText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#777777",
  },
  progressWrapper: {
    flex: 1,
  },
  progressBackground: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E5E5EA",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#58CC02",
  },
  progressLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#555555",
    textAlign: "right",
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
  },
  subheading: {
    fontSize: 16,
    color: "#555555",
  },
  characterCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFE6B3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  hintBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    backgroundColor: "#FFF6C5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EACB61",
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  hintBadgeText: {
    fontSize: 13,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F0F0F5",
  },
  speechText: {
    fontSize: 16,
    color: "#222222",
  },
  signContainer: {
    marginTop: 32,
    alignItems: "center",
  },
  sign: {
    width: 220,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#FFF3C4",
    borderWidth: 2,
    borderColor: "#F2D067",
    alignItems: "center",
  },
  signTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222222",
    marginBottom: 4,
  },
  signSubtitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#444444",
  },
  statementText: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "900",
    color: "#222222",
  },
  codeBox: {
    width: "100%",
    maxWidth: 320,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#F2F2F7",
    borderWidth: 2,
    borderColor: "#E0E0E5",
    position: "relative",
    overflow: "hidden",
  },
  codeBoxError: {
    borderColor: "#FF4B4B",
    shadowColor: "#FF4B4B",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  codeGrey: {
    fontFamily: "Menlo",
    color: "#C0C0C7",
    fontSize: 18,
  },
  codeOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 16,
  },
  codeColored: {
    fontFamily: "Menlo",
    color: "#222222",
    fontSize: 18,
  },
  codeInput: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.02,
  },
  contextCard: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#F8F8FB",
    borderWidth: 1,
    borderColor: "#E7E7EE",
    padding: 12,
  },
  contextLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#666",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  contextLine: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  codeContextCard: {
    backgroundColor: "#F3F5FA",
    borderColor: "#DCE2EE",
  },
  codeContextRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  codeContextLineNumber: {
    width: 18,
    color: "#8A95A7",
    fontSize: 13,
    fontFamily: "Menlo",
    fontWeight: "600",
  },
  codeContextText: {
    flex: 1,
    color: "#1F2937",
    fontSize: 14,
    fontFamily: "Menlo",
  },
  codeTokenDefault: {
    color: "#1F2937",
  },
  codeTokenKeyword: {
    color: "#7C3AED",
    fontWeight: "700",
  },
  codeTokenBoolean: {
    color: "#0D9488",
    fontWeight: "700",
  },
  codeTokenString: {
    color: "#B45309",
  },
  codeTokenNumber: {
    color: "#2563EB",
  },
  codeTokenOperator: {
    color: "#334155",
    fontWeight: "700",
  },
  codeTokenFunction: {
    color: "#BE185D",
  },
  inlineCodeBuilderRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  inlineCodeBlankBox: {
    minWidth: 72,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#9BA8C0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  inlineCodeText: {
    fontFamily: "Menlo",
    backgroundColor: "#E9EDF5",
    color: "#1F2937",
    fontSize: 14,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  optionsColumn: {
    marginTop: 20,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  optionButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222222",
  },
  optionButtonWide: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  optionGridHalfButton: {
    width: "48%",
  },
  checkXHalfButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  checkXButtonText: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  optionButtonDisabled: {
    opacity: 0.45,
  },
  orderActionsRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderSecondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#EFEFF5",
  },
  orderSecondaryText: {
    color: "#555",
    fontWeight: "700",
  },
  orderPrimaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#1CB0F6",
  },
  orderPrimaryText: {
    color: "#FFF",
    fontWeight: "800",
  },
  dragBoard: {
    marginTop: 16,
    width: "100%",
    position: "relative",
  },
  dropSlot: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#CBD1DD",
    justifyContent: "center",
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: "#FAFAFD",
  },
  matchRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  matchLeftCell: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DADCE5",
    backgroundColor: "#F8F9FD",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  matchLeftText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#30343F",
  },
  matchDropSlot: {
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#CBD1DD",
    justifyContent: "center",
    paddingHorizontal: 10,
    backgroundColor: "#FAFAFD",
  },
  tokenAssembleContainer: {
    marginTop: 20,
  },
  tokenSlotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
  },
  tokenSlotBox: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#CBD1DD",
    backgroundColor: "#FAFAFD",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  tokenPlacedPill: {
    width: "100%",
    paddingHorizontal: 8,
  },
  tokenPlacedPressable: {
    backgroundColor: "#1CB0F6",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  tokenPlacedText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 14,
  },
  tokenBankRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  tokenBankPill: {
    backgroundColor: "#E7F5FF",
    borderWidth: 1,
    borderColor: "#B8DBFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tokenBankPillUsed: {
    opacity: 0,
  },
  tokenBankText: {
    color: "#1D3557",
    fontWeight: "700",
    fontSize: 14,
  },
  dropSlotText: {
    fontSize: 14,
    color: "#4A4A55",
    fontWeight: "600",
  },
  draggableCard: {
    position: "absolute",
    borderRadius: 12,
    backgroundColor: "#E7F5FF",
    borderWidth: 1,
    borderColor: "#B8DBFF",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  draggableCardText: {
    fontSize: 13,
    color: "#1D3557",
    fontWeight: "700",
  },
  feedbackText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "700",
    color: "#555555",
  },
  counterContainer: {
    marginTop: 28,
    alignItems: "center",
  },
  arrowButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#222222",
  },
  counterInput: {
    marginVertical: 14,
    minWidth: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E5EA",
    fontSize: 34,
    fontWeight: "900",
    color: "#222222",
    backgroundColor: "#FFFFFF",
  },
  submitRow: {
    marginTop: 14,
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#1CB0F6",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 999,
    borderBottomWidth: 3,
    borderBottomColor: "#1899D6",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  statusEmojiRow: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    position: "relative",
    width: 60,
    alignSelf: "center",
  },
  statusEmojiText: {
    fontSize: 34,
  },
  statusEmojiStrike: {
    position: "absolute",
    width: 46,
    height: 3,
    backgroundColor: "#FF4B4B",
    transform: [{ rotate: "-20deg" }],
    borderRadius: 2,
  },
  shortAnswerPrefixRow: {
    alignSelf: "center",
    marginBottom: 8,
  },
  shortAnswerPrefixText: {
    fontFamily: "Menlo",
    fontSize: 20,
    color: "#222",
    fontWeight: "700",
  },
  continueContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  continueButton: {
    backgroundColor: "#1CB0F6",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 999,
    borderBottomWidth: 3,
    borderBottomColor: "#1899D6",
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    width: "100%",
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#222222",
    marginBottom: 18,
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalPrimaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: "#1CB0F6",
    borderWidth: 2,
    borderColor: "#1899D6",
    marginRight: 8,
  },
  modalPrimaryText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  modalSecondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalSecondaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#777777",
  },
  resultSheetContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  resultSheet: {
    width: "100%",
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: "#58CC02",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  resultSheetText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  resultSheetButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultSheetRedoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  resultSheetRedoText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  resultSheetError: {
    backgroundColor: "#FF4B4B",
  },
  resultSheetContinueButton: {
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  resultSheetContinueText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E8E0D",
  },
});

