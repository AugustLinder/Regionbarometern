const map = L.map('map').setView([61, 16], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);
let brotts_data = null;
const brotts_data_promise = fetch("anmalda_brott_json.json")
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);
        brotts_data = data;
        return(data);
});
const geojson_data = fetch("geojson_kommuner.json")
.then(response => {
    return response.json();
})
.then(data => {
    //Add the polygon for kommun 0 to the m
    async function handleData() {
        let brotts_data = await brotts_data_promise;
        console.log(data.features)
        //Lägg till index (bokstavsordning) i data.features[0].properties.index
        let KnNamnLista = brotts_data.map((x)=>{return x.name.toLowerCase()});
        console.log(KnNamnLista.indexOf("Tranås kommun"));
        console.log(KnNamnLista);
        for (feature of data.features) {
            feature.properties.index = KnNamnLista.indexOf(feature.properties.KnNamn.toLowerCase() + " kommun");
            if (feature.properties.index == -1) {
                feature.properties.index = KnNamnLista.indexOf(feature.properties.KnNamn.toLowerCase() + "s kommun");
            }
            if (feature.properties.index == -1) {
                feature.properties.index = KnNamnLista.indexOf(feature.properties.KnNamn.toLowerCase());
            }
        }
        console.log(data.features.map((x) => {return x.properties.index + x.properties.KnNamn}));
        function style(feature) {
            let featureIndex = data.features.indexOf(feature);
            let crimeRate = brotts_data[feature.properties.index].crimesRelative;
            
            if (feature.properties.index == -1) {return {color: "grey"};}
            if (crimeRate > 10000) {
                return {color: "red", weight: 1};
            } else if (crimeRate > 8000) {
                return {color: "orange", weight: 1};
            } else {
                return {color: "green", weight: 1};
            }
        }
        var layer = L.geoJson(data, {style: style,})
        .bindPopup(function (layer) {
            console.log(layer);
            return "<p>"+layer.feature.properties.KnNamn+"</p><p>"+
                brotts_data[layer.feature.properties.index].crimesRelative+"</p>";
        })
        .addTo(map);
        return;
    }
    handleData();
    
});
// Create a style function that returns the style dict for a feature
// using a getColor function that takes in kommunnummer from and gives
// color from data of that kommunnummer