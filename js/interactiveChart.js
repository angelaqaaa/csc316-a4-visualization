class InteractiveChart {

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = [];

        this.initVis();
    }

    initVis() {
        let vis = this; // 'this' keyword can be tricky, this pattern makes it easier

        // Your one-time setup code goes here
        // e.g., setting up margins, SVG, scales, and axes
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Data filtering and manipulation goes here

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // The D3 update pattern (enter, update, exit) goes here
    }
}