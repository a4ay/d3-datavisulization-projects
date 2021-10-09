(async function () {
  const response = await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
  );

  const dataset = await response.json();

  const gdp = dataset.data.map((d) => d[1]);
  const yearsDate = dataset.data.map((d) => new Date(d[0]));
  const years = dataset.data.map(getYear);
  console.log(yearsDate.length);

  const height = 500;
  const width = 900;
  const barWidth = width / 275;

  var maxDate = new Date(d3.max(yearsDate));
  maxDate.setMonth(maxDate.getMonth() + 3);
  const minDate = d3.min(yearsDate);

  const maxGDP = d3.max(gdp);

  const xScale = d3.scaleTime().range([0, width]).domain([minDate, maxDate]);
  const yScale = d3.scaleLinear().range([0, height]).domain([maxGDP, 0]);

  const xAxis = d3.axisBottom().scale(xScale);
  const yAxes = d3.axisLeft().scale(yScale);

  const svg = d3
    .select(".view")
    .append("svg")
    .attr("height", height + 60)
    .attr("width", width + 100);

  const tooltip = d3
    .select(".view")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  svg
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", "translate(60, 510)");

  svg
    .append("g")
    .call(yAxes)
    .attr("id", "y-axis")
    .attr("transform", "translate(60, 10)");

  svg
    .selectAll("rect")
    .data(gdp)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("fill", "orange")
    .attr("height", (d, i) => height - yScale(d))
    .attr("width", (d, i) => barWidth)
    .attr("x", (d, i) => i * barWidth + 60)
    .attr("y", (d, i) => yScale(d) + 10)
    .attr("data-date", (d, i) => formatDateToISO(yearsDate[i]))
    .attr("data-gdp", (d, i) => d)
    .attr("index", (d, i) => i);

  d3.selectAll("rect")
    .on("mouseover", function (event, d) {
      const i = this.getAttribute("index");
      tooltip
        .html(years[i] + "<br> $" + d + " Billion")
        .transition()
        .duration(10)
        .style("opacity", 0.9)
        .style("left", i * barWidth + 30 + "px")
        .style("top", height - 100 + "px")
        .attr("data-date", formatDateToISO(yearsDate[i]))
        .style("transform", "translateX(60px)");
    })
    .on("mouseout", (d, i) => {
      tooltip.transition().duration(200).style("opacity", 0);
    });
})();

// Just funtion returns year with the quarter
function getYear(item) {
  var quarter;
  var temp = item[0].substring(5, 7);

  if (temp === "01") {
    quarter = "Q1";
  } else if (temp === "04") {
    quarter = "Q2";
  } else if (temp === "07") {
    quarter = "Q3";
  } else if (temp === "10") {
    quarter = "Q4";
  }

  return item[0].substring(0, 4) + " " + quarter;
}

// date fromatter
function formatDateToISO(date) {
  return date.toISOString().substr(0, 10);
}
