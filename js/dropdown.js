class DropdownMenu {
    constructor(_parentElement, _data, _genres, _selectedGenres, _isInitialized, _wrangleData) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.genres = _genres;
        this.selectedGenres = _selectedGenres;
        this.isInitialized = _isInitialized;
        this.wrangleData = _wrangleData;
    }

    initVis() {
        let vis = this;
        let dropdown = d3.select("#genre-dropdown");
        let dropdownText = d3.select("#dropdown-text");

        // Add genre options
        vis.genres.forEach(genre => {
            let listItem = dropdown.append("li");
            let option = listItem.append("div")
                .attr("class", "dropdown-item");

            let formCheck = option.append("div")
                .attr("class", "form-check");

            formCheck.append("input")
                .attr("class", "form-check-input")
                .attr("type", "checkbox")
                .attr("id", `genre-${genre.replace(/\s+/g, '-')}`)
                .attr("value", genre)
                .property("checked", true)
                .on("change", function () {
                    vis.updateGenreSelection();
                });

            formCheck.append("label")
                .attr("class", "form-check-label")
                .attr("for", `genre-${genre.replace(/\s+/g, '-')}`)
                .text(genre);
        });

        // "Select All" functionality
        d3.select("#select-all").on("change", function () {
            let isChecked = this.checked;
            vis.selectedGenres.clear();

            if (isChecked) {
                vis.genres.forEach(genre => vis.selectedGenres.add(genre));
            }

            // Update all checkboxes
            d3.selectAll("#genre-dropdown input[type='checkbox']")
                .property("checked", isChecked);

            vis.updateGenreSelection();
        });

        // Initial trigger to show default "All Genres" selection
        vis.updateGenreSelection();
    }

    updateGenreSelection() {
        let vis = this;
        let dropdownText = d3.select("#dropdown-text");
        let selectAllCheckbox = d3.select("#select-all");

        // Update selected genres set
        vis.selectedGenres.clear();
        d3.selectAll("#genre-dropdown input[type='checkbox']:checked").each(function () {
            if (this.value) { // Skip "select all" option
                vis.selectedGenres.add(this.value);
            }
        });

        // Update dropdown text
        if (vis.selectedGenres.size === vis.genres.length + 1) {
            dropdownText.text("All Movie Genres");
            selectAllCheckbox.property("checked", true);
        } else if (vis.selectedGenres.size === 0) {
            dropdownText.text("No Genres Selected");
            selectAllCheckbox.property("checked", false);
        } else if (vis.selectedGenres.size === 1) {
            dropdownText.text(Array.from(vis.selectedGenres)[0]);
            selectAllCheckbox.property("checked", false);
        } else {
            dropdownText.text(`${vis.selectedGenres.size} Genres Selected`);
            selectAllCheckbox.property("checked", false);
        }

        // Only update charts if already initialized
        if (vis.isInitialized && vis.wrangleData) {
            vis.wrangleData();
        }
    }
}

