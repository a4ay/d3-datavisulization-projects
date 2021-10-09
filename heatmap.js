(async function () {
  const response = await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
  );

  const data = await response.json();
  const dataset = data.monthlyVariance;
  dataset.forEach((d) => (d.month -= 1));

  const fontSize = 16;
  const height = 33 * 12;
  const width = 5 * Math.ceil(dataset.length / 12);
  const padding = {
    left: 9 * fontSize,
    right: 9 * fontSize,
    top: 1 * fontSize,
    bottom: 8 * fontSize
  };

  var tip = d3
    .tip()
    .attr("class", "d3-tip")
    .attr("id", "tooltip")
    .html(function (d) {
      return d;
    })
    .direction("n")
    .offset([-10, 0]);

  const svg = d3
    .select(".view")
    .append("svg")
    .attr("height", height + padding.top + padding.bottom)
    .attr("width", width + padding.right + padding.left)
    .call(tip);

  const yScale = d3
    .scaleBand()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    .rangeRound([0, height])
    .padding(0);
  const yAxis = d3
    .axisLeft()
    .scale(yScale)
    .tickValues(yScale.domain())
    .tickFormat(function (month) {
      const date = new Date(0);
      date.setUTCMonth(month);
      const format = d3.timeFormat("%B");
      return format(date);
    })
    .tickSize(10, 1);

  svg
    .append("g")
    .classed("y-axis", true)
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding.left},${padding.top})`)
    .call(yAxis)
    .append("text")
    .text("Months")
    .style("text-anchor", "middle")
    .attr(
      "transform",
      "translate(" + -7 * fontSize + "," + height / 2 + ") rotate(-90)"
    )
    .attr("fill", "black");

  const xScale = d3
    .scaleBand()
    .domain(data.monthlyVariance.map((d) => d.year))
    .range([0, width])
    .padding(0);

  const xAxis = d3
    .axisBottom()
    .scale(xScale)
    .tickValues(
      xScale.domain().filter(function (year) {
        return year % 10 === 0;
      })
    )
    .tickFormat(function (year) {
      const date = new Date(0);
      date.setUTCFullYear(year);
      const format = d3.timeFormat("%Y");

      return format(date);
    })
    .tickSize(10, 1);
  svg
    .append("g")
    .classed("x-axis", true)
    .attr("id", "x-axis")
    .attr("transform", `translate(${padding.left},${padding.top + height})`)
    .call(xAxis)
    .append("text")
    .text("Years")
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + width / 2 + "," + 3 * fontSize + ")")
    .attr("fill", "black");

  const colors = [
    "#67001f",
    "#b2182b",
    "#d6604d",
    "#f4a582",
    "#fddbc7",
    "#f7f7f7",
    "#d1e5f0",
    "#92c5de",
    "#4393c3",
    "#2166ac",
    "#053061"
  ].reverse();

  const legendWidth = 400;
  const legendHeight = 300 / colors.length;

  const variance = data.monthlyVariance.map((d) => d.variance);

  const minTemp = data.baseTemperature + d3.min(variance);
  const maxTemp = data.baseTemperature + d3.max(variance);

  const legendThreshold = d3
    .scaleThreshold()
    .domain(
      (function (min, max, count) {
        const array = [];
        const step = (max - min) / count;
        const base = min;
        for (let i = 1; i < count; ++i) {
          array.push(base + i * step);
        }
        return array;
      })(minTemp, maxTemp, colors.length)
    )
    .range(colors);

  const legendX = d3
    .scaleLinear()
    .range([0, legendWidth])
    .domain([minTemp, maxTemp]);

  const legendAxis = d3
    .axisBottom()
    .scale(legendX)
    .tickSize(10, 0)
    .tickValues(legendThreshold.domain())
    .tickFormat(d3.format(".1f"));

  const legend = svg
    .append("g")
    .classed("legend", true)
    .attr("id", "legend")
    .attr(
      "transform",
      `translate(${padding.left},${
        padding.top + padding.bottom + height - 2 * legendHeight
      })`
    );
  legend
    .append("g")
    .selectAll("rect")
    .data(
      legendThreshold.range().map(function (color) {
        var d = legendThreshold.invertExtent(color);
        if (d[0] === null) {
          d[0] = legendX.domain()[0];
        }
        if (d[1] === null) {
          d[1] = legendX.domain()[1];
        }
        return d;
      })
    )
    .enter()
    .append("rect")
    .style("fill", function (d) {
      return legendThreshold(d[0]);
    })
    .attr("x", (d) => legendX(d[0]))
    .attr("y", 0)
    .attr("width", (d) =>
      d[0] && d[1] ? legendX(d[1]) - legendX(d[0]) : legendX(null)
    )
    .attr("height", legendHeight);

  legend
    .append("g")
    .attr("transform", "translate(" + 0 + "," + legendHeight + ")")
    .call(legendAxis);

  svg
    .append("g")
    .classed("map", true)
    .attr("transform", `translate(${padding.left},${padding.top})`)
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("data-month", function (d) {
      return d.month;
    })
    .attr("data-year", function (d) {
      return d.year;
    })
    .attr("data-temp", function (d) {
      return data.baseTemperature + d.variance;
    })
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month))
    .attr("width", (d) => xScale.bandwidth(d.year))
    .attr("height", (d) => yScale.bandwidth(d.month))
    .attr("fill", (d) => legendThreshold(data.baseTemperature + d.variance))
    .on("mouseover", function (event, d) {
      var date = new Date(d.year, d.month);
      var str =
        "<span class='date'>" +
        d3.timeFormat("%Y - %B")(date) +
        "</span>" +
        "<br />" +
        "<span class='temperature'>" +
        d3.format(".1f")(data.baseTemperature + d.variance) +
        "&#8451;" +
        "</span>" +
        "<br />" +
        "<span class='variance'>" +
        d3.format("+.1f")(d.variance) +
        "&#8451;" +
        "</span>";
      tip.attr("data-year", d.year);
      tip.show(str, this);
    })
    .on("mouseout", tip.hide);
})();

// User Story #3: My heat map should have an x-axis with a corresponding id="x-axis".

// User Story #4: My heat map should have a y-axis with a corresponding id="y-axis".

// User Story #5: My heat map should have rect elements with a class="cell" that represent the data.

// User Story #6: There should be at least 4 different fill colors used for the cells.

// User Story #7: Each cell will have the properties data-month, data-year, data-temp containing their corresponding month, year, and temperature values.

// User Story #8: The data-month, data-year of each cell should be within the range of the data.

// User Story #9: My heat map should have cells that align with the corresponding month on the y-axis.

// User Story #10: My heat map should have cells that align with the corresponding year on the x-axis.

// User Story #11: My heat map should have multiple tick labels on the y-axis with the full month name.

// User Story #12: My heat map should have multiple tick labels on the x-axis with the years between 1754 and 2015.

// User Story #13: My heat map should have a legend with a corresponding id="legend".

// User Story #14: My legend should contain rect elements.

// User Story #15: The rect elements in the legend should use at least 4 different fill colors.

// User Story #16: I can mouse over an area and see a tooltip with a corresponding id="tooltip" which displays more information about the area.

// User Story #17: My tooltip should have a data-year property that corresponds to the data-year of the active area.
