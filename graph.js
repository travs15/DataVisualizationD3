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
    // gamma de colores d3 https://github.com/d3/d3/blob/master/API.md#colors-d3-color
    // const colores = d3.schemeTableau10;
    let departamento = "Amazonas", year = "2008", municipio = "La chorrera";
    // const colores = d3.schemeTableau10;
    // const colores = d3.schemeSet3;
    const colores = d3.schemeSet2;
    // const colores = d3.schemePaired;
    console.log(colores);
    /// array para el dominio de los nombres
    let arrayNombres = data.map(d => d.cultivo);
    let arrayAreaSembr = data.map(d => d.area_sembr);
    //spread operator ...array
    let maxDataValue = Math.max(...arrayAreaSembr);
    var sizeArray = colores.length;
    let arrayColLegend = [];
    // console.log("arrayNom", arrayNombres);
    let espaciado = 22;
    let radioMaximo = 30;
    let legendFill = "gray";

    // console.log("svg", d3.select("#graph"));
    let svg = d3.select("#graph");
    svg.attr("overflow", "visible");
    var margin = { top: 30, right: 40, bottom: 30, left: 60 };
    var width = +svg.attr("width") - margin.left - margin.right;
    var height = +svg.attr("height") - margin.top - margin.bottom;
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // se coloca un grupo para el eje X
    g.append("g").attr("class", "xaxis");
    // label para eje x
    svg.append("g")
        .append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.bottom + 30) + ")")
        .style("text-anchor", "middle")
        .text("Area Cosechada (ha)");

    // se coloca un grupo para el eje Y
    g.append("g").attr("class", "yaxis");
    // text label for the y axis
    svg.append("g")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Producción (t)");

    //se establece un rango para los ejes de acuerdo a los pixeles del svg
    var x = d3.scaleLinear()
        .range([0, width]);
    var y = d3.scaleLinear()
        .range([height, 0]);
    // nueva escala para tamaño de circulos usando squareRoot, radio es proporcional a la raiz del area
    var radius = d3.scaleSqrt()
        .domain([0, maxDataValue])
        .range([5, radioMaximo]);

    //escala para cultivos: categorico
    var colorCategory = d3.scaleOrdinal()
        .domain(arrayNombres)
        .range(colores);

    //se establece un dominio tomando como maximo, el maximo de los datos en ese eje
    x.domain([0, d3.max(data, d => d.area_cosec)]).nice();
    y.domain([0, d3.max(data, d => d.produccion)]).nice();

    // create a tooltip
    var Tooltip = d3.select("#grafica")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip");

    // Tres funciones que cambian el tooltip cuando el mouse hace hover, se mueve, y deja un circulo
    var mouseover = function (d) {
        Tooltip
            .style("opacity", 1);
        d3.select(this)
            .style("stroke", "gray")
            .style("opacity", 1);
    }
    var mousemove = function (d) {
        Tooltip
            .html("<p>" + departamento + " - " + municipio + " - " + year + "</p>" +
                "<table>" +
                "<tr><th>Cultivo:</th>" + "<th>" + d.cultivo + "</th></tr>" +
                "<tr><th>Área Cosechada:</th>" + "<th>" + d.area_cosec + " ha" + "</th></tr>" +
                "<tr><th>Producción:</th>" + "<th>" + d.produccion + " t" + "</th></tr>" +
                "<tr><th>Rendimiento:</th>" + "<th>" + d.rendimiento + " t/ha" + "</th></tr>" +
                "<tr><th>Área Sembrada:</th>" + "<th>" + d.area_sembr + " ha" + "</th></tr>" +
                "</table>")
            // .style("left", (d3.mouse(this)[0] + 70) + "px")
            // .style("top", (d3.mouse(this)[1]) + "px")
            .style("top", `${d3.event.y}px`)
            .style("left", `${d3.event.x}px`);
        console.log("evento", d3.event);
    }
    var mouseleave = function (d) {
        Tooltip
            .style("opacity", 0);
        d3.select(this)
            .attr("stroke", "gray")
            .attr("stroke-width", 1)
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
        .attr("r", d => radius(d.area_sembr))
        .attr("stroke", "gray")
        .attr("stroke-width", 1)
        .attr("fill", d => colorCategory(d.cultivo));

    points.exit().remove();

    g.select(".xaxis")
        .call(d3.axisBottom(x))//sale arriba de la grafica
        .attr("transform", "translate(0," + height + ")")//se pasa abajo de acuerdo al alto
        .selectAll("text")
        .attr('transform', `translate(0,0) rotate(-12)`);

    g.select(".yaxis")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr('transform', `translate(0,0) rotate(-12)`);

    // creacion de la leyenda ///////
    // Tres funciones que cambian el tooltip cuando el mouse hace hover, se mueve, y deja un circulo
    var mouseoverLegend = function (d) {
        Tooltip
            .style("opacity", 1);
        d3.select(this)
            .style("opacity", 1);
    }
    var mousemoveLegend = function (d) {
        let descript = "";
        if (isNaN(d)) {
            descript = "Color respecto a cultivo: " + d;
        } else {
            descript = "Representación de acuerdo al área sembrada: " + d + " ha";
        }
        Tooltip
            .html("<p>" + descript + "</p>")
            .style("left", width + 120 + "px")
            .style("top", height / 6 + "px");
    }
    var mouseleaveLegend = function (d) {
        Tooltip
            .style("opacity", 0);
        d3.select(this)
            .style("opacity", 0.8);
    }
    ////////////////////////////////
    // const groups = g.append("g").append("g")
    const groups = svg.append("g")
        .selectAll("g")
        .data(colorCategory.domain());

    const groupsEnter = groups
        .enter().append('g')
        .attr('class', 'legend')
        .on("mouseover", mouseoverLegend)
        .on("mousemove", mousemoveLegend)
        .on("mouseleave", mouseleaveLegend);
    groupsEnter
        .merge(groups)
        .attr('transform', (d, i) =>
            `translate(0,${i * espaciado})`
        );
    groups.exit().remove();

    groupsEnter.append('circle')
        .merge(groups.select('circle'))
        .attr('r', 6)
        .attr('fill', colorCategory)
        .attr('cx', width + 160)
        .attr('cy', height / 2);

    groupsEnter.append('text')
        .merge(groups.select('text'))
        .text(d => d)
        .attr('dy', '0.32em')
        .attr('x', width + 180)
        .attr('y', height / 2);

    /////////////////////////////////

    ////////////////////////////////
    // console.log(radius.ticks(4));
    const ticks = radius.ticks(4)
        .filter(d => d !== 0)
        .reverse();

    const groups2 = svg.append("g")
        .selectAll('g').data(ticks);

    const groupsEnter2 = groups2
        .enter().append('g')
        .attr('class', 'legendRadius')
        .on("mouseover", mouseoverLegend)
        .on("mousemove", mousemoveLegend)
        .on("mouseleave", mouseleaveLegend);
    groupsEnter2
        .merge(groups2)
        .attr('transform', (d, i) =>
            `translate(0, ${i * (espaciado * 1.5 + radius(d))})`);
    groups2.exit().remove();

    groupsEnter2.append('circle')
        .merge(groups2.select('circle'))
        .attr('r', d => radius(d))
        .attr('stroke', 'black')
        .attr('fill', legendFill)
        .attr('cx', width + 160)
        .attr('cy', height / 5);

    groupsEnter2.append('text')
        .merge(groups2.select('text'))
        .text(d => d + " ha")
        .attr('dy', '0.32em')
        .attr('x', width + 200)
        .attr('y', height / 5);

    /////////////////////////////////
}

cargarDatos();