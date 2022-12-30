const espacio_inicial = 12;
const fuerza = 2;
const crecimiento_circulos = 6;
const zoom_minimo = 1; const zoom_maximo = 3;
const sample_size = 1000 

const tamano_nodo = d => (5 + d.grado);
const canvas = d3.select('#contenido');

const niveles = [0, 1, 2, 3, 4, 5];
const tamano_nivel = d => espacio_inicial + d * crecimiento_circulos;

const circulos = canvas.selectAll('circulos_niveles')
    .data(niveles)
    .join('circle')
    .attr('class','circulos_niveles')
    .attr('r', d => `${tamano_nivel(d)}%`)
    .style('cx', '50%')
    .style('cy', '50%');

const manejadorZoom = (evento) => {
    const t = evento.transform;
    canvas.selectAll('circle')
        .transition(5)
        .attr("transform", t);
};

const height = canvas.node().getBBox().height;
const width = canvas.node().getBBox().width;

const zoom = d3.zoom()
  .scaleExtent([zoom_minimo, zoom_maximo])
  .extent([[0, 0], [width, height]])
  .translateExtent([[0, 0], [width, height]])
//   .on("start", () => console.log("empecé"))
  .on("zoom", manejadorZoom)
//   .on("end", () => console.log("terminé"));

canvas.call(zoom)

function radio(d) {
    switch (d.nivel){
        case 0: return 0;
        case 1: return (crecimiento_circulos*1.5)*d.nivel + espacio_inicial*(3/4);
        default: return crecimiento_circulos*d.nivel*1.15 + espacio_inicial;
    }
}

function grafico(data, myColor){
    sample = data
        .slice(0, sample_size);

    var nodo = canvas.append('g')
        .selectAll('.nodo')
        .data(sample)
        .join('circle')
            .attr('r', d => `${tamano_nodo(d)}px`)
            .attr('class', 'nodo')
            .attr('fill', d => myColor(d.Escuela))
            .attr('index', (d,i) => i)
            .attr('nivel', d => d.nivel)
            .attr('id', d => d.Escuela);
    
    var simulacion = d3.forceSimulation(sample)
        .force("charge", d3.forceCollide().radius(fuerza))
        .force('collision', d3.forceCollide().radius(d => tamano_nodo(d)))
        .force("r", d3.forceRadial(d => radio(d)/100 * width))
        .on("tick", ticked);
    
    function ticked() {
        nodo
            .attr("cx", d => `calc(50% - ${d.x}px)`)
            .attr("cy", d => `calc(50% - ${d.y}px)`);
        }

    nodo.on('click', (evento, d) => {
        var info = d3.select('#informacion');

        info.select('#info_sigla').text(d.Sigla.join('-'));
        info.select('#info_nombre').text(d.Nombre);
        info.select('#info_escuela').text(d.Escuela);
        info.select('#info_creditos').text('Creditos: ' + d.Creditos);
        info.select('#info_grado').text('Grado: ' + d.grado);
        info.select('#info_nivel').text('Nivel: ' + d.nivel);
        info.select('#info_requistos').text(
            'Requisitos: ' + d.Prerrequistos
                .join(' o ')
                .replaceAll(',', ' y ')
            );
    })
}

///////////////////////////////////////

const _height = 250; 
const _width = 450;
const width_barra = 10;
const margen = {
    'bottom':20,
    'left':25,
}

var svg = d3.select('#contenedor_barchart')
        .append('svg')
        .attr('id', 'barchart');

var contenedorX = svg.append('g')
    .attr('id', 'contX')
    .attr('transform', `translate(${margen['left']},${_height - margen['bottom']})`)

var contenedorY = svg.append('g')
    .attr('id', 'contY')
    .attr('transform', `translate(${margen['left']}, ${-margen['bottom']})`)

var contenedorVis = svg.append('g')
    .attr('id', 'contVis')

function groupBy(xs, key) {
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};
    
function barchart(sample, myColor){
    var agregado = groupBy(sample, 'Escuela');
    var keys = Object.keys(agregado);
    var maximo = d3.max(keys, d => agregado[d].length);

    keys.sort();

    var escalaAltura = d3.scaleLinear()
        .domain([0, maximo])
        .range([0, _height ]);

    var escalaY = d3.scaleLinear()
        .domain([0, maximo])
        .range([_height, 0]);

    var ejeY = d3.axisLeft(escalaY);

    contenedorY.transition()
        .duration(500)
        .call(ejeY);

    var escalaX = d3.scaleBand()
        .domain(sample.map((d) => d.Escuela))
        .rangeRound([0, _width])
        .padding(1);

    var ejeX = d3.axisBottom(escalaX);

    contenedorX.transition()
        .duration(500)
        .call(ejeX);

    var barras = svg.selectAll('rect')
        .data(keys)
        .join('rect')
        .transition()
        .duration(300)
        .attr('height', d => escalaAltura(agregado[d].length))
        .attr('width', width_barra)
        .attr('class', 'bar')
        .attr('x', d => escalaX(d) + margen['left'])
        .attr('y', d => escalaY(agregado[d].length) - margen['bottom'])
        .attr('fill', d => myColor(d));

    var labels = d3.select('#contenedor_labels')
        .selectAll('.labels')
        .data(keys)
        .join('div')
        .attr('class', 'label');

    labels.append('text')
        .text(d => d)
        .attr('class', 'label_text');
        
    labels.append('svg')
        .append('circle')
        .attr('r', 8)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('fill', d => myColor(d));

    var rects = svg.selectAll('rect');
    var actual = 0;
    var opacidad = 0.2;
    
    rects.on("click", (evento, d) => {
        if (actual == 0){
            console.log('ahora deberia')
            rects.filter(e => e != d)
                .transition(1000)
                .attr('opacity', opacidad);

            d3.selectAll('.label_text').filter(e => e != d)
                .transition(1000)
                .style('opacity', opacidad);

            d3.selectAll('.nodo').filter(e=> e.Escuela != d)
                .transition(1000)
                .style('opacity', 0);
                        
            actual = d;
        } else {
            if (actual != d){
                console.log('ahora deberia')
                rects.filter(e => e == actual)
                    .transition(1000)
                    .attr('opacity', opacidad);

                d3.selectAll('.label_text').filter(e => e == actual)
                    .transition(1000)
                    .style('opacity', opacidad);
                
                d3.selectAll('.nodo').filter(e=> e.Escuela == actual)
                    .transition(1000)
                    .style('opacity', 0);

                

                rects.filter(e => e == d)
                    .transition(1000)
                    .attr('opacity', 1);

                d3.selectAll('.label_text').filter(e => e == d)
                    .transition(1000)
                    .style('opacity', 1);

                d3.selectAll('.nodo').filter(e=> e.Escuela == d)
                    .transition(1000)
                    .style('opacity', 1);

                actual = d;
            } else {            
                rects
                    .transition(1000)
                    .attr('opacity', 1);
                d3.selectAll('.label_text')
                    .transition(1000)
                    .style('opacity', 1);
                d3.selectAll('.nodo')
                    .transition(1000)
                    .style('opacity', 1);

                actual = 0;
            }
        }
    })

}


d3.json('https://raw.githubusercontent.com/stgov/datos/main/final.json').then(data => {
    
    var sample = d3.shuffle(data);
    
    var myColor = d3.scaleOrdinal().domain(data.map((d) => d.Escuela).sort())
    .range(d3.schemeSet3);    
    
    grafico(sample, myColor);
    barchart(sample, myColor);
});

