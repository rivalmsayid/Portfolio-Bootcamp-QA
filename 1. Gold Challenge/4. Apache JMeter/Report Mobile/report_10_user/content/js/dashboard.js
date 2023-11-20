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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6233333333333333, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.55, 500, 1500, "POST Register Seller"], "isController": false}, {"data": [0.5, 500, 1500, "POST Login Seller"], "isController": false}, {"data": [0.575, 500, 1500, "GET Seller Product ID"], "isController": false}, {"data": [0.5, 500, 1500, "POST Register Buyer"], "isController": false}, {"data": [0.1, 500, 1500, "POST Seller Product"], "isController": false}, {"data": [0.55, 500, 1500, "GET Buyer Product"], "isController": false}, {"data": [0.8, 500, 1500, "POST Buyer Order"], "isController": false}, {"data": [1.0, 500, 1500, "GET Buyer Order"], "isController": false}, {"data": [1.0, 500, 1500, "GET Buyer Order ID"], "isController": false}, {"data": [0.75, 500, 1500, "DELETE Seller Product ID"], "isController": false}, {"data": [0.6, 500, 1500, "POST Login Buyer"], "isController": false}, {"data": [0.1, 500, 1500, "GET Seller Product"], "isController": false}, {"data": [0.95, 500, 1500, "PUT Buyer Order"], "isController": false}, {"data": [0.8, 500, 1500, "DELETE Buyer Order ID"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 150, 0, 0.0, 832.8533333333336, 197, 3077, 706.0, 1662.9000000000005, 2361.9, 3052.01, 11.22586439155815, 7.776980663448586, 104.42071031656937], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["POST Register Seller", 10, 0, 0.0, 943.9, 460, 1366, 936.5, 1345.5, 1366.0, 1366.0, 4.875670404680643, 2.7187576182350073, 0.0], "isController": false}, {"data": ["POST Login Seller", 10, 0, 0.0, 1027.9999999999998, 889, 1185, 1004.0, 1184.7, 1185.0, 1185.0, 4.405286343612335, 2.1338105726872247, 1.466994768722467], "isController": false}, {"data": ["GET Seller Product ID", 20, 0, 0.0, 843.25, 408, 1214, 864.5, 1208.9, 1213.95, 1214.0, 3.8328861632809508, 2.6575675546186277, 1.4298462054426984], "isController": false}, {"data": ["POST Register Buyer", 10, 0, 0.0, 827.8000000000001, 754, 886, 843.5, 886.0, 886.0, 886.0, 4.743833017077798, 2.7378958135673623, 6.721974324003795], "isController": false}, {"data": ["POST Seller Product", 10, 0, 0.0, 2130.7, 1371, 3077, 2008.5, 3072.1, 3077.0, 3077.0, 2.369106846718787, 1.552412787254205, 316.42984852523097], "isController": false}, {"data": ["GET Buyer Product", 10, 0, 0.0, 729.0, 487, 957, 717.5, 954.5, 957.0, 957.0, 4.237288135593221, 5.486957097457627, 1.8000198622881356], "isController": false}, {"data": ["POST Buyer Order", 10, 0, 0.0, 493.5, 197, 788, 458.5, 785.0, 788.0, 788.0, 5.91016548463357, 3.8439162234042556, 2.5683824615839246], "isController": false}, {"data": ["GET Buyer Order", 10, 0, 0.0, 424.2, 334, 487, 416.0, 485.6, 487.0, 487.0, 8.077544426494345, 9.457984147819063, 2.9028675282714054], "isController": false}, {"data": ["GET Buyer Order ID", 10, 0, 0.0, 386.2, 303, 492, 365.5, 489.6, 492.0, 492.0, 8.77963125548727, 10.262908801580334, 3.215196992976295], "isController": false}, {"data": ["DELETE Seller Product ID", 10, 0, 0.0, 535.2, 261, 723, 498.5, 721.9, 723.0, 723.0, 6.329113924050633, 1.9284018987341771, 2.4661293512658227], "isController": false}, {"data": ["POST Login Buyer", 10, 0, 0.0, 565.7, 390, 739, 574.5, 728.6, 739.0, 739.0, 5.282620179609086, 2.558769149498151, 1.717883320126783], "isController": false}, {"data": ["GET Seller Product", 10, 0, 0.0, 1920.4, 837, 2418, 2362.0, 2416.3, 2418.0, 2418.0, 2.7793218454697053, 1.9324972206781545, 1.0205322401334076], "isController": false}, {"data": ["PUT Buyer Order", 10, 0, 0.0, 366.69999999999993, 213, 654, 351.5, 625.7, 654.0, 654.0, 7.047216349541931, 4.569679351656096, 2.904223925299507], "isController": false}, {"data": ["DELETE Buyer Order ID", 10, 0, 0.0, 455.0, 270, 682, 358.5, 678.0, 682.0, 682.0, 6.293266205160479, 1.9666456891126496, 2.433724040276904], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 150, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
