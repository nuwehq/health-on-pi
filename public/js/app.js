document.addEventListener("DOMContentLoaded", function(event) { 
   nuwe_charts('demo1', 
    {
        'data': [
            {
                "color": "#00b7ff",
                "amount": 721,
                "maxValue": 1000,
                "textLabel": "Overall",
                "textLabelColor": "#ffffff"
            },
            {
                "color": "#009D76",
                "amount": 930,
                "maxValue": 1000,
                "textLabel": "Food",
                "textLabelColor": "#ffffff"
            },
            {
                "color": "#ff8300",
                "amount": 453,
                "maxValue": 1000,
                "textLabel": "Nutrition",
                "textLabelColor": "#ffffff"
            },
            {
                "color": "#cd3df6",
                "amount": 780,
                "maxValue": 1000,
                "textLabel": "Exercise",
                "textLabelColor": "#ffffff"
            }
        ]
    });	
})
