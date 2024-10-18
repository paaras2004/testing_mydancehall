import React, { useEffect, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Sidebar from './Sidebar'; 
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import './teacher.css';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

// Add this line at the top of your teacher.js file
const API_URL = process.env.REACT_APP_API_URL || 'https://server.mydancehall.com';

const Teacher = () => {
  const { logout } = useAuth0();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeClasses, setActiveClasses] = useState([]);
  const [slots, setSlots] = useState([]);

  const sidebarItems = [
    { label: 'Dashboard', section: 'dashboard' },
    { label: 'Current Active Bookings', section: 'bookings' },
    { label: 'Settings', section: 'settings' },
    { label: 'Payments', section: 'payments' },
    { label: 'Feedback', section: 'feedback' },
    { label: 'Help', section: 'help' },
  ];

  const loadActiveClasses = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/active-classes`); // Ensure the correct port
      const activeClasses = await response.json();
      console.log('Active Classes:', activeClasses);
      setActiveClasses(activeClasses);
    } catch (err) {
      console.error('Error loading active classes:', err);
    }
  }, []);

  useEffect(() => {
    loadActiveClasses();
  }, [loadActiveClasses]);

  useEffect(() => {

  }, [activeSection, activeClasses]);

  const cancelBooking = async (id) => {
    // Implement cancel booking logic here
  };

  const rescheduleBooking = async (id) => {
    // Implement reschedule booking logic here
  };

  const handleEventAdd = async (info) => {
    const title = 'Class Available';
    const endDate = new Date(info.startStr);
    endDate.setHours(endDate.getHours() + 1); // Set duration to 1 hour
    

    try {
        const response = await fetch(`${API_URL}/api/addSlot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dateTime: info.startStr, // Send as ISO string
                currency: 'INR', // or 'USD' based on your logic
            })
        });

        if (response.ok) {
            const slot = await response.json();
            console.log("New slot added:", slot);
            info.view.calendar.addEvent({
                id: slot._id,
                title: title,
                start: new Date(slot.dateTime),
                end: new Date(new Date(slot.dateTime).getTime() + 60 * 60 * 1000),
                allDay: false,
            });
            alert('Slot added successfully');
        } else {
            const errorText = await response.text();
            console.error('Failed to add slot:', errorText);
            alert('Failed to add slot: ' + errorText);
        }
    } catch (error) {
        console.error('Error adding slot:', error);
        alert('Failed to add slot: ' + error.message);
    }
};

const handleEventClick = async (clickInfo) => {
    const eventId = clickInfo.event.id;
    if (!eventId) {
        console.error('Event ID is undefined');
        alert('Failed to delete slot: Event ID is undefined');
        return;
    }

    console.log("Deleting slot with ID:", eventId);
    if (window.confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'?`)) {
        try {
            const response = await fetch(`${API_URL}/api/slots/${eventId}`, { method: 'DELETE' });
            if (response.ok) {
                clickInfo.event.remove();
                alert('Slot deleted successfully');
            } else {
                alert('Failed to delete slot');
            }
        } catch (error) {
            console.error('Error deleting slot:', error);
            alert('Failed to delete slot');
        }
    }
};

return (
    <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex' }}>
      <Sidebar items={sidebarItems} setActiveSection={setActiveSection} />
      <div id="content">
        {/* Render content based on activeSection */}
      </div>
    </div>
        <div id="main-content">

            {activeSection === 'dashboard' && (
                <div id="calendar-container">
                    <div id="calendar">
                        <FullCalendar
                            timeZone="local"
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, momentTimezonePlugin]}
                            initialView="timeGridWeek"
                            slotLabelFormat={[
                                { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata', meridiem: 'short' },
                                { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', meridiem: 'short' }
                            ]}
                            slotLabelContent={({ date }) => (
                                <div>
                                    <div>{date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })} IST</div>
                                    <div>{date.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: true })} EDT</div>
                                </div>
                            )}
                            selectable={true}
                            editable={true}
                            events={async (fetchInfo, successCallback, failureCallback) => {
                               
                                try {
                                    const response = await fetch(`${API_URL}/api/slots`);
                                    if (!response.ok) {
                                        throw new Error(`HTTP error! status: ${response.status}`);
                                    }
                                    const slots = await response.json();
                                    
                                    if (!Array.isArray(slots)) {
                                        console.error('Fetched data is not an array:', slots);
                                        failureCallback(new Error('Invalid data format'));
                                        return;
                                    }
                                    const events = slots.map(slot => {
                                        
                                        return {
                                            title: 'Available Slot',
                                            start: new Date(slot.dateTime),
                                            end: new Date(new Date(slot.dateTime).getTime() + 60 * 60 * 1000),
                                            allDay: false,
                                            id: slot._id
                                        };
                                    });
                                    
                                    successCallback(events);
                                } catch (error) {
                                    console.error('Error fetching slots:', error);
                                    failureCallback(error);
                                }
                            }}
                            select={handleEventAdd}
                            eventClick={handleEventClick}
                        />
                    </div>
                </div>
            )}

            {activeSection === 'bookings' && (
                <div id="bookings-container">
                    <h2>Current Active Bookings</h2>
                    <table id="active-bookings-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Class Timing</th>
                                <th>Booking Status</th>
                                <th>Google Meet Link</th>
                                <th>Booking Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeClasses.map(classInfo => (
                                classInfo.slot && (
                                    <tr key={classInfo._id}>
                                        <td>{classInfo.studentName}</td>
                                        <td>{classInfo.slot ? new Date(classInfo.slot.dateTime).toLocaleString() : 'N/A'}</td>
                                        <td>{classInfo.bookingStatus}</td>
                                        <td><a href={classInfo.googleMeetLink} target="_blank" rel="noopener noreferrer">Join</a></td>
                                        <td>{classInfo.paymentAmount}</td>
                                        <td>
                                            <button className="cancel-booking" onClick={() => cancelBooking(classInfo._id)}>🗑️</button>
                                            <button className="reschedule-booking" onClick={() => rescheduleBooking(classInfo._id)}>⏰</button>
                                        </td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeSection === 'settings' && (
                <div>
                    <h2>Settings</h2>
                    {/* Settings content goes here */}
                </div>
            )}

            {activeSection === 'payments' && (
                <div>
                    <h2>Payments</h2>
                    {/* Payments content goes here */}
                </div>
            )}

            {activeSection === 'feedback' && (
                <div>
                    <h2>Feedback</h2>
                    {/* Feedback content goes here */}
                </div>
            )}

            {activeSection === 'help' && (
                <div>
                    <h2>Help</h2>
                    {/* Help content goes here */}
                </div>
            )}
        </div>
    </div>
);
};

export default Teacher;
