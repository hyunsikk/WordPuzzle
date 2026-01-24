// Grid.js - Ocean Bubbles grid with swipe handling

import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import Cell from './Cell';
import { colors } from '../styles/colors';
import { GRID_SIZE, isAdjacent } from '../utils/puzzle';

const GRID_PADDING = 12;
const GRID_MARGIN = 16;

export default function Grid({
  grid,
  selectedCells,
  foundCells,
  onSelectionChange,
  onSelectionEnd,
}) {
  const gridRef = useRef(null);
  const [gridLayout, setGridLayout] = useState(null);
  const currentSelectionRef = useRef([]);
  const isDraggingRef = useRef(false);

  // Calculate cell size based on screen width
  const screenWidth = Dimensions.get('window').width;
  const gridWidth = Math.min(screenWidth - (GRID_MARGIN * 2), 400);
  const cellSize = (gridWidth - (GRID_PADDING * 2) - (GRID_SIZE * 4)) / GRID_SIZE;

  const getCellFromPosition = useCallback((clientX, clientY) => {
    if (!gridLayout) return null;

    const relX = clientX - gridLayout.x - GRID_PADDING;
    const relY = clientY - gridLayout.y - GRID_PADDING;

    const cellTotalSize = cellSize + 4;
    const col = Math.floor(relX / cellTotalSize);
    const row = Math.floor(relY / cellTotalSize);

    if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
      return { x: col, y: row };
    }
    return null;
  }, [cellSize, gridLayout]);

  const isCellInFoundCells = useCallback((cell) => {
    return foundCells.some(f => f.x === cell.x && f.y === cell.y);
  }, [foundCells]);

  const isCellSelected = useCallback((x, y) => {
    return selectedCells.some(s => s.x === x && s.y === y);
  }, [selectedCells]);

  const isCellFound = useCallback((x, y) => {
    return foundCells.some(f => f.x === x && f.y === y);
  }, [foundCells]);

  const handleStart = useCallback((clientX, clientY) => {
    const cell = getCellFromPosition(clientX, clientY);
    if (cell && !isCellInFoundCells(cell)) {
      isDraggingRef.current = true;
      currentSelectionRef.current = [cell];
      onSelectionChange([cell]);
    }
  }, [getCellFromPosition, isCellInFoundCells, onSelectionChange]);

  const handleMove = useCallback((clientX, clientY) => {
    if (!isDraggingRef.current) return;

    const cell = getCellFromPosition(clientX, clientY);
    if (!cell || isCellInFoundCells(cell)) return;

    const selection = currentSelectionRef.current;
    const existingIndex = selection.findIndex(s => s.x === cell.x && s.y === cell.y);

    if (existingIndex !== -1) {
      if (existingIndex < selection.length - 1) {
        const newSelection = selection.slice(0, existingIndex + 1);
        currentSelectionRef.current = newSelection;
        onSelectionChange(newSelection);
      }
      return;
    }

    if (selection.length > 0) {
      const lastCell = selection[selection.length - 1];
      if (isAdjacent(lastCell, cell)) {
        const newSelection = [...selection, cell];
        currentSelectionRef.current = newSelection;
        onSelectionChange(newSelection);
      }
    }
  }, [getCellFromPosition, isCellInFoundCells, onSelectionChange]);

  const handleEnd = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      onSelectionEnd(currentSelectionRef.current);
      currentSelectionRef.current = [];
    }
  }, [onSelectionEnd]);

  // Touch event handlers
  const onTouchStart = useCallback((e) => {
    const touch = e.nativeEvent.touches[0];
    handleStart(touch.pageX, touch.pageY);
  }, [handleStart]);

  const onTouchMove = useCallback((e) => {
    const touch = e.nativeEvent.touches[0];
    handleMove(touch.pageX, touch.pageY);
  }, [handleMove]);

  const onTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Mouse event handlers for web
  const onMouseDown = useCallback((e) => {
    handleStart(e.nativeEvent.pageX, e.nativeEvent.pageY);
  }, [handleStart]);

  const onMouseMove = useCallback((e) => {
    handleMove(e.nativeEvent.pageX, e.nativeEvent.pageY);
  }, [handleMove]);

  const onMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const onMouseLeave = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleLayout = useCallback((e) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    if (Platform.OS === 'web' && gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      setGridLayout({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
    } else {
      setGridLayout({ x, y, width, height });
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
