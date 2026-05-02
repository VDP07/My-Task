import React, { useState } from 'react';
import { Calendar, Award, Phone, Home, Car as CarIcon, Plane, Tag, Text, ListTodo, Users, Stethoscope, CheckSquare, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';

// A custom icon for Golf since lucide-react doesn't have one
const GolfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 18.5c.3 1.2 1.5 2.5 3 2.5s2.7-1.3 3-2.5c.3-1.2-2-5.5-3-5.5s-3.3 4.3-3 5.5Z"/><path d="m12 13 4-4"/><path d="M12.5 5a2.5 2.5 0 0 0-5 0v0a2.5 2.5 0 0 0 5 0v0Z"/><path d="M12 5V2"/>
    </svg>
);

const App = () => {
  // ❗ IMPORTANT: REPLACE THIS WITH YOUR NEW DEPLOYED SCRIPT URL FROM STEP 2
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwERClodyK_bU69wHDGGscqDE7hRxd-WUFT0ezWSHJCCzriTp7XbQO20vq0rIKu1XR0NQ/exec';

  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isAllDay, setIsAllDay] = useState(false);
  
  // Set default values for daysOut and taskTiming
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      daysOut: 5,
      taskTiming: 'before'
    }
  });
  
  const taskName = watch('taskName');
  const watchCreateTask = watch('createTask');

  const taskTypes = [
    { name: 'Athlete Race', value: 'Athlete Race', icon: <Award /> },
    { name: 'Athlete Interview', value: 'Athlete Interview', icon: <Phone /> },
    { name: 'Athlete Trial Sum', value: 'Athlete Trial Sum', icon: <Users /> },
    { name: 'Doctor', value: 'Doctor', icon: <Stethoscope /> },
    { name: 'Golf', value: 'Golf', icon: <GolfIcon /> },
    { name: 'Car', value: 'Car', icon: <CarIcon /> },
    { name: 'House', value: 'House', icon: <Home /> },
    { name: 'Travel', value: 'Travel', icon: <Plane /> },
    { name: 'Other', value: 'Other', icon: <Tag /> },
  ];
  
  const onSubmit = async (data) => {
    setSubmissionStatus('loading');
    
    // Construct a full Date object for the backend
    let eventDate = new Date(data.taskDate);
    if (!isAllDay && data.taskTime) {
        const [hours, minutes] = data.taskTime.split(':');
        eventDate.setHours(hours, minutes);
    }

    try {
      const payload = {
        taskName: data.taskName,
        taskDateTime: eventDate.toISOString(), // Send as a standard ISO string
        isAllDay: isAllDay,
        description: data.description,
        // Only include isARace if the task is 'Athlete Race'
        isARace: data.taskName === 'Athlete Race' ? data.isARace : undefined, 
      };

      // Add the task reminder data if the user checked the box
      if (data.createTask) {
        payload.createTask = true;
        payload.daysOut = data.daysOut;
        payload.taskTiming = data.taskTiming;
      }

      // Use the 'fetch' API to send data to the Google Script
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Scripts
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setSubmissionStatus('success');
      // Reset the form and clear status message after 3 seconds
      setTimeout(() => {
        reset({ createTask: false, daysOut: 5, taskTiming: 'before' });
        setIsAllDay(false);
        setSubmissionStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmissionStatus('error');
    }
  };

  const selectedTaskIcon = taskTypes.find(t => t.value === taskName)?.icon || <ListTodo />;

  return (
    <>
      <style>{`
        /* All the CSS styles from your original code go here */
        .main-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .card { background-color: #ffffff; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); width: 100%; max-width: 48rem; border: 1px solid #e5e7eb; }
        .title { font-size: 2.25rem; font-weight: 800; text-align: center; color: #1f2937; margin-bottom: 0.5rem; }
        .subtitle { font-size: 1.125rem; text-align: center; color: #4b5563; margin-bottom: 2rem; }
        .message-box { margin-bottom: 1rem; padding: 1rem; text-align: center; font-size: 1.125rem; font-weight: 600; border-radius: 0.5rem; border: 1px solid transparent; }
        .success { background-color: #d1fae5; color: #065f46; border-color: #a7f3d0; }
        .error { background-color: #fee2e2; color: #991b1b; border-color: #fca5a5; }
        .form-group { margin-bottom: 1.5rem; }
        .form-label { color: #374151; font-weight: 500; display: flex; align-items: center; margin-bottom: 0.5rem; }
        .form-label svg { width: 1.25rem; height: 1.25rem; color: #6b7280; margin-right: 0.75rem; }
        .form-input { box-sizing: border-box; width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.75rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1); }
        .form-input:focus { border-color: #3b82f6; outline: 2px solid transparent; outline-offset: 2px; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5); }
        .error-message { color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem; }
        .submit-button { width: 100%; background-color: #2563eb; color: #ffffff; font-weight: 700; padding: 0.75rem 1.5rem; border: none; border-radius: 0.75rem; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1); transform: scale(1); }
        .submit-button:hover { background-color: #1d4ed8; transform: scale(1.02); }
        .submit-button[disabled] { opacity: 0.6; cursor: not-allowed; transform: scale(1); }
        .datetime-container { display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem; flex-wrap: wrap; }
        .all-day-toggle { display: flex; align-items: center; margin-top: 0.5rem; margin-bottom: 1rem; }
        .all-day-toggle input[type="checkbox"] { margin-right: 0.5rem; height: 1.25rem; width: 1.25rem; cursor: pointer; }
        
        /* New CSS for the Task feature */
        .flex-group { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .checkbox-container { display: flex; align-items: center; margin-bottom: 1.5rem; background-color: #f8fafc; padding: 1rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; }
        .checkbox-input { width: 1.25rem; height: 1.25rem; margin-right: 0.75rem; cursor: pointer; accent-color: #2563eb; }
        .checkbox-label { color: #374151; font-weight: 600; cursor: pointer; display: flex; align-items: center; margin: 0; }
      `}</style>

      <div className="main-container">
        <div className="card">
          <h1 className="title">Athlete & Personal Log</h1>
          <p className="subtitle">As an endurance coach, keeping track of events is key. Use this form to log everything in one place.</p>

          {submissionStatus === 'success' && (
            <div className="message-box success">✅ Task logged successfully to your Google Calendar!</div>
          )}
          {submissionStatus === 'error' && (
            <div className="message-box error">❌ An error occurred. Please check the Script URL and try again.</div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Task Name Dropdown */}
            <div className="form-group">
              <label htmlFor="taskName" className="form-label">{selectedTaskIcon} Task Name</label>
              <select id="taskName" {...register('taskName', { required: 'Task name is required' })} className="form-input">
                <option value="">Select a Task...</option>
                {taskTypes.map((task) => (<option key={task.value} value={task.value}>{task.name}</option>))}
              </select>
              {errors.taskName && <p className="error-message">{errors.taskName.message}</p>}
            </div>

            {/* Conditional Checkbox for A Race */}
            {taskName === 'Athlete Race' && (
              <div className="form-group">
                <div className="all-day-toggle" style={{marginTop: 0, marginBottom: 0}}>
                  <input type="checkbox" id="isARace" {...register('isARace')} />
                  <label htmlFor="isARace" className="checkbox-label" style={{fontWeight: 'normal'}}>Is this an 'A' Race? (Adds post-race reflection)</label>
                </div>
              </div>
            )}

            {/* Date and Time Fields */}
            <div className="form-group">
              <label htmlFor="taskDate" className="form-label"><Calendar /> Date and Time</label>
              <div className="all-day-toggle">
                <input type="checkbox" id="allDay" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} />
                <label htmlFor="allDay" className="checkbox-label" style={{fontWeight: 'normal'}}>All-Day Event</label>
              </div>
              
              <div className="datetime-container">
                <input type="date" id="taskDate" {...register('taskDate', { required: 'Date is required' })} className="form-input" />
                {!isAllDay && (
                  <input type="time" id="taskTime" {...register('taskTime', { required: !isAllDay ? 'Time is required for non-all-day events' : false })} className="form-input" />
                )}
              </div>
              {errors.taskDate && <p className="error-message">{errors.taskDate.message}</p>}
              {errors.taskTime && <p className="error-message">{errors.taskTime.message}</p>}
            </div>

            {/* Task Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label"><Text /> Detailed Description</label>
              <textarea id="description" rows="4" {...register('description')} className="form-input"></textarea>
            </div>

            {/* NEW: Checkbox to trigger Task Creation */}
            <div className="checkbox-container">
              <input type="checkbox" id="createTask" {...register('createTask')} className="checkbox-input" />
              <label htmlFor="createTask" className="checkbox-label">
                <CheckSquare style={{marginRight: '0.5rem', width: '1.25rem'}} /> Create task reminder?
              </label>
            </div>

            {/* NEW: Conditional Task Timing Fields */}
            {watchCreateTask && (
              <div className="flex-group">
                <div style={{ flex: 1 }}>
                  <label htmlFor="daysOut" className="form-label"><Clock /> Days</label>
                  <input
                    type="number"
                    id="daysOut"
                    {...register('daysOut', { 
                      valueAsNumber: true,
                      required: 'Please specify how many days',
                      min: { value: 0, message: 'Cannot be negative' }
                    })}
                    className="form-input"
                  />
                  {errors.daysOut && <p className="error-message">{errors.daysOut.message}</p>}
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="taskTiming" className="form-label">Timing</label>
                  <select id="taskTiming" {...register('taskTiming')} className="form-input">
                    <option value="before">Before Event</option>
                    <option value="after">After Event</option>
                  </select>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="submit-button" disabled={submissionStatus === 'loading'}>
              {submissionStatus === 'loading' ? 'Logging...' : 'Log Task to Calendar'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default App;