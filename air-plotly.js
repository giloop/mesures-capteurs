// Création du graphique

// Récupération des données chargées (debug)
var my_data;

d3.csv("919587.csv", rowConverter)
  .then(data => {
    // console.log(data);
    // Ajoute des NaN sur les données manquantes
    data = preprocess_capteur(data)
    
    my_data = data;

    // Ajout des noms des variables
    d3.select("#tableau-temp").append("thead").append("tr").selectAll("th")
    .data(Object.keys(data[0]))
    .enter()
    .append("th").html(d => d);

    // Ajout des données (seulement les 10 premières)
    pad_2_0 = function(el) { return (("0"+el).slice(-2)); }
    d3.select("#tableau-temp").append("tbody").selectAll("tr")
    .data(data.slice(data.length-10, data.length-1))
    .enter()
    .append("tr")
    .selectAll("td")
    .data(d => { 
      el = Object.values(d);
      return([ "".concat(el[0].getDate(), "/", 
      pad_2_0(el[0].getMonth()+1), "/", el[0].getFullYear(), " ", 
      pad_2_0(el[0].getHours()), ":", pad_2_0(el[0].getMinutes()),  ":", pad_2_0(el[0].getSeconds()))].concat(el.slice(1))) })
        .enter()
        .append("td")
        .html(d => d  );

    // Graphique
    makePlotly(data, "CCBR");

    // Ajout d'annotations
    fetch("annotations.json")
        .then((response) => response.json())
        .then((data) => { 
          //console.log(data); 
          var annotation = data.TEMP.map(el => {
            return({"x":new Date(el.date), "y":el.y, text:el.text})});
          
          Plotly.relayout('plot-temp', {annotations: annotation}) 
        })
    

    // Ajout des autres capteurs 
    add_trace_capteur("929078.csv", "Bureau 10-37", "plot-temp", "plot-pm")
  });


