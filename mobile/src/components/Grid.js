// Grid.js - Premium Scholar grid with swipe handling

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import Cell from './Cell';
import { colors } from '../styles/colors';
import { GRID_SIZE, isAdjacent, getDirection, isSameDirection } from '../utils/puzzle';

const GRID_PADDING = 10;
const CELL_MARGIN = 1; // Reduced from 2 for tighter grid

function calculateGridDimensions(screenWidth) {
  // Use 90% of screen width, with max of 480px
  const gridWidth = Math.min(screenWidth * 0.9, 480);
  const cellSize = (gridWidth - (GRID_PADDING * 2) - (GRID_SIZE * CELL_MARGIN * 2)) / GRID_SIZE;
  return { gridWidth, cellSize };
}

export default function Grid({
  grid,
  selectedCells,
  foundCells,
  hintCells = [],
  onSelectionChange,
  onSelectionEnd,
}) {
  const gridRef = useRef(null);
  const [gridLayout, setGridLayout] = useState(null);
  const currentSelectionRef = useRef([]);
  const currentDirectionRef = useRef(null);
  const isDraggingRef = useRef(false);
  const isTapModeRef = useRef(false); // Track if user is in tap-to-select mode

  // Calculate cell size based on screen width, with rotation support
  const [dimensions, setDimensions] = useState(() =>
    calculateGridDimensions(Dimensions.get('window').width)
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(calculateGridDimensions(window.width));
      // Reset grid layout to force recalculation
      setGridLayout(null);
    });
    return () => subscription?.remove();
  }, []);

  const { gridWidth, cellSize } = dimensions;

  const getCellFromPosition = useCallback((clientX, clientY) => {
    if (!gridLayout) return null;

    const relX = clientX - gridLayout.x - GRID_PADDING;
    const relY = clientY - gridLayout.y - GRID_PADDING;

    const cellTotalSize = cellSize + (CELL_MARGIN * 2);

    // Calculate which cell the touch is over (basic grid lookup)
    const col = Math.floor(relX / cellTotalSize);
    const row = Math.floor(relY / cellTotalSize);

    // For better diagonal swiping, use distance-from-center detection
    // with a very forgiving radius
    const hitRadius = cellTotalSize * 0.85; // 85% of cell size for generous hit area

    // Check the touched cell and its neighbors for closest center
    let bestCell = null;
    let bestDistance = hitRadius;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const checkCol = col + dx;
        const checkRow = row + dy;

        if (checkCol >= 0 && checkCol < GRID_SIZE && checkRow >= 0 && checkRow < GRID_SIZE) {
          // Calculate center of this cell
          const centerX = checkCol * cellTotalSize + cellTotalSize / 2;
          const centerY = checkRow * cellTotalSize + cellTotalSize / 2;

          // Distance from touch to cell center
          const distance = Math.sqrt(
            Math.pow(relX - centerX, 2) + Math.pow(relY - centerY, 2)
          );

          if (distance < bestDistance) {
            bestDistance = distance;
            bestCell = { x: checkCol, y: checkRow };
          }
        }
      }
    }

    return bestCell;
  }, [cellSize, gridLayout]);

  const isCellSelected = useCallback((x, y) => {
    return selectedCells.some(s => s.x === x && s.y === y);
  }, [selectedCells]);

  const isCellFound = useCallback((x, y) => {
    return foundCells.some(f => f.x === x && f.y === y);
  }, [foundCells]);

  const getFoundColorIndex = useCallback((x, y) => {
    const found = foundCells.find(f => f.x === x && f.y === y);
    return found ? (found.wordIndex ?? 0) : 0;
  }, [foundCells]);

  const isCellHint = useCallback((x, y) => {
    return hintCells.some(h => h.x === x && h.y === y);
  }, [hintCells]);

  const startPositionRef = useRef({ x: 0, y: 0 });
  const startCellRef = useRef(null); // Track starting cell for line-based selection
  const hasDraggedRef = useRef(false);
  const DRAG_THRESHOLD = 10; // pixels to consider as drag vs tap

  // Calculate swipe angle and snap to one of 8 directions
  const getSwipeDirection = useCallback((dx, dy) => {
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 5) return null; // Too small to determine direction

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    // Normalize angle to 0-360
    const normalizedAngle = (angle + 360) % 360;

    // Map angles to 8 directions with 45-degree sectors
    if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) return { dx: 1, dy: 0 };   // Right
    if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) return { dx: 1, dy: 1 };    // Down-Right
    if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) return { dx: 0, dy: 1 };   // Down
    if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) return { dx: -1, dy: 1 }; // Down-Left
    if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) return { dx: -1, dy: 0 }; // Left
    if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) return { dx: -1, dy: -1 };// Up-Left
    if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) return { dx: 0, dy: -1 }; // Up
    if (normalizedAngle >= 292.5 && normalizedAngle < 337.5) return { dx: 1, dy: -1 }; // Up-Right
    return null;
  }, []);

  // Get all cells along a line from start cell in a given direction up to a distance
  const getCellsAlongLine = useCallback((startCell, direction, pixelDistance) => {
    if (!startCell) return [];
    if (!direction) return [startCell];

    const cells = [startCell];
    let currentX = startCell.x;
    let currentY = startCell.y;

    // Calculate how many cells to include based on pixel distance
    const cellTotalSize = cellSize + (CELL_MARGIN * 2);
    // For diagonal, each cell is sqrt(2) * cellTotalSize away in pixel terms
    const isDiagonal = direction.dx !== 0 && direction.dy !== 0;
    const cellPixelDistance = isDiagonal ? cellTotalSize * Math.SQRT2 : cellTotalSize;

    // Number of cells based on how far user has dragged
    const numCells = Math.max(1, Math.round(pixelDistance / cellPixelDistance) + 1);

    for (let i = 1; i < numCells; i++) {
      currentX += direction.dx;
      currentY += direction.dy;

      // Check bounds
      if (currentX < 0 || currentX >= GRID_SIZE || currentY < 0 || currentY >= GRID_SIZE) {
        break;
      }

      cells.push({ x: currentX, y: currentY });
    }

    return cells;
  }, [cellSize]);

  const tryAddCell = useCallback((cell, selection) => {
    if (selection.length === 0) {
      return { success: true, newSelection: [cell], newDirection: null };
    }

    const lastCell = selection[selection.length - 1];
    if (!isAdjacent(lastCell, cell)) {
      return { success: false };
    }

    const newDirection = getDirection(lastCell, cell);

    // If direction not established yet, allow it
    if (currentDirectionRef.current === null) {
      return { success: true, newSelection: [...selection, cell], newDirection };
    }

    // If direction matches, allow it
    if (isSameDirection(currentDirectionRef.current, newDirection)) {
      return { success: true, newSelection: [...selection, cell], newDirection: currentDirectionRef.current };
    }

    return { success: false };
  }, []);

  const handleTap = useCallback((cell) => {
    const selection = currentSelectionRef.current;

    // Check if tapping on already selected cell
    const existingIndex = selection.findIndex(s => s.x === cell.x && s.y === cell.y);

    if (existingIndex !== -1) {
      if (existingIndex === selection.length - 1) {
        // Tapped on last cell - submit selection
        isTapModeRef.current = false;
        onSelectionEnd(selection);
        currentSelectionRef.current = [];
        currentDirectionRef.current = null;
        onSelectionChange([]);
      } else {
        // Tapped on earlier cell - truncate selection
        const newSelection = selection.slice(0, existingIndex + 1);
        currentSelectionRef.current = newSelection;
        if (newSelection.length === 1) {
          currentDirectionRef.current = null;
        }
        onSelectionChange(newSelection);
      }
      return;
    }

    // Try to add this cell to selection
    const result = tryAddCell(cell, selection);

    if (result.success) {
      currentSelectionRef.current = result.newSelection;
      currentDirectionRef.current = result.newDirection;
      isTapModeRef.current = true;
      onSelectionChange(result.newSelection);
    } else if (selection.length > 0) {
      // Can't add cell - submit current selection and start new one
      onSelectionEnd(selection);
      currentSelectionRef.current = [cell];
      currentDirectionRef.current = null;
      isTapModeRef.current = true;
      onSelectionChange([cell]);
    } else {
      // Start new selection
      currentSelectionRef.current = [cell];
      currentDirectionRef.current = null;
      isTapModeRef.current = true;
      onSelectionChange([cell]);
    }
  }, [onSelectionChange, onSelectionEnd, tryAddCell]);

  const handleStart = useCallback((clientX, clientY) => {
    const cell = getCellFromPosition(clientX, clientY);
    startPositionRef.current = { x: clientX, y: clientY };
    hasDraggedRef.current = false;

    if (cell) {
      // If in tap mode with existing selection, don't reset yet
      if (isTapModeRef.current && currentSelectionRef.current.length > 0) {
        isDraggingRef.current = true;
        startCellRef.current = null; // Don't track start cell in tap mode
        return;
      }

      isDraggingRef.current = true;
      startCellRef.current = cell; // Store starting cell for line-based selection
      currentSelectionRef.current = [cell];
      currentDirectionRef.current = null;
      onSelectionChange([cell]);
    }
  }, [getCellFromPosition, onSelectionChange]);

  const handleMove = useCallback((clientX, clientY) => {
    if (!isDraggingRef.current) return;

    // Check if we've dragged enough to switch from tap to drag mode
    const dx = clientX - startPositionRef.current.x;
    const dy = clientY - startPositionRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > DRAG_THRESHOLD) {
      hasDraggedRef.current = true;
      isTapModeRef.current = false; // Switch to drag mode
    }

    if (!hasDraggedRef.current) return; // Don't update selection until drag threshold met

    // Use line-based selection from start cell
    const startCell = startCellRef.current;
    if (!startCell) return;

    // Get direction from start position to current touch
    const direction = getSwipeDirection(dx, dy);

    if (!direction) {
      // No clear direction yet, just show start cell
      if (currentSelectionRef.current.length !== 1 ||
          currentSelectionRef.current[0].x !== startCell.x ||
          currentSelectionRef.current[0].y !== startCell.y) {
        currentSelectionRef.current = [startCell];
        currentDirectionRef.current = null;
        onSelectionChange([startCell]);
      }
      return;
    }

    // Get all cells along the line from start cell in the snapped direction
    const newSelection = getCellsAlongLine(startCell, direction, distance);
    currentDirectionRef.current = direction;

    // Only update if selection changed
    const selectionChanged =
      newSelection.length !== currentSelectionRef.current.length ||
      newSelection.some((cell, i) =>
        currentSelectionRef.current[i]?.x !== cell.x ||
        currentSelectionRef.current[i]?.y !== cell.y
      );

    if (selectionChanged) {
      currentSelectionRef.current = newSelection;
      onSelectionChange(newSelection);
    }
  }, [onSelectionChange, getSwipeDirection, getCellsAlongLine]);

  const handleEnd = useCallback((clientX, clientY) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // If we didn't drag much, treat as a tap
    if (!hasDraggedRef.current) {
      const cell = getCellFromPosition(clientX, clientY);
      if (cell) {
        handleTap(cell);
      }
      return;
    }

    // Drag ended - submit selection
    isTapModeRef.current = false;
    startCellRef.current = null;
    onSelectionEnd(currentSelectionRef.current);
    currentSelectionRef.current = [];
    currentDirectionRef.current = null;
  }, [getCellFromPosition, handleTap, onSelectionEnd]);

  // Track last touch position for touchEnd
  const lastTouchRef = useRef({ x: 0, y: 0 });

  // Touch event handlers
  const onTouchStart = useCallback((e) => {
    const touch = e.nativeEvent.touches[0];
    lastTouchRef.current = { x: touch.pageX, y: touch.pageY };
    handleStart(touch.pageX, touch.pageY);
  }, [handleStart]);

  const onTouchMove = useCallback((e) => {
    const touch = e.nativeEvent.touches[0];
    lastTouchRef.current = { x: touch.pageX, y: touch.pageY };
    handleMove(touch.pageX, touch.pageY);
  }, [handleMove]);

  const onTouchEnd = useCallback(() => {
    handleEnd(lastTouchRef.current.x, lastTouchRef.current.y);
  }, [handleEnd]);

  // Mouse event handlers for web
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e) => {
    lastMouseRef.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    handleStart(e.nativeEvent.pageX, e.nativeEvent.pageY);
  }, [handleStart]);

  const onMouseMove = useCallback((e) => {
    lastMouseRef.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    handleMove(e.nativeEvent.pageX, e.nativeEvent.pageY);
  }, [handleMove]);

  const onMouseUp = useCallback(() => {
    handleEnd(lastMouseRef.current.x, lastMouseRef.current.y);
  }, [handleEnd]);

  const onMouseLeave = useCallback(() => {
    // On mouse leave, just clear selection without submitting
    if (isDraggingRef.current && !isTapModeRef.current) {
      isDraggingRef.current = false;
      startCellRef.current = null;
      currentSelectionRef.current = [];
      currentDirectionRef.current = null;
      onSelectionChange([]);
    }
  }, [onSelectionChange]);

  const handleLayout = useCallback(() => {
    if (Platform.OS === 'web' && gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      setGridLayout({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
    } else if (gridRef.current) {
      // Use measure() to get absolute screen coordinates on native
      gridRef.current.measure((x, y, width, height, pageX, pageY) => {
        setGridLayout({ x: pageX, y: pageY, width, height });
      });
    }
  }, []);

  return (
    <View
      ref={gridRef}
      style={[styles.gridContainer, { width: gridWidth }]}
      onLayout={handleLayout}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={Platform.OS === 'web' ? onMouseDown : undefined}
      onMouseMove={Platform.OS === 'web' ? onMouseMove : undefined}
      onMouseUp={Platform.OS === 'web' ? onMouseUp : undefined}
      onMouseLeave={Platform.OS === 'web' ? onMouseLeave : undefined}
    >
      <View style={styles.grid}>
        {grid.map((row, y) => (
          <View key={y} style={styles.row}>
            {row.map((letter, x) => (
              <Cell
                key={`${x}-${y}`}
                letter={letter}
                isSelected={isCellSelected(x, y)}
                isFound={isCellFound(x, y)}
                isHint={isCellHint(x, y)}
                foundColorIndex={getFoundColorIndex(x, y)}
                cellSize={cellSize}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: GRID_PADDING,
    alignSelf: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    userSelect: 'none',
  },
  grid: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
});
