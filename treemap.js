const moviesURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";

const colors = {
  Action: "rgba(223,126,179,255)",
  Drama: "rgba(166,118,180,255)",
  Adventure: "rgba(132,132,192,255)",
  Family: "rgba(133,196,237,255)",
  Animation: "rgba(170,210,157,255)",
  Comedy: "rgba(253,211,125,255)",
  Biography: "rgba(240,132,129,255)",
  Others: "rgba(247,239,128,255)"
};

const height = 600;
const width = 1200;

const legendHeight = 200;

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("height", height)
  .attr("width", width);

const legend = d3
  .select(".canvas")
  .append("svg")
  .attr("id", "legend")
  .attr("height", legendHeight)
  .attr("width", width);

const block = legend
  .selectAll("g")
  .data(Object.keys(colors))
  .enter()
  .append("g")
  .attr("transform", (category, index) => {
    let x = 50;
    let y = 40 * (index / 2) + 30;

    if (index % 2 != 0) {
      x = 400;
      y = 40 * ((index - 1) / 2) + 30;
    }

    return `translate(${x},${y})`;
  })
  .attr("category", (category) => category);

block
  .append("rect")
  .attr("class", "legend-item")
  .attr("height", 25)
  .attr("width", 25)
  .attr("fill", (category) => colors[category])
  .attr("stroke", "darkgrey");

block
  .append("text")
  .text((category) => category)
  .attr("x", 40)
  .attr("y", 20)
  .style("color", "rgb(100,100,100)");

const tooltip = d3.select(".canvas").append("div").attr("id", "tooltip");

function drawTreeMap(movieData) {
  const hierarchy = d3
    .hierarchy(movieData, (node) => {
      return node["children"];
    })
    .sum((node) => {
      return node["value"];
    })
    .sort((node1, node2) => {
      return node2 - node1;
    });
  const createTreeMap = d3.treemap().size([width, height]);
  createTreeMap(hierarchy);
  const movieTiles = hierarchy.leaves();
  console.log(movieTiles);
  const group = svg
    .selectAll("g")
    .data(movieTiles)
    .enter()
    .append("g")
    .attr("transform", (movie) => `translate(${movie["x0"]}, ${movie["y0"]})`);

  group
    .append("rect")
    .attr("class", "tile")
    .attr("height", (movies) => Math.abs(movies["y1"] - movies["y0"]))
    .attr("width", (movies) => Math.abs(movies["x1"] - movies["x0"]))
    .attr(
      "fill",
      (movie) => colors[movie["data"]["category"]] || colors["Others"]
    )
    .attr("stroke", "white")
    .attr("data-name", (movie) => movie["data"]["name"])
    .attr("data-category", (movie) => movie["data"]["category"])
    .attr("data-value", (movie) => movie["value"])
    .on("mouseover", (event, movie) => {
      tooltip
        .style("visibility", "visible")
        .style("top", event.pageY - 200 + "px")
        .style("left", event.pageX + 50 + "px")
        .attr("data-value", () => movie["value"])
        .html(() => {
          return `Name: ${movie["data"]["name"]}<br/>
                Category: ${movie["data"]["category"]}<br/>
                Gross: ${movie["data"]["value"]}`;
        });
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });

  group
    .append("text")
    .text((movie) => {
      return movie["data"]["name"];
    })
    .attr("x", 5)
    .attr("y", 20)
    .style("font-size", "13px");
}

d3.json(moviesURL).then((data, err) => {
  drawTreeMap(data);
});
