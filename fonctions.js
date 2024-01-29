const parseTime = d3.timeParse("%Y%m%d-%H%M%S");
var rowConverter = function(d) {
  return {
      date: parseTime(d.DATE),
      PM_10: +d.PM_10,
      PM_2_5: +d.PM_2_5,
      TEMP: +d.TEMP,
      PRESS: +d.PRESS,
      HUMID: +d.HUMID
  };
}

// Ajoute des Nan entre les périodes temporelles sans données
// pour éviter qu'elles soient reliées par des lignes
var preprocess_capteur = function(data) {
    i = data.length; 
    while(i-- > 1) {
      // Insert des NaN si PM_10=PM_2_5=TEMP de mesures en 10 minutes (à faire plutôt 1 fois en offline)
      if (data[i].PM_10 == data[i].PM_2_5 && data[i].PM_2_5==data[i].TEMP) {
        data[i].PM_10 = NaN;
        data[i].PM_2_5 = NaN;
      }
      // Insert des NaN si pas de mesures en 10 minutes (à faire plutôt 1 fois en offline)
        delta = 0.001* (data[i].date - data[i-1].date);
        if (delta > 3000) { 
          console.log( data[i-1].date+": "+delta + "s");
          data.splice(i, 0, {date: new Date(data[i-1].date.getTime()+ 100000), 
            PM_10: NaN, PM_2_5: NaN, TEMP: NaN, PRESS: NaN, HUMID: NaN})}
    }

    return(data);
}


function makePlotly(data, nom_capteur) {
    
    var trace_pm10 = {
        x: data.map(el => el.date),
        y: data.map(el => el.PM_10),
        text: data.map(el => "".concat(el.TEMP,"°C<br>Pression", 10*Math.round(el.PRESS/1000), "mBar", 
          "<br>PM_10     : ", el.PM_10, "µg/m³",
          "<br>PM_2_5    : ", el.PM_2_5, "µg/m³",
          "<br>humidité  : ", el.HUMID, "%",
          "<br>humidité  : ", el.HUMID, "%")),
        name: (nom_capteur + ' PM 10µ'),
        type: 'scatter'
    }
    
    var trace_pm2 = {
      x: data.map(el => el.date),
      y: data.map(el => el.PM_2_5),
      text: data.map(el => "".concat(el.TEMP,"°C<br>Pression", 10*Math.round(el.PRESS/1000), "mBar", 
        "<br>PM_10     : ", el.PM_10, "µg/m³",
        "<br>PM_2_5    : ", el.PM_2_5, "µg/m³",
        "<br>humidité  : ", el.HUMID, "%",
        "<br>humidité  : ", el.HUMID, "%")),
      name: (nom_capteur + ' PM 2.5µ'),
      type: 'scatter'
    }

    var trace_temp = {
      x: data.map(el => el.date),
      y: data.map(el => el.TEMP),
      text: data.map(el => "".concat(el.TEMP,"°C<br>Pression ", 10*Math.round(el.PRESS/1000), "mBar", 
      "<br>PM_10     : ", el.PM_10, "µg/m³",
      "<br>PM_2_5    : ", el.PM_2_5, "µg/m³",
      "<br>humidité  : ", el.HUMID, "%") ),
      name: nom_capteur,
      type: 'scatter'
    }

    date_deb = data[0].date
    date_fin = data[data.length-1].date
    var trace_19_deg = {
      x: [date_deb, date_fin],
      y: [19, 19],
      name: '19°C',
      type: 'scatter', 
      mode: 'lines',
      line: { color: 'rgb(255, 10, 10)', width: 2 }
    }


    Plotly.newPlot("plot-temp", [trace_temp, trace_19_deg], {
      title: 'Températures TODS',
      xaxis : {
        autorange: true,
        range: [date_deb, date_fin],
        rangeselector: {buttons: [
          {
            count: 1,
            label: '1 jour',
            step: 'day',
            stepmode: 'backward'
          },
          {
            count: 7,
            label: '1 semaine',
            step: 'day',
            stepmode: 'backward'
          },
          {
            count: 1,
            label: '1 mois',
            step: 'month',
            stepmode: 'backward'
          },
          {step: 'all', label: 'Tout'}
        ]}
      },
      yaxis: { title: 'Températures °C', 
                rangemode: 'tozero',
                autorange: true },
      legend: {traceorder: 'reversed' }
     }, {responsive: true});

    
    Plotly.newPlot("plot-pm", [trace_pm10, trace_pm2],  {
      title: 'Particules fines TODS',
      yaxis: { title: 'µg/m³', 
                rangemode: 'tozero',
                autorange: true },
      legend: {traceorder: 'reversed' }
    }, {responsive: true}
    );

  };

  

// Télécharge les données csv et les ajoute au graphe initial 
var add_trace_capteur = function(fic_csv, nom_capteur, graphTemp, graphPM) {
    
    console.log(fic_csv)
    d3.csv(fic_csv, rowConverter)
    .then(data => {
    
        console.log(data)
        
        var trace_pm10 = {
            x: data.map(el => el.date),
            y: data.map(el => el.PM_10),
            text: data.map(el => "".concat(el.TEMP,"°C<br>Pression", 10*Math.round(el.PRESS/1000), "mBar", 
            "<br>PM_10     : ", el.PM_10, "µg/m³",
            "<br>PM_2_5    : ", el.PM_2_5, "µg/m³",
            "<br>humidité  : ", el.HUMID, "%",
            "<br>humidité  : ", el.HUMID, "%")),
            name: (nom_capteur + ' PM 10µ'),
            type: 'scatter'
        }
        
        var trace_pm2 = {
            x: data.map(el => el.date),
            y: data.map(el => el.PM_2_5),
            text: data.map(el => "".concat(el.TEMP,"°C<br>Pression", 10*Math.round(el.PRESS/1000), "mBar", 
                "<br>PM_10     : ", el.PM_10, "µg/m³",
                "<br>PM_2_5    : ", el.PM_2_5, "µg/m³",
                "<br>humidité  : ", el.HUMID, "%",
                "<br>humidité  : ", el.HUMID, "%")),
            name: (nom_capteur + ' PM 2.5µ'),
            type: 'scatter'
        }

        var trace_temp = {
            x: data.map(el => el.date),
            y: data.map(el => el.TEMP),
            text: data.map(el => "".concat(el.TEMP,"°C<br>Pression ", 10*Math.round(el.PRESS/1000), "mBar", 
            "<br>PM_10     : ", el.PM_10, "µg/m³",
            "<br>PM_2_5    : ", el.PM_2_5, "µg/m³",
            "<br>humidité  : ", el.HUMID, "%") ),
            name: nom_capteur,
            type: 'scatter'
        }

        Plotly.addTraces(graphTemp, [trace_temp]);
        Plotly.addTraces(graphPM, [trace_pm10, trace_pm2]);
    })
}