let xmltvOutputData;

function handleFileInput(event) {
  const fileInput = event.target;
  const file = fileInput.files[0];

  if (file) {
    excelToXML(file)
      .then(data => {
        xmltvOutputData = convertToXMLTV(data);
        displayXMLTVData(xmltvOutputData); // Display XML data on the webpage
        enableDownloadLink(xmltvOutputData);
      })
      .catch(error => {
        console.error("Error reading Excel file:", error);
      });
  }
}

function excelToXML(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const xmlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
      resolve(xmlData);
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
}

function convertToXMLTV(data) {
  let xmltvData = `<?xml version="1.0" encoding="UTF-8"?>
<tv generator-info-name="OTTera">
  <channel id="zee_zb_11">
    <display-name lang="en"> Channel Name</display-name>
    <icon src= "URL for channel logo"/>
  </channel>`;
  // Skip the header row (starting from 1st row)
  for (let i = 1; i < data.length; i++) {
    const startTime = parseInt(data[i][0]);
    const endTime = parseInt(data[i][1]);
    const assetID = data[i][2];
    const title = data[i][3]; // corrected from data [i][5] to data[i][5]
    const  description = data[i][4];
    xmltvData += `<programme start="${startTime}" stop="${endTime}" channel="zee_zb_11">\n`;
    xmltvData += `<title lang="en">${title}</title>\n`; // removed unnecessary quotes around title
    xmltvData += `desc lang="en">${description}</desc>\n`;
    xmltvData += `<category lang="en">Series</category> \n`;
    xmltvData += `<icon src="" width="3840" height="2160"/>\n`;
    xmltvData += `<episode-num system="assetID">${assetID}</episode-num>\n`;
    xmltvData += `<video>\n<aspect/>\n<quality/>\n</video>\n</programme>\n`;
  }

  xmltvData += '</tv>';
  return xmltvData;
}

function displayXMLTVData(xmltvData) {
  const xmltvOutput = document.getElementById('xmltvOutputData');
  xmltvOutput.textContent = xmltvData;
}

function enableDownloadLink(xmltvData) {
  const downloadLink = document.getElementById('downloadLink');
  downloadLink.style.display = 'block';

  downloadLink.addEventListener('click', function () {
    const blob = new Blob([xmltvData], { type: 'application/xml' });
    const currentDate = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
    const fileName = `EPG_file_${currentDate}.xml`;
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
  });
}
