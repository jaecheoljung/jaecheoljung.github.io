/*
draw.js
*/

var vis = {};
init();
var interval = setInterval(update, vis.speed, true)

function generatePoints(factors) {
  // initialize variables
  var parents = [];
  var points = [];
  var a, x, y, point, da;
  var r = 1;
  var d = 1;
  var n = 1;

  while (factors.length) {
    d *= n;
    n = factors.pop(); // build points from outwards
    r *= 1 / n;
    
    da = Math.PI / 2;
    if (n % 2 === 0) da = Math.PI / 4;
    	
    if (!points.length) { // account for first set of points
      d3.range(n).forEach(function(i) {
        a = i * 2 * Math.PI / n + da;
        x = Math.cos(a);
        y = Math.sin(a);
        point = createPoint(r, x, y);
        points.push(point);
      });

    } else { // iteratively build points by keeping track of parentPoints
      parents = points.slice(); // create shallow copy of points
      points = []; // reset points;
      parents.forEach(function(parent) { // build new points using parentPoints
        d3.range(n).forEach(function(i) {
          a = i * 2 * Math.PI / n + da;
          x = parent.x + Math.cos(a) / d;
          y = parent.y + Math.sin(a) / d;
          point = createPoint(r, x, y);
          points.push(point);
        });
      })
    }
  }
  return points;
}

function createPoint(r, x, y){
	var point = {
		r: r,
		x: x,
		y: y,
	};
	return point;
}

function init() {
  // vis parameters
  vis = {
    size: 250,
    number: 1,
    speed: 1000,
  };
  
  // get prime factors
  vis.factors = primeFactors(vis.number);

  // build data points
  vis.points = generatePoints(vis.number);

  // build scale
  vis.scale = d3.scale.linear()
    .range([0, vis.size])
    .domain([-1, 1]);

  // build vis svg
  vis.svg = d3.select("#vis")
    .append("svg")
    .attr("height", 2 * vis.size)
    .attr("width", 2 * vis.size)
    .append("g")
    .attr("transform", "translate(" + [vis.size / 2, vis.size / 2] + ")");
    
  // build vis tracker number
  vis.trackerNumber = vis.svg
    .append("svg:text").classed("trackerNumber", true)
    .attr("x", -vis.size / 3)
    .attr("y", -vis.size / 3)
    .attr("font-size", "30px")
    .attr("fill", "gray");

  // build vis tracker factors
  vis.trackerFactors = vis.svg
    .append("svg:text").classed("trackerFactors", true)
    .attr("x", -vis.size / 3)
    .attr("y", -vis.size / 3 + 25)
    .attr("font-size", "14px")
    .attr("fill", "gray");
  
  // control logic
  d3.select("#forward")
    .on("click", function() {
      clearInterval(interval);
      interval = setInterval(update, vis.speed, true);
    });
  
  d3.select("#backward")
    .on("click", function() {
      clearInterval(interval);
      interval = setInterval(update, vis.speed, false);
    });
    
  d3.select("#stop")
    .on("click", function() {
      clearInterval(interval);
    });
    
  d3.select("#search")
    .on("click", function() {
      vis.number = document.getElementById("inputNumber").value - 1;
      clearInterval(interval);
      update(true);
    });
}


function update(pos) {
  // update numbers and factors
  pos ? vis.number ++ : vis.number > 2 ? vis.number-- : vis.number;
  vis.factors = primeFactors(vis.number);
  
  // update tracker
  vis.trackerNumber.transition().text(vis.number);
  vis.trackerFactors.transition().text(printFactors(vis.factors));

  // update points
  vis.points = generatePoints(vis.factors); // create new points
  var point = vis.svg.selectAll(".point").data(vis.points);

  // update colorscale
  vis.colorScale = d3.scale.linear()
    .domain([0, vis.points.length])
    .range(["#1f77b4", "#d62728"]);

  // enter
  point.enter()
    .append("svg:circle").classed("point", true)
    .attr("r", 0)
    .transition().duration(vis.speed / 2)
    .attr("r", function(d) { return d.r * vis.size; })
    .attr("cx", function(d) { return vis.scale(d.x); })
    .attr("cy", function(d) { return vis.scale(d.y); })
    .attr("fill", function(d, i) { return vis.colorScale(i); });

  // update
  point.transition()
    .duration(vis.speed / 2)
    .attr("r", function(d) { return d.r * vis.size; })
    .attr("cx", function(d) { return vis.scale(d.x); })
    .attr("cy", function(d) { return vis.scale(d.y); })
    .attr("fill", function(d, i) { return vis.colorScale(i); });

  //exit
  point.exit()
  .transition().duration(vis.speed / 2)
  .attr("r", 0)
  .remove();
}
