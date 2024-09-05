function openPopup() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = sheet.getActiveCell().getRow();
  var url = sheet.getRange(row, 5).getValue(); // Assumes the URL is in column B
  url =
    "https://script.google.com/macros/s/AKfycbwEVPbCCD4m9emXSFxU8t83AnUg6-UMULPJrxDf2fbikNZO7_unl2lnS0hb7LfMkl_WCA/exec?row=11";
  var html =
    '<html><body><script>window.open("' +
    url +
    '", "popup", "width=600,height=400");</script></body></html>';
  var ui = SpreadsheetApp.getUi();
  ui.showModalDialog(HtmlService.createHtmlOutput(html), "Opening popup...");
}
// Function to serve the HTML page

function doGet(e) {
  var template = HtmlService.createTemplateFromFile("Index");
  template.row = e.parameter.row || "2"; // Default to '2' if no row parameter
  return template
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Helper function to get the "Young Professionals" sheet
function getYoungProfessionalsSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("Sheet10");
  if (!sheet) {
    throw new Error("Sheet 'Young Professionals' not found");
  }
  return sheet;
}
function getRowData_old(row) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    "Young Professionals"
  );
  var data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  var result = {};
  for (var i = 0; i < headers.length; i++) {
    var cellValue = data[i];
    // Check if the cell value is a date
    if (Object.prototype.toString.call(cellValue) === "[object Date]") {
      // Format the date as needed, e.g., YYYY-MM-DD
      result[headers[i]] = Utilities.formatDate(
        cellValue,
        Session.getScriptTimeZone(),
        "yyyy-MM-dd"
      );
    } else {
      result[headers[i]] = cellValue;
    }
  }
  return result;
}
function getUserEmail() {
  return Session.getActiveUser().getEmail();
}
function checkPermissions(userEmail, rowRegion) {

  var permissionsSheet = SpreadsheetApp.openById('1thy4ovkwoT4vSUeH68hCutlRLK0b-YbRHmdg9aFnrcY').getSheetByName('Permissions');
  var permissionsData = permissionsSheet.getDataRange().getValues();
  var temp = permissionsData[2][1];
  for (var i = 1; i < permissionsData.length; i++) {
    if (permissionsData[i][1] === userEmail) {
      var allowedRegions = permissionsData[i][2].split(',').map(r => r.trim());
      if (allowedRegions.includes(rowRegion)) {
        return true;
      }
    }
  }
  return false;
}
function getRowData(row) {
  //Debuging logic so I can run in the debugger.
  if (typeof row === 'undefined') {
    row=2;
  // Variable is undefined
}
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Young Professionals");
  var data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Get the user's email
  var userEmail = getUserEmail();

  // Find the index of the "Region" column
  var regionIndex = headers.indexOf("Region");
  if (regionIndex === -1) {
    throw new Error("Region column not found");
  }

  // Get the region for the current row
  var rowRegion = data[regionIndex];
  // Check if the user has permission to access this row
  if (!checkPermissions(userEmail, rowRegion)) {
    throw new Error("You do not have permission to access this data. " + regionIndex);
  }

  var result = {};
  for (var i = 0; i < headers.length; i++) {
    var cellValue = data[i];
    //cellValue = rowRegion;
    // Check if the cell value is a date
    if (Object.prototype.toString.call(cellValue) === "[object Date]") {
      // Format the date as needed, e.g., YYYY-MM-DD
      result[headers[i]] = Utilities.formatDate(
        cellValue,
        Session.getScriptTimeZone(),
        "yyyy-MM-dd"
      );
    } else {
      result[headers[i]] = cellValue;
    }
  }
  return result;
}

function updateRowData(row, data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("YP Master");
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    if (data.hasOwnProperty(header)) {
      var value = data[header];
      // Convert date strings back to Date objects
      if (header.toLowerCase().includes("date") && value) {
        value = new Date(value);
      }
      sheet.getRange(row, i + 1).setValue(value);
    }
  }

  return true;
}

// Function to update a specific cell in a row
function updateSingleRowData(row, column, newValue) {
  var sheet = getYoungProfessionalsSheet();
  var rowNumber = parseInt(row, 10);
  var columnNumber = parseInt(column, 10);
  sheet.getRange(rowNumber, columnNumber).setValue(newValue);
  return "Update successful";
}

// Function to get all data from the sheet
function getAllData() {
  var sheet = getYoungProfessionalsSheet();
  var data = sheet.getDataRange().getValues();
  return data;
}

// Function to add a new row of data
function addNewRow(dataArray) {
  var sheet = getYoungProfessionalsSheet();
  sheet.appendRow(dataArray);
  return "New row added successfully";
}

// Function to delete a specific row
function deleteRow(row) {
  var sheet = getYoungProfessionalsSheet();
  var rowNumber = parseInt(row, 10);
  sheet.deleteRow(rowNumber);
  return "Row deleted successfully";
}
