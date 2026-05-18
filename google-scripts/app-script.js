// --- CONFIGURATION ---
// This is the ID of your Google Sheet. It's the long string in the URL.
const SPREADSHEET_ID = '1ODDMIDvNk-qJDTn4pIpJTBN_Oj0d58QlF_xW0swmisw';

// This is the ID of the calendar you want to use.
const CALENDAR_ID = 'vrattno@gmail.com';

/**
 * Handles GET requests. This is useful for a quick check to see if the script is deployed and running.
 */
function doGet(e) {
  return ContentService.createTextOutput("Hello! The Personal Log Apps Script is running correctly.");
}

/**
 * Handles POST requests from your web form.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No data received in POST request.");
    }
    const formData = JSON.parse(e.postData.contents);
    
    Logger.log('Received data: ' + JSON.stringify(formData, null, 2));

    appendToGoogleSheet(formData);
    createEventsAndTasks(formData); // This function now handles both events and tasks

    return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Data logged successfully' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doPost: ' + error.stack);
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Error processing request: ' + error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Appends a new row to the configured Google Sheet.
 */
function appendToGoogleSheet(data) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheets()[0];  
  
  const dateTime = data.taskDateTime ? new Date(data.taskDateTime) : null;
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowData = headers.map(h => {
    const header = h.toLowerCase().trim();
    switch (header) {
      case 'task name':
        return data.taskName || '';
      case 'date':
        return dateTime ? dateTime.toISOString().slice(0, 10) : '';
      case 'time':
        return !data.isAllDay && dateTime ? dateTime.toISOString().slice(11, 16) : '';
      case 'all-day event':
        return data.isAllDay ? 'Yes' : 'No';
      case 'is a race?':
        return data.isARace ? 'Yes' : 'No';
      case 'description':
        return data.description || '';
      case 'submission timestamp':
        return new Date();
      default:
        return '';
    }
  });

  sheet.appendRow(rowData);
  Logger.log('Data successfully appended to Google Sheet.');
}

/**
 * Creates events in Google Calendar and tasks in Google Tasks based on the form data.
 */
function createEventsAndTasks(data) {
  if (!data.taskDateTime) {
    Logger.log('No taskDateTime provided. Skipping creation.');
    return;
  }

  try {
    const taskName = data.taskName || 'Untitled Event';
    const description = data.description || '';
    const isARace = data.isARace;
    const eventDate = new Date(data.taskDateTime);
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    
    if (!calendar) {
      Logger.log('Error: Calendar not found for ID: ' + CALENDAR_ID);
      // We stop if the calendar isn't found, as events are primary.
      return;
    }
    
    // Create the main calendar event from the form submission.
    createSingleEvent(calendar, taskName, eventDate, data.isAllDay, description);

    // Conditional logic for "Athlete Race" tasks.
    if (taskName === 'Athlete Race') {
      // Create a TASK to generate the race plan.
      const racePlanDate = new Date(eventDate);
      racePlanDate.setDate(eventDate.getDate() - 7);
      createSingleTask('Generate Race Plan', racePlanDate, description);

      // Create an EVENT for the Facebook post.
      const facebookPostDate = new Date(eventDate);
      facebookPostDate.setDate(eventDate.getDate() - 5);
      createAllDayEvent(calendar, 'Schedule Facebook Post', facebookPostDate, description);

      // If it's an "A Race", create an EVENT for reflection.
      if (isARace) {
        const raceReflectionDate = new Date(eventDate);
        raceReflectionDate.setDate(eventDate.getDate() + 7);
        createAllDayEvent(calendar, 'Race Reflection', raceReflectionDate, description);
      }
    }

    // Conditional logic for "Car" tasks.
    if (taskName === 'Car') {
      // Create a TASK to make the appointment.
      const appointmentTaskDate = new Date(eventDate);
      appointmentTaskDate.setDate(eventDate.getDate() - 7);
      createSingleTask('Make Appointment for Car Task', appointmentTaskDate, description);
    }

  } catch(e) {
    Logger.log('Error in createEventsAndTasks logic: ' + e.message);
  }
  
  Logger.log('Event and Task creation process completed.');
}

/**
 * Helper function to create a single Google Task.
 */
function createSingleTask(title, dueDate, notes) {
  try {
    const task = {
      title: title,
      notes: notes,
      due: dueDate.toISOString()
    };
    Tasks.Tasks.insert(task, '@default');
    Logger.log(`Successfully created task: "${title}"`);
  } catch (e) {
    Logger.log(`Error creating task for "${title}": ` + e.message);
  }
}

/**
 * Helper function to create a single calendar event.
 */
function createSingleEvent(calendar, title, startDateTime, isAllDay, description) {
  try {
    const options = { description: description };
    if (isAllDay) {
      calendar.createAllDayEvent(title, startDateTime, options);
    } else {
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Add 1 hour
      calendar.createEvent(title, startDateTime, endDateTime, options);
    }
    Logger.log(`Successfully created event: "${title}"`);
  } catch(e) {
    Logger.log(`Error creating event for "${title}": ` + e.message);
  }
}

/**
 * Helper function to create an all-day event.
 */
function createAllDayEvent(calendar, title, date, description) {
  try {
    calendar.createAllDayEvent(title, date, { description: description });
    Logger.log(`Successfully created all-day event: "${title}"`);
  } catch(e) {
    Logger.log(`Error creating all-day event for "${title}": ` + e.message);
  }
}
