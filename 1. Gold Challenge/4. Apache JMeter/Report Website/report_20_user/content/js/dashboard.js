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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.08928571428571429, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.375, 500, 1500, "GET List Category"], "isController": false}, {"data": [0.0, 500, 1500, "GET Get Product ID"], "isController": false}, {"data": [0.35, 500, 1500, "GET Get List Offer"], "isController": false}, {"data": [0.0, 500, 1500, "GET Get Category ID"], "isController": false}, {"data": [0.0, 500, 1500, "GET Get List Product"], "isController": false}, {"data": [0.0, 500, 1500, "POST Register User"], "isController": false}, {"data": [0.0, 500, 1500, "PUT Update Product ID"], "isController": false}, {"data": [0.0, 500, 1500, "POST Create Offer"], "isController": false}, {"data": [0.0, 500, 1500, "POST Login User"], "isController": false}, {"data": [0.0, 500, 1500, "PUT Update Profile"], "isController": false}, {"data": [0.0, 500, 1500, "POST Create Product"], "isController": false}, {"data": [0.075, 500, 1500, "GET Get Profile"], "isController": false}, {"data": [0.25, 500, 1500, "PUT Update Offer ID"], "isController": false}, {"data": [0.2, 500, 1500, "DELETE Product ID"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 280, 0, 0.0, 2758.510714285714, 898, 6537, 2222.0, 5211.6, 5677.8, 6269.51, 6.87960687960688, 16.82518811425061, 263.7066905328624], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET List Category", 20, 0, 0.0, 1271.7, 898, 1965, 1202.0, 1672.3, 1950.4999999999998, 1965.0, 5.790387955993052, 6.050503039953677, 0.9952229299363057], "isController": false}, {"data": ["GET Get Product ID", 20, 0, 0.0, 2226.3, 1880, 2645, 2211.5, 2552.1, 2640.6, 2645.0, 3.6913990402362495, 6.136590416205242, 0.6488787375415282], "isController": false}, {"data": ["GET Get List Offer", 20, 0, 0.0, 1386.0500000000002, 1106, 1711, 1399.0, 1605.6, 1705.75, 1711.0, 5.689900426742533, 6.263891358463726, 2.394870199146515], "isController": false}, {"data": ["GET Get Category ID", 20, 0, 0.0, 1757.3000000000002, 1552, 2070, 1732.5, 1986.6000000000001, 2066.1, 2070.0, 4.811161895597786, 3.44862581188357, 0.8363152513832091], "isController": false}, {"data": ["GET Get List Product", 20, 0, 0.0, 3188.4500000000003, 2559, 3417, 3242.5, 3409.9, 3416.7, 3417.0, 2.9828486204325126, 37.62234340044743, 0.6088040641312453], "isController": false}, {"data": ["POST Register User", 20, 0, 0.0, 3686.0499999999997, 2078, 5388, 3662.0, 5295.500000000001, 5385.3, 5388.0, 3.1801558276355544, 5.4516069724916525, 0.9720593496581333], "isController": false}, {"data": ["PUT Update Product ID", 20, 0, 0.0, 3292.9500000000007, 2987, 3589, 3300.0, 3498.7000000000003, 3584.7, 3589.0, 3.1660598385309484, 6.547158213946493, 841.8837561342409], "isController": false}, {"data": ["POST Create Offer", 20, 0, 0.0, 1957.1499999999999, 1571, 2243, 1967.5, 2226.2, 2242.25, 2243.0, 4.513653802753328, 13.358475795531483, 2.353799932295193], "isController": false}, {"data": ["POST Login User", 20, 0, 0.0, 5205.249999999999, 4689, 6101, 5198.0, 5828.9, 6087.4, 6101.0, 2.2650056625141564, 3.8850155719139297, 0.6392447621744054], "isController": false}, {"data": ["PUT Update Profile", 20, 0, 0.0, 5529.75, 4268, 6537, 5676.0, 6290.1, 6524.8, 6537.0, 2.1586616297895307, 2.9856567053426875, 288.1293637007555], "isController": false}, {"data": ["POST Create Product", 20, 0, 0.0, 2978.85, 2052, 3688, 3092.0, 3532.9, 3680.45, 3688.0, 3.226326826907566, 6.685648642926279, 431.26411517986776], "isController": false}, {"data": ["GET Get Profile", 20, 0, 0.0, 2931.3999999999996, 1183, 4762, 2962.5, 4757.6, 4761.9, 4762.0, 3.237293622531564, 4.470247248300421, 1.3309576319197152], "isController": false}, {"data": ["PUT Update Offer ID", 20, 0, 0.0, 1559.0, 1128, 2080, 1529.5, 1908.2, 2071.5499999999997, 2080.0, 5.149330587023687, 15.17845648815654, 2.484149716786818], "isController": false}, {"data": ["DELETE Product ID", 20, 0, 0.0, 1648.95, 1302, 2008, 1739.0, 1961.8, 2005.75, 2008.0, 4.571428571428572, 3.9339285714285714, 2.0044642857142856], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 280, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
