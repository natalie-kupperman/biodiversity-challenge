function updateMetaData(data) {
    // Reference to Panel element for sample metadata
    var panel = document.getElementById("sample-metadata");
    // Clear any existing metadata
    panel.innerHTML = '';
    // Loop through all of the keys in the json response and
    // create new metadata tags
    for(var key in data) {
        h6tag = document.createElement("h6");
        h6Text = document.createTextNode(`${key}: ${data[key]}`);
        h6tag.append(h6Text);
        panel.appendChild(h6tag);
    }
    console.log(data);
}
function buildCharts(sampleData, otuData) {
    // Loop through sample data and find the OTU Taxonomic Name
    var labels = sampleData[0]['otu_ids'].map(function(item) {
        return otuData[item]
        console.log(outData);
    });
    // Build Bubble Chart
    var bubbleLayout = {
        margin: { t: 0 },
        hovermode: 'closest',
        xaxis: { title: 'OTU ID' }
    };
    var bubbleData = [{
        x: sampleData[0]['otu_ids'],
        y: sampleData[0]['sample_values'],
        text: labels,
        mode: 'markers',
        marker: {
            size: sampleData[0]['sample_values'],
            color: sampleData[0]['otu_ids'],
            colorscale: "Earth",
        }
    }];
    var bubble = document.getElementById('bubbleplot');
    Plotly.plot(bubble, bubbleData, bubbleLayout);
    // Build Pie Chart
    console.log(sampleData[0]['sample_values'].slice(0, 10))
    var pieData = [{
        values: sampleData[0]['sample_values'].slice(0, 10),
        labels: sampleData[0]['otu_ids'].slice(0, 10),
        hovertext: labels.slice(0, 10),
        hoverinfo: 'hovertext',
        type: 'pie'
    }];
    var pieLayout = {
        margin: { t: 0, l: 0 }
    };
    var pie = document.getElementById('pie');
    Plotly.plot(pie, pieData, pieLayout);
};

function updateCharts(sampleData, otuData) {
    var sampleValues = sampleData[0]['sample_values'];
    var otuIds = sampleData[0]['otu_ids'];
    // Return the OTU Description for each otuID in the dataset
    var labels = otuIds.map(function(item) {
        return otuData[item]
    });
    // Update the Bubble Chart with the new data
    var bubble = document.getElementById('bubble');
    Plotly.restyle(bubble, 'x', [otuIds]);
    Plotly.restyle(bubble, 'y', [sampleValues]);
    Plotly.restyle(bubble, 'text', [labels]);
    Plotly.restyle(bubble, 'marker.size', [sampleValues]);
    Plotly.restyle(bubble, 'marker.color', [otuIds]);

    // Update the Pie Chart with the new data
    // Use slice to select only the top 10 OTUs for the pie chart
    var pie = document.getElementById('pie');
    var pieUpdate = {
        values: [sampleValues.slice(0, 10)],
        labels: [otuIds.slice(0, 10)],
        hovertext: [labels.slice(0, 10)],
        hoverinfo: 'hovertext',
        type: 'pie'
    };
    Plotly.restyle(pie, pieUpdate);
}
function getData(sample, callback) {
    // Use a request to grab the json data needed for all charts
    Plotly.d3.json(`/samples/${sample}`, function(error, sampleData) {
        if (error) return console.warn(error);
        Plotly.d3.json('/otu', function(error, otuData) {
            if (error) return console.warn(error);
            callback(sampleData, otuData);
        });
    });
    Plotly.d3.json(`/metadata/${sample}`, function(error, metaData) {
        if (error) return console.warn(error);
        updateMetaData(metaData);
    })
    buildGauge(sample);
}
function getOptions() {
    // Grab a reference to the dropdown select element
    var selDataset = document.getElementById('selDataset');
    // Use the list of sample names to populate the select options
    Plotly.d3.json('/names', function(error, sampleNames) {
        for (var i = 0; i < sampleNames.length;  i++) {
            var currentOption = document.createElement('option');
            currentOption.text = sampleNames[i];
            currentOption.value = sampleNames[i];
            selDataset.appendChild(currentOption);
        }
        getData(sampleNames[0], buildCharts);
    })
}
function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    getData(newSample, updateCharts);
}
function init() {
    getOptions();
}
// Initialize the dashboard
init();
   
function piePlot(value){
    var url=("/metadata/"+value)
    console.log(url)
  
    Plotly.d3.json(url, function(error, response) {
        console.log(response);

        var trace1 = {
            type: "pie",
            values: response.map(data => data.sample_values),
            labels: response.map(data => data.otu_ids)
        }
  
        var data = [trace1];

        var layout = {
          height: 400,
          width: 500
        };
    });

    return Plotly.newPlot('pie', data, layout);
  };


function buildGauge(sample) {
    Plotly.d3.json(`/wfreq/${sample}`, function(error, wfreq) {
        if (error) return console.warn(error);
        // enter wash frequency 
        var level = wfreq*20

        // Trig to calc meter point
        var degrees = 180 - level,
            radius = .5;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);

        // Path: may have to change to create a better triangle
        var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
        var path = mainPath.concat(pathX,space,pathY,pathEnd);
        var data = [{ type: 'scatter',
        x: [0], y:[0],
            marker: {size: 28, color:'850000'},
            showlegend: false,
            name: 'Freq',
            text: level,
            text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
            hoverinfo: 'text+name'},
        { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
        rotation: 90,
        textinfo: 'text',
        textposition:'inside',
        marker: {
            colors:[
                'rgba(0, 105, 11, .5)', 'rgba(10, 120, 22, .5)',
                'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                'rgba(240, 230, 215, .5)', 'rgba(255, 255, 255, 0)']},
        labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '0-1', ''],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
        }];
        var layout = {
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
        }],
        title: `<b> Belly Button Washing Frequency</b> <br>Scrubs per Week`,
        height: 500,
        width: 500, 
        xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
        };
        var gauge = document.getElementById('gauge');
        Plotly.newPlot(gauge, data, layout);
    });
};


  
  
 