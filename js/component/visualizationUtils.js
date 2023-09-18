// TODO: REPLACE WITH YOUR API KEY
OPENAI_API_KEY = "TOKEN";

/**
 * Function to append header information to a parent element
 *
 * @param {HTMLElement} parent - The parent element to append the header to
 * @param {string} title - The title of the header
 * @param {string} content - The content of the header
 */
function appendHeaderInfo(parent, title, content) {
  if (content) {
    const headerDiv = document.createElement("div");
    headerDiv.className = "header-info";
    headerDiv.innerHTML = `<strong>${title}:</strong> ${content}`;
    parent.appendChild(headerDiv);
  }
}

/**
 * Function to append an accordion element to a parent element
 *
 * @param {HTMLElement} parent - The parent element to append the accordion to
 * @param {string} title - The title of the accordion
 * @param {string} content - The content of the accordion
 */
function appendAccordion(parent, title, content) {
  if (content) {
    const accordionWrapper = document.createElement("div");
    accordionWrapper.className = "accordion-wrapper";

    const accordionTitle = document.createElement("div");
    accordionTitle.className = "accordion-title";
    accordionTitle.innerHTML = `<span>${title}</span> <span>+</span>`;
    accordionWrapper.appendChild(accordionTitle);

    const accordionContent = document.createElement("div");
    accordionContent.className = "accordion-content";
    const formattedContent = content.replace(/(?:\r\n|\r|\n)/g, "<br>");
    accordionContent.innerHTML = formattedContent;
    accordionWrapper.appendChild(accordionContent);

    accordionTitle.addEventListener("click", function () {
      const isOpen = accordionContent.style.display === "block";
      accordionContent.style.display = isOpen ? "none" : "block";
      accordionTitle.querySelector("span:last-child").innerText = isOpen
        ? "+"
        : "-";
    });

    parent.appendChild(accordionWrapper);
  }
}

/**
 * Function to append an AI response to a parent element
 *
 * @param {HTMLElement} parent - The parent element to append the response to
 * @param {Object[]} data - An array of objects containing the data to summarize
 * @param {string} title - The title of the data
 */
function appendAIResponse(parent, data, title) {
  const responseContainer = document.createElement("div");
  responseContainer.className = "ai-response";

  const responseTitle = document.createElement("h3");
  responseTitle.textContent = "AI Interpretation";
  responseContainer.appendChild(responseTitle);

  // Temporary loading message
  const loadingMessage = document.createElement("p");
  loadingMessage.textContent = "Generating summary... Please wait.";
  responseContainer.appendChild(loadingMessage);
  parent.appendChild(responseContainer);

  // Make API call to OpenAI
  const request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (this.readyState == 4) {
      //   responseContainer.innerHTML = "";
      responseContainer.removeChild(loadingMessage);
      if (this.status == 200) {
        const json = JSON.parse(this.responseText);
        const responseText = json.choices[0].message.content;
        if (responseText) {
          const responseParagraph = document.createElement("p");
          formattedParagraph = responseText.replace(/(?:\r\n|\r|\n)/g, "<br>");
          responseParagraph.innerHTML = formattedParagraph;
          responseContainer.appendChild(responseParagraph);
        } else {
          console.error("Unexpected API response:", this.responseText);
        }
      } else {
        console.error("API request failed:", this.status, this.statusText);
        const responseParagraph = document.createElement("p");
        responseParagraph.textContent =
          "Check for OPENAI_API_KEY in js/component/visualizationUtils.js";
        responseContainer.appendChild(responseParagraph);
      }
    }
  };

  // Format the data for the API call
  const formattedData = data
    .map((item) => item.term + " (" + item.count + ")")
    .join(", ");
  request.open("POST", "https://api.openai.com/v1/chat/completions", true);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Authorization", "Bearer " + OPENAI_API_KEY);
  request.send(
    JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful specialist for FDA data.",
        },
        {
          role: "user",
          content:
            "Please shortly summarize and analyze the data for " +
            title +
            ". Here is the data: " +
            formattedData,
        },
      ],
    })
  );
  parent.appendChild(responseContainer);
}

/**
 * Function to download a CSV file from an array of data
 *
 * @param {Array} data - An array of objects containing the data to be downloaded
 * @param {string} name - The name of the file to be downloaded
 */
function downloadCSV(data, name) {
  const csv = data
    .map((item) => item.term + "," + item.count)
    .join("\n")
    .trim();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", name + ".csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
