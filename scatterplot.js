(async function () {
  const response = await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
  );
  const data = await response.json();

  const time = data.map((d) => {
    const parsedTime = d["Time"].split(":");
    return new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
  });
  const year = data.map((d) => d["Year"]);

  const dataset = [];
  for (let i = 0; i < year.length; ++i) {
    dataset.push([time[i], year[i]]);
  }

  const minY = d3.min(time);
  const maxY = d3.max(time);

  const minX = d3.min(year);
  const maxX = d3.max(year);

  const height = 500;
  const width = 900;
  const radius = 5;

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const xScale = d3
    .scaleLinear()
    .range([0, width])
    .domain([minX - 1, maxX + 1]);
  const yScale = d3
    .scaleTime()
    .range([0, height])
    .domain(
      d3.extent(time, function (d) {
        return d;
      })
    );

  // const xAxis = d3.axisBottom().scale(xScale);
  // const yAxis = d3.axisLeft().scale(yScale);

  var timeFormat = d3.timeFormat("%M:%S");
  var xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

  var yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);

  const svg = d3
    .select(".view")
    .append("svg")
    .attr("height", height + 60)
    .attr("width", width + 100);

  const tooltip = d3
    .select(".view")
    .append("div")
    .attr("id", "tooltip")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", "translate(60, 510)");

  svg
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", "translate(60,10)");

  svg
    .selectAll(".dot")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 6)
    .attr("data-xvalue", (d, i) => d[1])
    .attr("data-yvalue", (d, i) => d[0].toISOString())
    .attr("cx", (d, i) => 60 + xScale(d[1]))
    .attr("cy", (d, i) => yScale(new Date(d[0])) + 10)
    .attr("fill", (d, i) => color(data[i]["Doping"] !== ""))
    .attr("index", (d, i) => i)
    .on("mouseover", function (event, d) {
      const i = this.getAttribute("index");
      tooltip
        .html(
          data[i].Name +
            ": " +
            data[i].Nationality +
            `<br/>Year: ${data[i].Year}, Time: ${data[i].Time}<br/><br/>` +
            data[i].Doping
        )
        .transition()
        .duration(10)
        .attr("data-year", d[1])
        .style("opacity", 1)
        .style("left", xScale(d[1]) + 20 + "px")
        .style("top", yScale(new Date(d[0])) + "px")
        .style("transform", "translateX(60px)");
      console.log("here");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  const legendContainer = svg.append("g").attr("id", "legend");

  const legend = legendContainer
    .selectAll("#legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("class", "legend-label")
    .attr("transform", function (d, i) {
      return "translate(0," + (height / 2 - i * 20) + ")";
    });

  legend
    .append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legend
    .append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function (d) {
      if (d) {
        return "Riders with doping allegations";
      } else {
        return "No doping allegations";
      }
    });
})();
