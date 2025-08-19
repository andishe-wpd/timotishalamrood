/**
 * @author Hasani
 * @version 0.1.0
 */
import React from "react";
import "./Menu.css";
import PropTypes from "prop-types";

export class Menu extends React.PureComponent {
  render() {
    const { level, isCompleted, hasNextLevel, onRestart, onNextLevel } =
      this.props;
    return (
      <div className="menu">
        <div className="level">Level {level + 1}</div>
        <div className="buttons">
          <button
            className="button"
            disabled={!isCompleted || !hasNextLevel}
            onClick={onNextLevel}
          >
            <i className="i-next" />
          </button>
          <button className="button" onClick={onRestart}>
            <i className="i-restart" />
          </button>
        </div>
      </div>
    );
  }
}

Menu.propTypes = {
  level: PropTypes.number.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  hasNextLevel: PropTypes.bool.isRequired,
  onRestart: PropTypes.func.isRequired,
  onNextLevel: PropTypes.func.isRequired,
};
