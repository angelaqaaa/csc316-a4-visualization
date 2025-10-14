let myChart;

// We will load the data asynchronously using a promise
d3.csv("data/your-data-file.csv").then(data => {

    // Data processing, e.g., converting strings to numbers
    data.forEach(d => {
        // d.someValue = +d.someValue; // Example
    });

    console.log("Data loaded:", data);

    // Create a new instance of our chart
    myChart = new InteractiveChart('#vis-container', data);

}).catch(error => {
    console.error("Error loading the data:", error);
});