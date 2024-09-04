function openPopup1(url, rowNum) {
  var html = '<html><body><script>window.open("' + url + rowNum + '", "popup", "width=600,height=400");</script></body></html>';
  var ui = SpreadsheetApp.getUi();
  ui.showModalDialog(HtmlService.createHtmlOutput(html), 'Opening popup...');
}
function openPopup() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = sheet.getActiveCell().getRow();
  var url = sheet.getRange(row, 5).getValue(); // Assumes the URL is in column B
url = "https://script.google.com/macros/s/AKfycbwEVPbCCD4m9emXSFxU8t83AnUg6-UMULPJrxDf2fbikNZO7_unl2lnS0hb7LfMkl_WCA/exec?row=11";
  var html = '<html><body><script>window.open("' + url + '", "popup", "width=600,height=400");</script></body></html>';
  var ui = SpreadsheetApp.getUi();
  ui.showModalDialog(HtmlService.createHtmlOutput(html), 'Opening popup...');
}
// Function to serve the HTML page

function doGetOld() {
  return HtmlService.createHtmlOutputFromFile('Index');
}
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  template.row = e.parameter.row || '2'; // Default to '2' if no row parameter
  return template.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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
function getRowData1(row) {
  Logger.log('Getting data for row: ' + row);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Young Professionals");
  var data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  return data;
}
function getRowData(row) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Young Professionals");
  var data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  var result = {};
  for (var i = 0; i < headers.length; i++) {
    var cellValue = data[i];
    // Check if the cell value is a date
    if (Object.prototype.toString.call(cellValue) === '[object Date]') {
      // Format the date as needed, e.g., YYYY-MM-DD
      result[headers[i]] = Utilities.formatDate(cellValue, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    } else {
      result[headers[i]] = cellValue;
    }
  }
  
  return result;
}
function updateRowDataBeforeAllowingforOnlyChangedFields(row, data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("YP Master");
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  var updateRange = sheet.getRange(row, 1, 1, headers.length);
  var updateValues = headers.map(function(header) {
    // Use the original header (with spaces) to access the data
    var value = data[header] || '';
    // Convert date strings back to Date objects
    if (header.toLowerCase().includes('date') && value) {
      return new Date(value);
    }
    return value;
  });
  
  updateRange.setValues([updateValues]);
  return true;
}
function updateRowData(row, data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("YP Master");
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    if (data.hasOwnProperty(header)) {
      var value = data[header];
      // Convert date strings back to Date objects
      if (header.toLowerCase().includes('date') && value) {
        value = new Date(value);
      }
      sheet.getRange(row, i + 1).setValue(value);
    }
  }
  
  return true;
}
function updateRowDataBeforChangingForHeaderSpaces(row, data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("YP Master");
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  var updateRange = sheet.getRange(row, 1, 1, headers.length);
  var updateValues = headers.map(function(header) {
    var value = data[header.replace(/\s+/g, '_')] || '';
    // Convert date strings back to Date objects
    if (header.toLowerCase().includes('date') && value) {
      return new Date(value);
    }
    return value;
  });
  
  updateRange.setValues([updateValues]);
  return true;
}
// Function to get data from a specific row
function getRowDataOld(row) {
  //row = 5;
  var sheet = getYoungProfessionalsSheet();
  var rowNumber = parseInt(row, 10);
  var data = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  return data;
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