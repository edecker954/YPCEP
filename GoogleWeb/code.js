var SHEET_NAME = "Young Professionals";
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
function doGet(e) {
  var template = HtmlService.createTemplateFromFile("Index");
  template.entryId = e && e.parameter && e.parameter.entryId ? e.parameter.entryId : "332";

  var result = getData(template.entryId);

  template.hasPermission = result.hasPermission;
  template.userEmail = result.userEmail;
  template.rowRegion = result.rowRegion;
  template.errorMessage = result.hasPermission ? "" : "Entry ID:" + template.entryId + " not found or no permission";

  var htmlOutput = template.evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return htmlOutput;
}
function doGet1(e) {
  var template = HtmlService.createTemplateFromFile("Index");
  
  // Only set the entryId if provided
  if (e && e.parameter && e.parameter.entryId) {
    template.entryId = e.parameter.entryId;
  } else {
    template.entryId = "332"; // Default EntryID
  }
  var userEmail = Session.getActiveUser().getEmail();
  var htmlOutput = template.evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return htmlOutput;
}
function doGet2(e) {
  var template = HtmlService.createTemplateFromFile("Index");
  
  if (typeof e === 'undefined' || !e || !e.parameter || !e.parameter.entryId) {
    template.entryId = "332"; // Default EntryID if e is undefined or doesn't contain the expected parameter
  } else {
    template.entryId = e.parameter.entryId;
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var entryIdIndex = headers.indexOf("Entry ID");
  var regionIndex = headers.indexOf("Region");

  // Use getRange().createTextFinder() to find the row with the matching Entry ID
  var textFinder = sheet.getRange(2, entryIdIndex + 1, sheet.getLastRow() - 1, 1).createTextFinder(template.entryId);
  var foundRange = textFinder.findNext();

  if (foundRange) {
    var rowData = sheet.getRange(foundRange.getRow(), 1, 1, sheet.getLastColumn()).getValues()[0];
    var rowRegion = rowData[regionIndex];
    var userEmail = Session.getActiveUser().getEmail();
    var hasPermission = checkPermissions(userEmail, rowRegion);

    template.userEmail = userEmail;
    template.rowRegion = rowRegion;
    //template.hasPermission = true;
    template.hasPermission = hasPermission;

    template.errorMessage = "";
  } else {
    template.hasPermission = false;
    template.userEmail = userEmail;
    template.rowRegion = "Not Found";
    template.hasPermission = false;
    template.errorMessage = "Entry ID:" + template.entryId + " not found";
  }
var myTemplate = template.evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return myTemplate;
}
function getData2(entryId, fullSheet = false) {
  entryId = 333;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var entryIdIndex = headers.indexOf("Entry ID");
  var regionIndex = headers.indexOf("Region");

  if (fullSheet) {
    return { headers: headers, data: data.slice(1) };
  }

  if (typeof entryId === 'undefined') {
    throw new Error("Entry ID is required for single row retrieval");
  }

  var rowData = data.find(row => row[entryIdIndex] == entryId);
  if (!rowData) {
    throw new Error("Entry ID not found");
  }

  var userEmail = Session.getActiveUser().getEmail();
  var rowRegion = rowData[regionIndex];
  var hasPermission = checkPermissions(userEmail, rowRegion);

  if (!hasPermission) {
    return { hasPermission: false, userEmail: userEmail, rowRegion: rowRegion };
  }

  var result = {
    hasPermission: true,
    userEmail: userEmail,
    rowRegion: rowRegion,
    data: {
      rowNumber: rowIndex + 1 // Adding 1 because array index is 0-based, but sheet rows are 1-based
    }
  };

  for (var i = 0; i < headers.length; i++) {
    var cellValue = rowData[i];
    if (Object.prototype.toString.call(cellValue) === "[object Date]") {
      result.data[headers[i]] = Utilities.formatDate(
        cellValue, Session.getScriptTimeZone(), "yyyy-MM-dd"
      );
    } else {
      result.data[headers[i]] = cellValue;
    }
  }

  return result;
}
function getData(entryId, fullSheet = false) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var entryIdIndex = headers.indexOf("Entry ID");
  var regionIndex = headers.indexOf("Region");

  if (fullSheet) {
    return { headers: headers, data: data.slice(1) };
  }

  if (typeof entryId === 'undefined') {
    throw new Error("Entry ID is required for single row retrieval");
  }

  var rowIndex = data.findIndex(row => row[entryIdIndex] == entryId);
  if (rowIndex === -1) {
    throw new Error("Entry ID not found");
  }

  var rowData = data[rowIndex];
  var userEmail = Session.getActiveUser().getEmail();
  var rowRegion = rowData[regionIndex];
  var hasPermission = checkPermissions(userEmail, rowRegion);

  if (!hasPermission) {
    return { hasPermission: false, userEmail: userEmail, rowRegion: rowRegion };
  }

  var result = {
    hasPermission: true,
    userEmail: userEmail,
    rowRegion: rowRegion,
    data: {
      rowNumber: rowIndex + 1 // Adding 2 because array index is 0-based, sheet rows are 1-based, and we have a header row
    }
  };

  for (var i = 0; i < headers.length; i++) {
    var cellValue = rowData[i];
    if (Object.prototype.toString.call(cellValue) === "[object Date]") {
      result.data[headers[i]] = Utilities.formatDate(
        cellValue, Session.getScriptTimeZone(), "yyyy-MM-dd"
      );
    } else {
      result.data[headers[i]] = cellValue;
    }
  }

  return result;
}
function getRowData(entryId) {
  if (typeof entryId === 'undefined') {
    //throw new Error("Entry ID is required");
    entryId = 333;
  }
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var entryIdIndex = headers.indexOf("Entry ID");
  
  if (entryIdIndex === -1) {
    throw new Error("Entry ID column not found");
  }
  
  var rowData = data.find(row => row[entryIdIndex] == entryId);
  
  if (!rowData) {
    throw new Error("Entry ID not found");
  }
  
  var userEmail = getUserEmail();
  var regionIndex = headers.indexOf("Region");
  var rowRegion = rowData[regionIndex];
  
  if (!checkPermissions(userEmail, rowRegion)) {
    return null;
  }
  
  var result = {};
  for (var i = 0; i < headers.length; i++) {
    var cellValue = rowData[i];
    if (Object.prototype.toString.call(cellValue) === "[object Date]") {
      result[headers[i]] = Utilities.formatDate(
        cellValue, Session.getScriptTimeZone(), "yyyy-MM-dd"
      );
    } else {
      result[headers[i]] = cellValue;
    }
  }
  return result;
}
function getRowDataOld(entryId) {
  if (typeof entryId === 'undefined') {
    throw new Error("Entry ID is required");
  }
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var entryIdIndex = headers.indexOf("Entry ID");
  
  if (entryIdIndex === -1) {
    throw new Error("Entry ID column not found");
  }
  
  var rowData = data.find(row => row[entryIdIndex] == entryId);
  
  if (!rowData) {
    throw new Error("Entry ID not found");
  }
  
  var userEmail = getUserEmail();
  var regionIndex = headers.indexOf("Region");
  var rowRegion = rowData[regionIndex];
  
  if (!checkPermissions(userEmail, rowRegion)) {
    return null;
  }
  
  var result = {};
  for (var i = 0; i < headers.length; i++) {
    var cellValue = rowData[i];
    if (Object.prototype.toString.call(cellValue) === "[object Date]") {
      result[headers[i]] = Utilities.formatDate(
        cellValue, Session.getScriptTimeZone(), "yyyy-MM-dd"
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
function updateRowData1(entryId, data) { 
    var rowData = getData(entryId);
    var rowIndex = rowData.data.rowNumber;
  if (!rowData.hasPermission) {
    throw new Error("No permission to update this row");
  }
  
  if (rowIndex === -1) {
    throw new Error("Entry ID not found");
  }
  
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    if (data.hasOwnProperty(header)) {
      var value = data[header];
      if (header.toLowerCase().includes("date") && value) {
        value = new Date(value);
      }
      sheet.getRange(rowIndex + 1, i + 1).setValue(value);
    }
  }
  return true;
}
function updateRowData(entryId, data) { 
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var entryIdIndex = headers.indexOf("Entry ID");
  var allData = sheet.getDataRange().getValues();
  var rowIndex = allData.findIndex(row => row[entryIdIndex] == entryId);

  if (rowIndex === -1) {
    throw new Error("Entry ID not found");
  }
  
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    if (data.hasOwnProperty(header)) {
      var value = data[header];
      if (header.toLowerCase().includes("date") && value) {
        value = new Date(value);
      }
      sheet.getRange(rowIndex + 1, i + 1).setValue(value);
    }
  }
  return true;
}
function updateSingleRowData(entryId, columnName, newValue) {
  if (typeof entryId === 'undefined') {
    entryId = 333;
    columnName = "Region";
    newValue = "Unknown";
  }
var rowData = getData(entryId);
  if (!rowData.hasPermission) {
    throw new Error("No permission to update this row");
  }
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var entryIdIndex = headers.indexOf("Entry ID");
  var columnIndex = headers.indexOf(columnName);

  if (rowData.data.rowNumber === -1 || columnIndex === -1) {
    throw new Error("Entry ID or column not found");
  }

  var entryIdColumn = sheet.getRange(2, entryIdIndex + 1, sheet.getLastRow() - 1, 1).getValues();
  var rowIndex = rowData.data.rowNumber;//entryIdColumn.findIndex(row => row[0] == entryId);

  if (rowIndex === -1) {
    throw new Error("Entry ID not found");
  }

 

  // Update the cell
  sheet.getRange(rowIndex , columnIndex + 1).setValue(newValue);
  return "Update successful";
}
function updateSingleRowData2(entryId, columnName, newValue) {
    if (typeof entryId === 'undefined') {
        entryId = 333;
        column = 4;
        newValue = "Unknown";
    }
     var rowData = getData(entryId);
  if (!rowData.hasPermission) {
    throw new Error("No permission to update this row");
  }
  
  if (entryIdIndex === -1 || columnIndex === -1) {
    throw new Error("Entry ID or column not found");
  }
  
  var allData = sheet.getDataRange().getValues();
  var rowIndex = allData.findIndex(row => row[entryIdIndex] == entryId);
  
  if (rowIndex === -1) {
    throw new Error("Entry ID not found");
  }
  
  sheet.getRange(rowIndex + 1, columnIndex + 1).setValue(newValue);
  return "Update successful";
}
function updateSingleRowData1(entryId, columnName, newValue) {
    if (typeof entryId === 'undefined') {
        entryId = 2;
        column = 4;
        newValue = "Unknown";
    }
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var entryIdIndex = headers.indexOf("Entry ID");
  var columnIndex = headers.indexOf(columnName);
  
  if (entryIdIndex === -1 || columnIndex === -1) {
    throw new Error("Entry ID or column not found");
  }
  
  var allData = sheet.getDataRange().getValues();
  var rowIndex = allData.findIndex(row => row[entryIdIndex] == entryId);
  
  if (rowIndex === -1) {
    throw new Error("Entry ID not found");
  }
  
  sheet.getRange(rowIndex + 1, columnIndex + 1).setValue(newValue);
  return "Update successful";
}
// Function to update a specific cell in a row

// Function to get all data from the sheet
function getAllData() {
  return getData(undefined, true);
}
function getAllData1() {
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

