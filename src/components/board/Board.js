/**
 * @author Hasani
 * @version 0.1.0
 */
import React from "react";
import { Cell } from "./Cell";
import { CELL_SIZE } from "../../constants";
import "./Board.css";
import PropTypes from "prop-types";

export class Board extends React.PureComponent {
  render() {
    const { rows, cols, cells, onCellClick } = this.props;
    return (
      <div
        className="board"
        style={{ width: cols * CELL_SIZE, height: rows * CELL_SIZE }}
      >
        {cells.map((cell, index) => (
          <Cell
            key={index}
            type={cell.type}
            rotate={cell.rotate}
            active={cell.active}
            onClick={() => onCellClick(index)}
          />
        ))}
      </div>
    );
  }
}

Board.propTypes = {
  rows: PropTypes.number.isRequired,
  cols: PropTypes.number.isRequired,
  cells: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(["I", "L", "T", "P", "C"]).isRequired,
      rotate: PropTypes.oneOf([0, 1, 2, 3]).isRequired,
      active: PropTypes.bool.isRequired,
    })
  ),
  onCellClick: PropTypes.func.isRequired,
};
