import React from 'react';
import {configure, mount, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import App from '../components/App.js';
import {levels} from "../levels";

configure({adapter: new Adapter()});

expect.extend({
    toBeDisabled(button) {
        const pass = button.getDOMNode().disabled === true;
        return {
            pass,
            message: () => pass ? 'Button expected to be enabled, but is disabled!' : 'Button expected to be disabled, but is enabled!',
        };
    },
});

function initialize() {
    const app = mount(<App levels={JSON.parse(JSON.stringify(levels))}/>);
    const buttons = app.find('Menu button');
    const next_button = buttons.first();
    const restart_button = buttons.last();
    const cells = app.find('Board Cell');
    return {app, buttons, restart_button, next_button, cells};
}

function normalizeState(state) {
    let cells = [];
    for (let c of state.cells) {
        cells.push({
            type: c.type,
            rotate: c.rotate,
            active: c.hasOwnProperty('active') ? c.active : false
        });
    }
    return {
        rows: state.rows,
        cols: state.cols,
        source: state.source,
        level: state.level,
        cells: cells
    };
}


test('sample test: initial render', () => {
    const {app, buttons, restart_button, next_button} = initialize();

    expect(app.find('Menu .level').text()).toBe('Level 1');

    expect(normalizeState(app.state())).toMatchSnapshot();

    expect(buttons).toHaveLength(2);
    expect(next_button).toBeDisabled();
    expect(restart_button).not.toBeDisabled();
});


test('sample test: clicking on cells', () => {
    const {app, cells} = initialize();

    for (let i of [
        8, 5, 5, 5, 8, 1, 6, 3, 8, 6, 8, 0, 0, 0, 0, 0
    ]) {
        cells.at(i).simulate('click');
        expect(normalizeState(app.state())).toMatchSnapshot();
    }
});
