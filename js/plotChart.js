class plotChart {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = [];
        this.selectedGenres = new Set(); // Changed to Set for multiple selections
        this.yearRange = null;
        this.isInitialized = false; // Track if charts have been initialized

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Extract unique genres
        vis.extractGenres();
        // Setup main chart
        vis.initMainChart();

        // Setup dropdown menu
        vis.DropdownMenu = new DropdownMenu(vis.parentElement, vis.data, vis.genres, vis.selectedGenres, vis.isInitialized, vis.wrangleData);
        vis.DropdownMenu.initVis();

        // Initial data processing - show all movies by default
        vis.wrangleData();

        // Add window resize listener
        window.addEventListener('resize', function () {
            vis.handleResize();
        });
    }

    handleResize() {
        let vis = this;

        // Recalculate dimensions
        let container = document.getElementById("main-chart");
        if (container) {
            let containerWidth = container.getBoundingClientRect().width;
            let containerHeight = container.getBoundingClientRect().height;

            vis.width = containerWidth - vis.margin.left - vis.margin.right;
            vis.height = Math.max(containerHeight - vis.margin.top - vis.margin.bottom, 300);

            // Update SVG dimensions
            vis.svg
                .attr("width", vis.width + vis.margin.left + vis.margin.right)
                .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

            // Update scales
            vis.xScale.range([0, vis.width]);
            vis.yScale.range([vis.height, 0]);

            // Update axes
            vis.xAxisGroup.attr("transform", `translate(0, ${vis.height})`);
            vis.yAxisGroup.attr("transform", `translate(${vis.margin.left}, 0)`);

            // Redraw
            vis.updateVis();
        }
    }

    extractGenres() {
        let vis = this;
        let genreSet = new Set();

        vis.data.forEach(d => {
            if (d.Genre) {
                d.Genre.split(',').forEach(genre => {
                    genreSet.add(genre.trim());
                });
            }
        });

        vis.genres = Array.from(genreSet).sort();

        // Initialize with all genres selected
        vis.genres.forEach(genre => vis.selectedGenres.add(genre));
    }

    initMainChart() {
        let vis = this;

        // Main chart dimensions
        vis.margin = { top: 20, right: 40, bottom: 40, left: 40 };

        // Get the actual dimensions of the container
        let container = document.getElementById("main-chart");
        let containerWidth = container ? container.getBoundingClientRect().width : 1400;
        let containerHeight = container ? container.getBoundingClientRect().height : 500;

        // Use the full container dimensions minus margins
        vis.width = containerWidth - vis.margin.left - vis.margin.right;
        vis.height = Math.max(containerHeight - vis.margin.top - vis.margin.bottom, 300);

        // Create main SVG
        vis.svg = d3.select("#main-chart")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        // Scales
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);
        
        vis.rScale = d3.scaleLinear()
            .domain(d3.extent(vis.data, d => d.IMDB_Rating))
            .range([4, 10]);

        // Axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickFormat(d3.format("d"));

        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickFormat(d => `$${d / 1000000}M`);


        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "axis y-axis")
            .attr("transform", `translate(${vis.margin.left}, 0)`);

        // Axis labels
        vis.svg.append("text")
            .attr("class", "axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 40)
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "500")
            .style("fill", "#cccccc")
            .text("Release Year");

        vis.svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height / 2)
            .attr("y", -20)
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "500")
            .style("fill", "#cccccc")
            .text("Gross Revenue");
    }





    // Method to handle year range updates from Timeline
    updateYearRange(yearRange) {
        let vis = this;
        vis.yearRange = yearRange;
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Filter by selected genres
        if (vis.selectedGenres.size === 0) {
            vis.displayData = [];
        } else {
            vis.displayData = vis.data.filter(d => {
                if (!d.Genre) return false;
                let movieGenres = d.Genre.split(',').map(g => g.trim());
                return movieGenres.some(genre => vis.selectedGenres.has(genre));
            });
        }

        // Filter by year range if brush is active
        if (vis.yearRange) {
            vis.displayData = vis.displayData.filter(d =>
                d.Released_Year >= vis.yearRange[0] && d.Released_Year <= vis.yearRange[1]
            );
        }

        // Mark as initialized after first data processing
        vis.isInitialized = true;
        // Sort by IMDB_Rating descending
        vis.displayData.sort((a, b) => b.IMDB_Rating - a.IMDB_Rating);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        if (vis.displayData.length === 0) {
            vis.svg.selectAll(".dot").remove();
            return;
        }

        // Update scales based on brush selection
        if (vis.yearRange) {
            // If brush is active, show only selected range
            vis.xScale.domain([
                vis.yearRange[0] - 1,
                vis.yearRange[1] + 1
            ]);
        } else {
            // Default: show entire time range
            vis.xScale.domain([
                d3.min(vis.data, d => d.Released_Year) - 2,
                d3.max(vis.data, d => d.Released_Year) + 2
            ]);
        }

        vis.yScale.domain([
            0,
            d3.max(vis.data, d => d.Gross) * 1.1
        ]);

        // Update axes
        vis.xAxisGroup.call(vis.xAxis);
        vis.yAxisGroup.call(vis.yAxis);

        // Bind data to circles
        let circles = vis.svg.selectAll(".dot")
            .data(vis.displayData, d => d.Series_Title);

        // Exit
        circles.exit()
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();

        // Enter
        let enterCircles = circles.enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => vis.xScale(d.Released_Year))
            .attr("cy", d => vis.yScale(d.Gross))
            .attr("r", d => vis.rScale(d.IMDB_Rating)) // Use rScale for radius based on IMDB_Rating
            .attr("opacity", 0);

        // Merge and update
        enterCircles.merge(circles)
            .on("mouseover", function (event, d) {
                d3.select("#tooltip")
                    .classed("visible", true)
                    .html(`
                        <strong>${d.Series_Title}</strong><br/>
                        Year: ${d.Released_Year}<br/>
                        IMDB: ${d.IMDB_Rating}/10<br/>
                        Gross: $${(d.Gross / 1000000).toFixed(1)}M<br/>
                        Genre: ${d.Genre}<br/>
                        Director: ${d.Director}
                    `)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");

                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", d => vis.rScale(d.IMDB_Rating))
                    .style("stroke", "#e50914")
                    .style("stroke-width", "2px");
            })
            .on("mouseout", function () {
                d3.select("#tooltip").classed("visible", false);

                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", d => vis.rScale(d.IMDB_Rating))
                    .style("stroke", "#ffffff");
            })
            .attr("cx", d => vis.xScale(d.Released_Year))
            .attr("cy", d => vis.yScale(d.Gross))
            .attr("r", d => vis.rScale(d.IMDB_Rating))
            .attr("opacity", 0.8);
    }
}