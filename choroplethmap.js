const colors = [
  "#B9DECC",
  "#9ED0C1",
  "#83C2BA",
  "#69AEB3",
  "#4F8EA4",
  "#356A94"
];

(async function () {
  const educationPromise = await fetch(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
  );
  const mapPromise = await fetch(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
  );

  const educationData = await educationPromise.json();
  const mapData = await mapPromise.json();

  const countiesData = topojson.feature(mapData, mapData.objects.counties)
    .features;

  console.log(countiesData);
  console.log(educationData);

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);

  const color = d3
    .scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
    .range(d3.schemeBlues[9]);

  const svg = d3.select(".canvas").append("svg");

  var g = svg
    .append("g")
    .attr("class", "key")
    .attr("id", "legend")
    .attr("transform", "translate(500,20)");

  g.selectAll("rect")
    .data(
      color.range().map(function (d) {
        d = color.invertExtent(d);

        return d;
      })
    )
    .enter()
    .append("rect")
    .attr("height", 30)
    .attr("x", function (d) {
      return d[0] + 20;
    })
    .attr("width", function (d) {
      return 30;
    })
    .attr("fill", function (d) {
      return color(d[0]);
    });

  svg
    .selectAll("path")
    .data(countiesData)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("d", d3.geoPath())
    .attr("data-fips", (d) => d.id)
    .attr("data-education", (d) => getEducationPercentage(d.id))
    .attr("fill", (d) => color(getEducationPercentage(d.id)))
    .on("mouseover", function (event, d) {
      tooltip.style("opacity", 0.9);
      tooltip
        .html(function () {
          var result = educationData.filter(function (obj) {
            return obj.fips === d.id;
          });
          if (result[0]) {
            return (
              result[0]["area_name"] +
              ", " +
              result[0]["state"] +
              ": " +
              result[0].bachelorsOrHigher +
              "%"
            );
          }
          // could not find a matching fips id in the data
          return 0;
        })
        .attr("data-education", function () {
          var result = educationData.filter(function (obj) {
            return obj.fips === d.id;
          });
          if (result[0]) {
            return result[0].bachelorsOrHigher;
          }
          // could not find a matching fips id in the data
          return 0;
        })
        .style("left", event.pageX + 50 + "px")
        .style("top", event.pageY - 70 + "px");
      console.log(event.pageX, event.pageY);
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });

  function getEducationPercentage(id) {
    const educationDataItem = educationData.find((item) => {
      return id === item.fips;
    });

    return educationDataItem.bachelorsOrHigher;
  }
})();
