/**
 * Visualize the results of an API call to the FDA.
 */
component.visualization = function () {
  component.apply(this, arguments);
};
assessment.extend(component.visualization, component);

/**
 * Function to create a visualization component for fetching drug information
 *
 * @param {HTMLElement} parent - The parent element to append the visualization component
 */
component.visualization.prototype.decorate = function (parent) {
  const self = this;

  const container = document.createElement("div");
  container.className = "container";
  parent.appendChild(container);

  // Introductory text
  const introText = document.createElement("p");
  introText.textContent =
    "Enter drug names to create a list. Once you're ready, you can fetch detailed information for the drugs added.";
  container.appendChild(introText);

  const inputContainer = document.createElement("div");
  inputContainer.className = "input-container";
  container.appendChild(inputContainer);

  // Input to add drugs
  const drugInput = document.createElement("input");
  drugInput.type = "text";
  drugInput.placeholder = "Enter drug name...";
  inputContainer.appendChild(drugInput);

  // Add button
  const addButton = document.createElement("button");
  addButton.innerText = "Add Drug";
  addButton.addEventListener("click", function () {
    const drugName = drugInput.value.trim();
    if (drugName) {
      const listItem = document.createElement("li");
      listItem.textContent = drugName;
      drugList.appendChild(listItem);
      drugInput.value = ""; // Clear the input after adding
    }
  });
  inputContainer.appendChild(addButton);

  // List for drug names
  const drugList = document.createElement("ul");
  drugList.className = "drug-list";
  container.appendChild(drugList);

  // Submit button
  const submitButton = document.createElement("button");
  submitButton.innerText = "Get Drug Info";
  submitButton.addEventListener("click", function () {
    const drugs = Array.from(drugList.children).map((item) => item.textContent);
    drugs.forEach((drugName) => self.fetchDrugData(drugName, container));
  });
  container.appendChild(submitButton);
};

/**
 * Function to fetch drug data from multiple APIs
 *
 * @param {string} drugName - The name of the drug
 * @param {string} container - The container to store the data
 */
component.visualization.prototype.fetchDrugData = function (
  drugName,
  container
) {
  this.data = this.data || {};
  this.data[drugName] = this.data[drugName] || {};

  let finishedApiCalls = 0;
  const totalApiCalls = 3;

  const checkAllDataFetched = () => {
    finishedApiCalls++;
    if (finishedApiCalls === totalApiCalls) {
      this.decorate_data(container);
    }
  };

  // Fetch drug labeling by brand name
  const labelApiUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drugName}"&limit=1`;
  console.log("Label API URL:", labelApiUrl);
  assessment.fda_api(
    labelApiUrl,
    function (data) {
      if (data && data.length > 0) {
        this.data[drugName].labeling = data[0];
      } else {
        this.data[drugName].labeling = "No data found for " + drugName;
      }
      checkAllDataFetched();
    }.bind(this)
  );

  // Save data
  this.fetchAdverseEvents(
    drugName,
    function (data) {
      this.data[drugName].adverseEvents = data;
      checkAllDataFetched();
    }.bind(this)
  );
  this.fetchRecallFrequency(
    drugName,
    function (data) {
      this.data[drugName].recallFrequency = data;
      checkAllDataFetched();
    }.bind(this)
  );
};

/**
 * Function to fetch adverse events for a given drug name
 *
 * @param {string} drugName - The name of the drug
 * @param {function} callback - The callback function to be executed after the data is fetched
 */
component.visualization.prototype.fetchAdverseEvents = function (
  drugName,
  callback
) {
  const apiUrl = `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:${drugName}&count=patient.reaction.reactionmeddrapt.exact`;
  console.log("Adverse Events API URL:", apiUrl);
  assessment.fda_api(apiUrl, function (data) {
    console.log(`Adverse Events for ${drugName}:`, data);
    callback(data);
  });
};

/**
 * Function to fetch the recall frequency of a drug from the FDA API
 *
 * @param {string} drugName - The name of the drug
 * @param {function} callback - The callback function to be executed after the API call
 */
component.visualization.prototype.fetchRecallFrequency = function (
  drugName,
  callback
) {
  const apiUrl = `https://api.fda.gov/drug/enforcement.json?search=product_description:${drugName}&count=report_date`;

  assessment.fda_api(apiUrl, function (data) {
    console.log(`Recall Frequency for ${drugName}:`, data);
    callback(data);
  });
};

/**
 * Function to decorate the data for visualization
 *
 * @param {HTMLElement} parent - The parent element to append the visualization to
 * @param {Object} drugData - The data to be visualized
 */
