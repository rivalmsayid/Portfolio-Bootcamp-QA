/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2683333333333333, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.375, 500, 1500, "POST Register Seller"], "isController": false}, {"data": [0.275, 500, 1500, "POST Login Seller"], "isController": false}, {"data": [0.3375, 500, 1500, "GET Seller Product ID"], "isController": false}, {"data": [0.05, 500, 1500, "POST Register Buyer"], "isController": false}, {"data": [0.0, 500, 1500, "POST Seller Product"], "isController": false}, {"data": [0.025, 500, 1500, "GET Buyer Product"], "isController": false}, {"data": [0.45, 500, 1500, "POST Buyer Order"], "isController": false}, {"data": [0.15, 500, 1500, "GET Buyer Order"], "isController": false}, {"data": [0.15, 500, 1500, "GET Buyer Order ID"], "isController": false}, {"data": [0.5, 500, 1500, "DELETE Seller Product ID"], "isController": false}, {"data": [0.55, 500, 1500, "POST Login Buyer"], "isController": false}, {"data": [0.0, 500, 1500, "GET Seller Product"], "isController": false}, {"data": [0.375, 500, 1500, "PUT Buyer Order"], "isController": false}, {"data": [0.45, 500, 1500, "DELETE Buyer Order ID"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 300, 0, 0.0, 1716.4866666666678, 109, 6268, 1517.0, 2804.6000000000004, 4698.099999999997, 5851.400000000001, 11.325028312570781, 7.845678793884485, 105.34252312193281], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["POST Register Seller", 20, 0, 0.0, 1271.35, 412, 2117, 1358.5, 2071.2000000000003, 2114.95, 2117.0, 6.7294751009421265, 3.7524709791386273, 0.0], "isController": false}, {"data": ["POST Login Seller", 20, 0, 0.0, 1430.6, 983, 1837, 1418.5, 1800.8000000000002, 1835.4, 1837.0, 4.641448131817127, 2.2482014388489207, 1.545638489208633], "isController": false}, {"data": ["GET Seller Product ID", 40, 0, 0.0, 1572.4249999999997, 469, 2845, 1359.0, 2802.9, 2836.15, 2845.0, 3.6166365280289328, 2.507628842676311, 1.3491749547920433], "isController": false}, {"data": ["POST Register Buyer", 20, 0, 0.0, 2300.25, 832, 2482, 2459.0, 2474.8, 2481.65, 2482.0, 5.9880239520958085, 3.4559786676646707, 8.477965943113773], "isController": false}, {"data": ["POST Seller Product", 20, 0, 0.0, 5065.5, 3774, 6268, 5088.5, 6011.3, 6256.05, 6268.0, 2.815315315315315, 1.844801344313063, 376.02879979588965], "isController": false}, {"data": ["GET Buyer Product", 20, 0, 0.0, 2092.75, 1500, 2813, 2074.0, 2540.7000000000003, 2799.5, 2813.0, 2.992667963489451, 3.8752712105341915, 1.2712993790213976], "isController": false}, {"data": ["POST Buyer Order", 20, 0, 0.0, 1010.3500000000003, 780, 2157, 902.0, 1991.8000000000025, 2154.25, 2157.0, 6.75219446320054, 4.391563977042539, 2.9343032579338284], "isController": false}, {"data": ["GET Buyer Order", 20, 0, 0.0, 1406.2, 161, 1675, 1652.0, 1674.9, 1675.0, 1675.0, 8.136696501220506, 9.527245219690805, 2.9241253051261187], "isController": false}, {"data": ["GET Buyer Order ID", 20, 0, 0.0, 1568.2500000000002, 109, 1856, 1840.0, 1854.0, 1855.9, 1856.0, 5.408328826392645, 6.322040630070308, 1.9805891698215252], "isController": false}, {"data": ["DELETE Seller Product ID", 20, 0, 0.0, 739.5500000000001, 654, 1211, 668.0, 1188.0000000000005, 1211.0, 1211.0, 7.791195948578107, 2.3738800155823916, 3.0358273276197894], "isController": false}, {"data": ["POST Login Buyer", 20, 0, 0.0, 890.5999999999999, 228, 1612, 871.0, 1523.0, 1607.55, 1612.0, 4.8792388387411565, 2.3633813125152474, 1.5867055989265675], "isController": false}, {"data": ["GET Seller Product", 20, 0, 0.0, 2618.15, 2208, 3027, 2714.0, 2885.4, 3019.95, 3027.0, 3.3840947546531304, 2.3530033840947544, 1.2425972927241962], "isController": false}, {"data": ["PUT Buyer Order", 20, 0, 0.0, 1353.65, 1207, 1853, 1231.5, 1841.5000000000002, 1852.9, 1853.0, 4.2435815828559305, 2.7516974326331423, 1.748819753872268], "isController": false}, {"data": ["DELETE Buyer Order ID", 20, 0, 0.0, 855.2499999999999, 637, 1853, 653.0, 1786.8000000000013, 1852.9, 1853.0, 5.339028296849974, 1.6684463427656167, 2.0647023491724505], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 300, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
