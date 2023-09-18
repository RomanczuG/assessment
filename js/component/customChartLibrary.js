/**
 * Function to truncate a label to a given maximum length
 *
 * @param {string} label - The label to be truncated
 * @param {number} maxLength - The maximum length of the label
 * @returns {string} - The truncated label
 */
function truncateLabel(label, maxLength) {
  return label.length > maxLength
    ? label.slice(0, maxLength - 3) + "..."
    : label;
}

/**
 * Function to draw a bar chart
 *
 * @param {Array} data - Array of objects containing the data to be plotted
 * @param {string} container - The DOM element to draw the chart in
 * @param {number} width - The width of the chart
 * @param {number} height - The height of the chart
 * @param {string} title - The title of the chart
 * @param {string} x_axisLabel - The label for the x-axis
 * @param {string} y_axisLabel - The label for the y-axis
 * @param {boolean} xValuesAreDates - Flag to indicate if the x-axis values are dates
 */
function formatDate(value) {
  const stringValue = value.toString();
  return `${stringValue.substring(0, 4)}-${stringValue.substring(
    4,
    6
  )}-${stringValue.substring(6, 8)}`;
}

function drawBarChart(
  data,
  container,
  width,
  height,
  title,
  x_axisLabel,
  y_axisLabel,
  xValuesAreDates = false
) {
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const margin = { top: 40, right: 20, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const totalDataPoints = data.length;

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.term))
    .range([0, chartWidth])
    .padding(0.4);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.count)])
    .range([chartHeight, 0]);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  chart
    .append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .text((d) => (xValuesAreDates ? formatDate(d) : truncateLabel(d, 10)))
    // change size
    .attr("font-size", totalDataPoints > 7 ? "8px" : "12px")
    .attr("transform", totalDataPoints > 7 ? "rotate(-90)" : "rotate(0)")
    .style("text-anchor", totalDataPoints > 7 ? "end" : "middle")
    .attr("dx", totalDataPoints > 7 ? "-.8em" : "0em")
    .attr("dy", totalDataPoints > 7 ? "-.8em" : "1em");

  chart.append("g").call(d3.axisLeft(y).ticks(5));

  chart
    .selectAll()
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.term))
    .attr("y", (d) => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", (d) => chartHeight - y(d.count))
    .attr("fill", "#3498db");

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(title);

  svg
    .append("text")
    .attr("x", -(height / 2))
    .attr("y", margin.left / 3)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .attr("transform", "rotate(-90)")
    .text(y_axisLabel);

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", totalDataPoints > 7 ? height : height - 20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text(x_axisLabel);
}