component.visualization.prototype.decorate_data = function (parent) {
  const drugData = this.data;

  // Clear the container
  parent.innerHTML = "";

  const cardsContainer = document.createElement("div");
  cardsContainer.className = "cards-container";
  parent.appendChild(cardsContainer);

  for (let drugName in drugData) {
    const data = drugData[drugName];
    const card = document.createElement("div");
    card.className = "drug-card";
    cardsContainer.appendChild(card);

    // Display card title
    const cardTitle = document.createElement("h2");
    cardTitle.textContent = drugName;
    card.appendChild(cardTitle);

    // Display basic drug information
    appendHeaderInfo(
      card,
      "Brand Name",
      data.labeling.openfda &&
        data.labeling.openfda.brand_name &&
        data.labeling.openfda.brand_name[0]
    );
    appendHeaderInfo(
      card,
      "Manufacturer Name",
      data.labeling.openfda &&
        data.labeling.openfda.manufacturer_name &&
        data.labeling.openfda.manufacturer_name[0]
    );
    appendAccordion(
      card,
      "Dosage and Administration",
      data.labeling.dosage_and_administration &&
        data.labeling.dosage_and_administration[0]
    );
    appendAccordion(
      card,
      "Do Not Use",
      data.labeling.do_not_use && data.labeling.do_not_use[0]
    );
    appendAccordion(
      card,
      "Warnings",
      data.labeling.warnings && data.labeling.warnings[0]
    );

    // Display adverse events (showing the top 5 as an example)
    if (data.adverseEvents) {
      const adverseEventsTitle = document.createElement("h3");
      adverseEventsTitle.textContent = "Top 5 Adverse Events";
      adverseEventsTitle.style.marginTop = "1em";
      card.appendChild(adverseEventsTitle);

      const adverseEventsDescription = document.createElement("p");
      adverseEventsDescription.textContent =
        "This chart displays the top 5 adverse events for this drug.";
      adverseEventsDescription.style.fontSize = "0.9em";
      adverseEventsDescription.style.color = "#555";
      card.appendChild(adverseEventsDescription);

      const adverseEventsContainer = document.createElement("div");
      adverseEventsContainer.className = "chart-container";
      card.appendChild(adverseEventsContainer); // Append to the card

      const downloadData = data.adverseEvents;

      const adverseEventsData = data.adverseEvents.slice(0, 5); // Taking top 5 for demonstration
      appendAIResponse(card, adverseEventsData, "Top 5 Adverse Events");
      drawBarChart(
        adverseEventsData,
        adverseEventsContainer,
        500,
        300,
        "Adverse Events",
        "Reaction",
        "Count"
      );
      const downloadButton = document.createElement("button");
      const downloadIcon = document.createElement("i");
      downloadIcon.className = "fas fa-download";
      downloadButton.appendChild(downloadIcon);
      downloadButton.appendChild(document.createTextNode("Download CSV"));
      downloadButton.addEventListener("click", function () {
        downloadCSV(downloadData, "Adverse Events " + drugName);
      });

      card.appendChild(downloadButton);
    }

    // Display recall frequency
    if (data.recallFrequency) {
      const recallFrequencyTitle = document.createElement("h3");
      recallFrequencyTitle.textContent = "Recall Frequency";
      card.appendChild(recallFrequencyTitle);

      const recallDescription = document.createElement("p");
      recallDescription.textContent =
        "This chart displays the frequency of recalls for this drug.";
      recallDescription.style.fontSize = "0.9em";
      recallDescription.style.color = "#555";
      card.appendChild(recallDescription);

      const recallFrequencyContainer = document.createElement("div");
      recallFrequencyContainer.className = "chart-container";
      card.appendChild(recallFrequencyContainer);

      const recallData = data.recallFrequency.map((item) => ({
        term: item.time,
        count: item.count,
      }));
      appendAIResponse(card, recallData, "Recall Frequency");
      drawBarChart(
        recallData,
        recallFrequencyContainer,
        500,
        300,
        "Recall Frequency",
        "Date",
        "Count",
        true
      );

      const downloadButton = document.createElement("button");
      const downloadIcon = document.createElement("i");
      downloadIcon.className = "fas fa-download";
      downloadButton.appendChild(downloadIcon);
      downloadButton.appendChild(document.createTextNode("Download CSV"));
      downloadButton.addEventListener("click", function () {
        downloadCSV(recallData, "Recall Frequency " + drugName);
      });

      card.appendChild(downloadButton);
    }
  }
};
