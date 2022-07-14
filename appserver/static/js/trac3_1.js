require(["jquery", "splunkjs/mvc", "splunkjs/mvc/simplexml/ready!"], function (
  $,
  mvc
) {
  let riskSearch = mvc.Components.get("risk_map_search_1");
  if (riskSearch) {
    let riskResults = riskSearch.data("results");

    riskResults.on("data", function () {
      if (riskResults.data()) {
        let fields = riskResults.data().fields;
        let rows = riskResults.data().rows;
        // console.log("check risk result: fields:", fields, "::rows::", rows);

        let likelihoodIndex = fields.indexOf("likelihood");
        let severityIndex = fields.indexOf("severity");

        // console.log(
        //   "likelihoodIndex: ",
        //   likelihoodIndex,
        //   "::severityIndex::",
        //   severityIndex
        // );

        if (likelihoodIndex != -1 && severityIndex != -1) {
          let rowData = rows[0];
          if (rowData[likelihoodIndex] && rowData[severityIndex]) {
            let likelihoodArray = rowData[likelihoodIndex].split(":::");
            let severityArray = rowData[severityIndex].split(":::");
            let riskArray = getRiskArray(likelihoodArray, severityArray);
            plotRiskMap(riskArray);
          }
        }
      }
    });
  }

  function getRiskArray(likelihoodArray, severityArray) {
    const sevLib = {
      sev_1: 1,
      sev_2: 2,
      sev_3: 3,
      sev_4: 4,
      sev_5: 5,
      sev_6: 6,
      sev_7: 7,
    };

    const probLib = {
      prob_1: 1,
      prob_2: 2,
      prob_3: 3,
      prob_4: 4,
      prob_5: 5,
      prob_6: 6,
      prob_7: 7,
      prob_8: 8,
    };

    let mapRects = [];
    if (
      likelihoodArray &&
      severityArray &&
      likelihoodArray.length &&
      severityArray.length
    ) {
      for (let prob of likelihoodArray) {
        let probNumber = probLib[prob];
        if (probNumber != undefined) {
          for (let severity of severityArray) {
            let sevNumber = sevLib[severity];
            if (sevNumber) {
              mapRects.push(probNumber + sevNumber);
            }
          }
        }
      }
      console.log("check mapRects: ", mapRects);
    }
    return mapRects;
  }

  function plotRiskMap(riskArray) {
    let html = `
        <div class="riskmap-container">
    `;

    for (let rect of riskArray) {
      html += `<div class="risk-block ${mapColor(rect)}" ></div>`;
    }

    html += `</div>`;

    // console.log("HTML: ", html);

    $("#trac3_risk_map_container").empty().append(html);

    function mapColor(colorCode) {
      let colorClass = "";
      if (colorCode != undefined) {
        switch (true) {
          case colorCode >= 0 && colorCode <= 3:
            colorClass = "risk-level-1";
            break;
          case colorCode > 3 && colorCode <= 5:
            colorClass = "risk-level-2";
            break;
          case colorCode > 5 && colorCode <= 8:
            colorClass = "risk-level-4";
            break;
          case colorCode > 8 && colorCode <= 12:
            colorClass = "risk-level-4";
            break;
          default:
            colorClass = "risk-level-0";
            break;
        }
      }
      return colorClass;
    }
  }
});
