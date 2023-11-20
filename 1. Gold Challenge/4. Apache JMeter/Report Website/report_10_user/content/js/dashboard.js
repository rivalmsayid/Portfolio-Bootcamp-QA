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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.07142857142857142, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.35, 500, 1500, "GET List Category"], "isController": false}, {"data": [0.0, 500, 1500, "GET Get Product ID"], "isController": false}, {"data": [0.0, 500, 1500, "GET Get List Offer"], "isController": false}, {"data": [0.4, 500, 1500, "GET Get Category ID"], "isController": false}, {"data": [0.05, 500, 1500, "GET Get List Product"], "isController": false}, {"data": [0.0, 500, 1500, "POST Register User"], "isController": false}, {"data": [0.0, 500, 1500, "PUT Update Product ID"], "isController": false}, {"data": [0.0, 500, 1500, "POST Create Offer"], "isController": false}, {"data": [0.0, 500, 1500, "POST Login User"], "isController": false}, {"data": [0.0, 500, 1500, "PUT Update Profile"], "isController": false}, {"data": [0.0, 500, 1500, "POST Create Product"], "isController": false}, {"data": [0.1, 500, 1500, "GET Get Profile"], "isController": false}, {"data": [0.0, 500, 1500, "PUT Update Offer ID"], "isController": false}, {"data": [0.1, 500, 1500, "DELETE Product ID"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 140, 0, 0.0, 2310.257142857143, 716, 4270, 2464.5, 3316.5000000000005, 3524.0499999999997, 4208.09, 4.160846435046215, 10.176253176360449, 159.4958433329866], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET List Category", 10, 0, 0.0, 1157.1999999999998, 894, 1526, 1000.5, 1524.4, 1526.0, 1526.0, 3.746721618583739, 3.9150313787935556, 0.6439677781940801], "isController": false}, {"data": ["GET Get Product ID", 10, 0, 0.0, 1966.3999999999999, 1554, 2579, 1856.5, 2577.5, 2579.0, 2579.0, 1.8705574261129816, 3.1079750046763936, 0.3288089225589226], "isController": false}, {"data": ["GET Get List Offer", 10, 0, 0.0, 2667.2999999999993, 2531, 2839, 2657.5, 2833.3, 2839.0, 2839.0, 1.557389814670612, 1.717387283912163, 0.6555029395732752], "isController": false}, {"data": ["GET Get Category ID", 10, 0, 0.0, 1167.4, 869, 1886, 948.0, 1876.7, 1886.0, 1886.0, 3.3025099075297226, 2.367228781373844, 0.574069105019815], "isController": false}, {"data": ["GET Get List Product", 10, 0, 0.0, 1870.4, 1402, 2119, 1875.5, 2118.8, 2119.0, 2119.0, 2.403846153846154, 30.31944861778846, 0.49062875600961536], "isController": false}, {"data": ["POST Register User", 10, 0, 0.0, 3050.1, 2744, 3376, 3106.5, 3370.5, 3376.0, 3376.0, 2.3386342376052385, 4.0090220123947615, 0.7148364417680075], "isController": false}, {"data": ["PUT Update Product ID", 10, 0, 0.0, 2374.6, 2020, 2792, 2345.5, 2781.2, 2792.0, 2792.0, 2.0885547201336676, 4.322941141917293, 555.3948347431077], "isController": false}, {"data": ["POST Create Offer", 10, 0, 0.0, 2581.0, 2007, 2887, 2623.0, 2875.8, 2887.0, 2887.0, 1.6957775139901645, 5.011817449550619, 0.8843214770222146], "isController": false}, {"data": ["POST Login User", 10, 0, 0.0, 2836.9, 2449, 3451, 2698.0, 3433.5, 3451.0, 3451.0, 2.1079258010118043, 3.6116756033937607, 0.5949126528246206], "isController": false}, {"data": ["PUT Update Profile", 10, 0, 0.0, 3650.5, 3338, 4270, 3607.5, 4254.9, 4270.0, 4270.0, 1.5515903801396431, 2.146164662529092, 207.11640564390999], "isController": false}, {"data": ["POST Create Product", 10, 0, 0.0, 3038.4999999999995, 2600, 3487, 3024.0, 3465.8, 3487.0, 3487.0, 1.989258006763477, 4.128098890988661, 265.8806507360255], "isController": false}, {"data": ["GET Get Profile", 10, 0, 0.0, 1984.4, 1018, 2460, 2147.5, 2441.9, 2460.0, 2460.0, 2.540650406504065, 3.507784711636179, 1.0445447472052847], "isController": false}, {"data": ["PUT Update Offer ID", 10, 0, 0.0, 2388.5, 1722, 2767, 2473.0, 2766.6, 2767.0, 2767.0, 1.8552875695732838, 5.476359577922079, 0.8950313079777366], "isController": false}, {"data": ["DELETE Product ID", 10, 0, 0.0, 1610.3999999999999, 716, 2590, 1690.5, 2515.6000000000004, 2590.0, 2590.0, 2.469745616201531, 2.117613917016547, 1.0829255680414915], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 140, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
