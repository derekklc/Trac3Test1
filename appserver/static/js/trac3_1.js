require(["jquery", "splunkjs/mvc", "splunkjs/mvc/simplexml/ready!"], function (
  $,
  mvc
) {
  $(document).ready(function () {
    riskSearchSection();
    navTabsClicking();
    riskTabsClicking();
  });

  function riskTabsClicking() {
    $(document).on("click", ".risk-tab > button", function () {
      $(".risk-tab .activeTab").removeClass("activeTab");
      $(this).addClass("activeTab");
    });
  }

  function navTabsClicking() {
    $(document).on("click", ".overviewTabSection > button", function () {
      $(".overviewTabSection button").removeClass("activeOverviewTab");
      $(this).addClass("activeOverviewTab");
    });
  }

  function riskSearchSection() {
    let riskSearch = mvc.Components.get("risk_map_search_1");
    if (riskSearch) {
      let riskResults = riskSearch.data("results");

      riskResults.on("data", function () {
        if (riskResults.data()) {
          let fields = riskResults.data().fields;
          let rows = riskResults.data().rows;

          let likelihoodIndex = fields.indexOf("likelihood");
          let severityIndex = fields.indexOf("severity");

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
    let section_1 = `
      <div class="risk-tab">
        <button
          class="tablinks activeTab"
          id="defaultOpen"
        >
          Risk Summary
        </button>
        <button class="tablinks" onclick="openTab(event, 'InherentRisk')">
          Inherent Risk
        </button>
        <button class="tablinks" onclick="openTab(event, 'ResidualRisk')">
          Residual Risk
        </button>
        <button class="tablinks" onclick="openTab(event, 'TStateRisk')">
          Target State Risk
        </button>
      </div>
    `;

    let section_2 = `
      <div class="column1">
      <p class="risk-legend">High</p>
      <div class="riskmap-container">`;
    for (let rect of riskArray) {
      section_2 += `<div class="risk-block ${mapColor(rect)}" >2</div>`;
    }
    section_2 += `
      </div>
          <div class="risk-bottom-legend">
          <p>Low</p>
          <p>High</p>
      </div>
    </div>`;

    $("#trac3_risk_map_container").append(section_2);

    let section_3 = `
      <div class="column2">
        <p class="heading">Risk Levels </p>
        <p class="percentage-text text_red">6 
        <span class="percentage text_red">%</p>
        <p>Unacceptable</p>
        
        <p class="percentage-text text_yellow">20 
        <span class="percentage text_yellow">%</p>
        <p>Undesirable</p>

        <p class="percentage-text text_green">23 
        <span class="percentage text_green">%</p>
        <p>Tolerable</p>

        <p class="percentage-text text_blue">50 
        <span class="percentage text_blue">%</p>
        <p>Broadly Acceptable</p>
      </div>
    `;

    $("#trac3_risk_map_container").empty().append(`
      ${section_1}
      <div id="riskMapColumns">
        ${section_2}
        ${section_3}
      </div>
    `);

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
