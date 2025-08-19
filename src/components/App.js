/**
 * @author Hasani
 * @version 0.1.0
 */
import React from "react";
import "./App.css";
import { Menu } from "./menu/Menu";
import { Board } from "./board/Board";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.levels = this.props.levels;
    this.state = { ...this.levels[0], level: 0 };
  }

  componentDidMount() {
    this.calculateWaterFlow();
  }

  // Initialize the current level with water flow calculation
  initializeLevel = () => {
    this.calculateWaterFlow();
  };

  // Calculate which cells have water flow based on pipe connections
  calculateWaterFlow = () => {
    const { rows, cols, source, cells } = this.state;
    const visited = new Array(cells.length).fill(false);
    const newCells = cells.map((cell) => ({ ...cell, active: false }));

    // Start from source
    this.dfs(source, visited, newCells, rows, cols);

    this.setState({ cells: newCells });
  };

  // Get pipe connections based on type and rotation
  getPipeConnections = (type, rotate, cellIndex) => {
    // Based on SVG paths analysis:
    // I: "m162-8v416h76v-416" - vertical line (top-bottom)
    // L: "m162-8v246h246v-76h-170v-170z" - corner from top to right
    // T: "m-8 162v76h170v170h76v-170h170v-76h-246z" - T-junction with top, left, right (NO bottom)
    //    The T shape has: top stem, left arm, right arm
    //    But the SVG path suggests the connections might be: bottom, left, right when rotate=0
    // P: "m162-8v170h-170v76h170v170h76v-170h170v-76h-170v-170z" - cross with all directions
    // C: "m162-8v99.6a115 115 0 0 0-77 108 115 115 0 0 0 115 115 115 115 0 0 0 115-115 115 115 0 0 0-77-108v-99.6z" - endpoint

    const connections = {
      I: [0, 2], // top-bottom when rotate=0
      L: [0, 1], // top-right when rotate=0
      T: [2, 1, 3], // bottom-right-left when rotate=0 (T shape, NO top)
      P: [0, 1, 2, 3], // all directions
      C: cellIndex === this.state.source ? [0] : [], // source C can connect, others have NO connections
    };

    const baseConnections = connections[type] || [];

    // Apply rotation - each rotation is 90 degrees clockwise
    return baseConnections.map((direction) => (direction + rotate) % 4);
  };

  // Get C type opening direction based on rotation
  getCOpeningDirection = (rotate) => {
    // C type has one opening that rotates with the pipe
    return rotate; // 0=top, 1=right, 2=bottom, 3=left
  };

  // Check if two adjacent cells are connected
  areConnected = (cellIndex1, cellIndex2, cells, rows, cols) => {
    const cell1 = cells[cellIndex1];
    const cell2 = cells[cellIndex2];

    if (!cell1 || !cell2) return false;

    const connections1 = this.getPipeConnections(
      cell1.type,
      cell1.rotate,
      cellIndex1
    );
    const connections2 = this.getPipeConnections(
      cell2.type,
      cell2.rotate,
      cellIndex2
    );

    // Get direction from cell1 to cell2
    const row1 = Math.floor(cellIndex1 / cols);
    const col1 = cellIndex1 % cols;
    const row2 = Math.floor(cellIndex2 / cols);
    const col2 = cellIndex2 % cols;

    let direction1to2, direction2to1;

    if (row2 === row1 - 1) {
      direction1to2 = 0;
      direction2to1 = 2;
    } // up
    else if (col2 === col1 + 1) {
      direction1to2 = 1;
      direction2to1 = 3;
    } // right
    else if (row2 === row1 + 1) {
      direction1to2 = 2;
      direction2to1 = 0;
    } // down
    else if (col2 === col1 - 1) {
      direction1to2 = 3;
      direction2to1 = 1;
    } // left
    else return false;

    // Check if cell1 has connection in direction to cell2
    const cell1HasConnection = connections1.includes(direction1to2);

    // Check if cell2 has connection in direction to cell1
    const cell2HasConnection = connections2.includes(direction2to1);

    // For C cells (endpoints), they can receive water from their specific opening direction
    if (cell2.type === "C" && cellIndex2 !== this.state.source) {
      // cell2 is a receiver C, check if it has opening in the right direction
      const cOpeningDirection = this.getCOpeningDirection(cell2.rotate);
      return cell1HasConnection && cOpeningDirection === direction2to1;
    }

    // If cell1 is a C type, check if it has opening in the right direction
    if (cell1.type === "C" && cellIndex1 !== this.state.source) {
      // cell1 is a receiver C, check if it has opening in the right direction
      const cOpeningDirection = this.getCOpeningDirection(cell1.rotate);
      return cell2HasConnection && cOpeningDirection === direction1to2;
    }

    // For regular pipes, both need to have matching connections
    return cell1HasConnection && cell2HasConnection;
  };

  // DFS to find all connected cells from source
  dfs = (cellIndex, visited, cells, rows, cols) => {
    if (visited[cellIndex]) return;

    visited[cellIndex] = true;
    cells[cellIndex].active = true;

    // Check all adjacent cells
    const row = Math.floor(cellIndex / cols);
    const col = cellIndex % cols;

    const neighbors = [
      { row: row - 1, col: col }, // up
      { row: row, col: col + 1 }, // right
      { row: row + 1, col: col }, // down
      { row: row, col: col - 1 }, // left
    ];

    neighbors.forEach((neighbor) => {
      if (
        neighbor.row >= 0 &&
        neighbor.row < rows &&
        neighbor.col >= 0 &&
        neighbor.col < cols
      ) {
        const neighborIndex = neighbor.row * cols + neighbor.col;

        if (
          !visited[neighborIndex] &&
          this.areConnected(cellIndex, neighborIndex, cells, rows, cols)
        ) {
          this.dfs(neighborIndex, visited, cells, rows, cols);
        }
      }
    });
  };

  // Handle cell click to rotate pipe
  handleCellClick = (cellIndex) => {
    const newCells = [...this.state.cells];
    newCells[cellIndex].rotate = (newCells[cellIndex].rotate + 1) % 4;

    this.setState({ cells: newCells }, () => {
      this.calculateWaterFlow();
    });
  };

  // Check if current level is completed
  isLevelCompleted = () => {
    // Level is completed when ALL cells are active (have water flow)
    // AND all pipe openings are connected (no water waste)
    const allCellsActive = this.state.cells.every((cell) => cell.active);
    const allOpeningsConnected = this.checkAllOpeningsConnected();

    // Debug: log the completion check details
    console.log("Level completion check:", {
      level: this.state.level,
      totalCells: this.state.cells.length,
      activeCells: this.state.cells.filter((cell) => cell.active).length,
      allCellsActive,
      allOpeningsConnected,
      isCompleted: allCellsActive && allOpeningsConnected,
      cells: this.state.cells.map((cell, index) => ({
        index,
        type: cell.type,
        rotate: cell.rotate,
        active: cell.active,
      })),
    });

    return allCellsActive && allOpeningsConnected;
  };

  // Restart current level
  handleRestart = () => {
    const levelData = this.levels[this.state.level];
    this.setState(
      {
        ...levelData,
        level: this.state.level,
      },
      () => {
        this.calculateWaterFlow();
      }
    );
  };

  // Go to next level
  handleNextLevel = () => {
    const nextLevel = this.state.level + 1;
    if (nextLevel < this.levels.length) {
      const levelData = this.levels[nextLevel];
      this.setState(
        {
          ...levelData,
          level: nextLevel,
        },
        () => {
          this.calculateWaterFlow();
        }
      );
    }
  };

  // Check if all pipe openings are connected (no water waste)
  checkAllOpeningsConnected = () => {
    const { rows, cols, cells } = this.state;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const connections = this.getPipeConnections(cell.type, cell.rotate, i);

      // Skip C type endpoints - they don't need to have all openings connected
      if (cell.type === "C" && i !== this.state.source) {
        continue;
      }

      // Check each connection of this cell
      for (const direction of connections) {
        const row = Math.floor(i / cols);
        const col = i % cols;

        let neighborRow, neighborCol;

        // Get neighbor coordinates based on direction
        switch (direction) {
          case 0: // up
            neighborRow = row - 1;
            neighborCol = col;
            break;
          case 1: // right
            neighborRow = row;
            neighborCol = col + 1;
            break;
          case 2: // down
            neighborRow = row + 1;
            neighborCol = col;
            break;
          case 3: // left
            neighborRow = row;
            neighborCol = col - 1;
            break;
          default:
            continue;
        }

        // Check if neighbor is within bounds
        if (
          neighborRow < 0 ||
          neighborRow >= rows ||
          neighborCol < 0 ||
          neighborCol >= cols
        ) {
          // Opening points outside the grid - this is water waste
          console.log("Opening points outside grid:", {
            cellIndex: i,
            cellType: cell.type,
            direction,
            neighborRow,
            neighborCol,
            rows,
            cols,
          });
          return false;
        }

        const neighborIndex = neighborRow * cols + neighborCol;
        const neighbor = cells[neighborIndex];

        if (!neighbor) {
          console.log("No neighbor found:", {
            cellIndex: i,
            neighborIndex,
            direction,
          });
          return false;
        }

        // Check if neighbor has a matching connection back to this cell
        const neighborConnections = this.getPipeConnections(
          neighbor.type,
          neighbor.rotate,
          neighborIndex
        );
        const oppositeDirection = (direction + 2) % 4; // opposite direction

        // For C type neighbors, check if they have the right opening direction
        if (neighbor.type === "C" && neighborIndex !== this.state.source) {
          const cOpeningDirection = this.getCOpeningDirection(neighbor.rotate);
          if (cOpeningDirection !== oppositeDirection) {
            console.log("C endpoint opening mismatch:", {
              cellIndex: i,
              cellType: cell.type,
              direction,
              neighborIndex,
              neighborType: neighbor.type,
              neighborRotate: neighbor.rotate,
              cOpeningDirection,
              oppositeDirection,
            });
            return false;
          }
        } else if (!neighborConnections.includes(oppositeDirection)) {
          // This opening is not connected to anything - water waste
          console.log("Opening not connected:", {
            cellIndex: i,
            cellType: cell.type,
            cellRotate: cell.rotate,
            direction,
            neighborIndex,
            neighborType: neighbor.type,
            neighborRotate: neighbor.rotate,
            neighborConnections,
            oppositeDirection,
          });
          return false;
        }
      }
    }

    return true;
  };

  render() {
    const isCompleted = this.isLevelCompleted();
    const hasNextLevel = this.state.level < this.levels.length - 1;

    // Debug: log button state
    console.log("Button state:", {
      level: this.state.level,
      totalLevels: this.levels.length,
      isCompleted,
      hasNextLevel,
      buttonDisabled: !isCompleted || !hasNextLevel,
      canGoToNextLevel: isCompleted && hasNextLevel,
    });

    return (
      <div className="game-container">
        <div className="game">
          <Menu
            level={this.state.level}
            isCompleted={isCompleted}
            hasNextLevel={hasNextLevel}
            onRestart={this.handleRestart}
            onNextLevel={this.handleNextLevel}
          />
          <Board
            rows={this.state.rows}
            cols={this.state.cols}
            cells={this.state.cells}
            onCellClick={this.handleCellClick}
          />
        </div>
      </div>
    );
  }
}

export default App;
