/**
 * @author Hasani
 * @version 0.1.0
 */
import React from "react";
import { CELL_SIZE, COLORS, CELL_SHAPES } from "../../constants";
import "./Cell.css";
import PropTypes from "prop-types";

export class Cell extends React.PureComponent {
  render() {
    const { type, rotate, active, onClick } = this.props;
    return (
      <div
        className="cell"
        style={{ width: CELL_SIZE, height: CELL_SIZE, cursor: "pointer" }}
        onClick={onClick}
      >
        <svg width="100%" height="100%" viewBox="0 0 400 400">
          <path
            transform={rotate ? `rotate(${rotate * 90} 200 200)` : null}
            d={CELL_SHAPES[type]}
            fill={active ? COLORS.fill.active : COLORS.fill.inactive}
            stroke={active ? COLORS.stroke.active : COLORS.stroke.inactive}
            strokeWidth="16"
          />
        </svg>
      </div>
    );
  }
}

Cell.propTypes = {
  type: PropTypes.oneOf(["I", "L", "T", "P", "C"]).isRequired,
  rotate: PropTypes.oneOf([0, 1, 2, 3]).isRequired,
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};
