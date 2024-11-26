const parseTime = d3.timeParse("%d/%m/%Y");
var rowConverter = function(d) {
    return {
        date: new parseTime(d.date_debut),
        DEPARTEMENT: d.nom_dept,
        VILLE: d.nom_com,
        MESURE: d.nom_poll,
        VALEUR: +d.valeur,
        UNITE: d.unite,
        VALID: +d.statut_valid
    };
  }

// Ajoute des Nan entre les périodes temporelles sans données
// pour éviter qu'elles soient reliées par des lignes
var preprocess_capteur = function(data) {
    i = data.length; 
    while(i-- > 0) {
      // Supprime les points non valides
      if (data[i].VALID == 0) {
        data.splice(i,1);
        continue;
      }
    }

    return(data);
}


function afficheMesures(fichier, elID, seuil) {
  
  d3.csv(fichier, rowConverter)
    .then(data => {
      // Ajoute des NaN sur les données manquantes
      data = preprocess_capteur(data)
      
      // console.log(data);

      map_ville = d3.group(data, (d) => d.VILLE)
      var traces = new Array();
      map_ville.keys().forEach(
        (k) => traces.push({x: map_ville.get(k).map(el => el.date), 
                            y: map_ville.get(k).map(el => el.VALEUR), 
                            name:k, type: "scatter", mode: "lines"
                          }))
      
      my_data = { mesure: data[0].MESURE,
                  unite_y: data[0].UNITE,
                  villes: map_ville,
                  traces: traces };

      // Graphique
      makePlotly(my_data, elID, seuil);

    });

}


function makePlotly(data, elID, seuil) {

  // Ajout du seuil OMS
  date_deb = data.traces[0].x[0]
  date_fin = data.traces[0].x[data.traces[0].x.length-1]
  console.log(date_deb+","+date_fin);
  data.traces.push({
    x: [date_deb, date_fin],
    y: [seuil, seuil],
    name: 'Seuil réf. OMS 2021',
    type: 'scatter', 
    mode: 'lines',
    line: { color: 'rgb(255, 10, 10)', width: 2 }
  })

    Plotly.newPlot(elID, data.traces, {
      title: data.mesure,
      xaxis : {
        autorange: true,
       },
      yaxis: { title: data.unite_y, 
               rangemode: 'tozero',
               autorange: true },
      legend: {traceorder: 'reversed' }
     }, {responsive: true});


  };
