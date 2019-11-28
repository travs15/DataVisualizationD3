var data = null;
function cargarDatos() {
    axios.get('data.json')
        .then(response => {
            // JSON responses are automatically parsed.
            console.log("response", response.data.resultado);
            data = response.data.resultado;
            creaGrafica();
        })
        .catch(e => {
            console.log("error:", e);
        })
}
function creaGrafica() {
    console.log("svg", d3.select("#graph"));
    // let svg = d3.select("#graph");
    // let width = +svg.attr("width");
    // let height = +svg.attr("height");
    let arrayNombres = data.map(d => d.cultivo);
    console.log("arrayNom", arrayNombres);

    // console.log("svg", d3.select("#graph"));
    let svg = d3.select("#graph");
    var margin = { top: 40, right: 40, bottom: 30, left: 40 };
    var width = +svg.attr("width") - margin.left - margin.right;
    var height = +svg.attr("height") - margin.top - margin.bottom;
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // se colocan grupos para los ejes
    g.append("g").attr("class", "xaxis");
    g.append("g").attr("class", "yaxis");

    //se establece un rango para los ejes de acuerdo a los pixeles del svg
    var x = d3.scaleLinear()
        .range([0, width]);
    var y = d3.scaleLinear()
        .range([height, 0]);

    //se establece un dominio tomando como maximo, el maximo de los datos en ese eje
    x.domain([0, d3.max(data, d => d.area_cosec)]).nice();
    y.domain([0, d3.max(data, d => d.produccion)]).nice();

    // create a tooltip
    var Tooltip = d3.select("#grafica")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
        Tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }
    var mousemove = function (d) {
        Tooltip
            .html("Área Cosechada: " + d.area_cosec + "\n Producción: " + d.produccion + "\n Área Sembrada: " + d.area_sembr)
            .style("left", (d3.mouse(this)[0] + 70) + "px")
            .style("top", (d3.mouse(this)[1]) + "px");
    }
    var mouseleave = function (d) {
        Tooltip
            .style("opacity", 0);
        d3.select(this)
            .attr("stroke", "gray")
            .attr("stroke-width", 2)
            .style("opacity", 0.8);
    }

    let points = g
        .append("g") //se crea un grupo para almancenar los circulos
        .selectAll(".point")
        .data(data); //update

    pointsEnter = points // enter
        .enter()
        .append("circle")
        .attr("class", ".point")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    points.merge(pointsEnter) //enter + update
        .attr("cx", d => x(d.area_cosec)) // se devuelve eso en terminos del dominio
        .attr("cy", d => y(d.produccion)) //se devuelve en terminos del dominio
        .attr("r", d => (d.area_sembr * 0.015))
        // .attr("r", 10)
        .attr("stroke", "gray")
        .attr("stroke-width", 2);

    points.exit().remove();

    g.select(".xaxis")
        .call(d3.axisBottom(x))//sale arriba de la grafica
        .attr("transform", "translate(0," + height + ")");//se pasa abajo de acuerdo al alto

    g.select(".yaxis")
        .call(d3.axisLeft(y));
}

cargarDatos();