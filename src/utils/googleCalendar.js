// Google Calendar API Helper Functions
// These functions help your AI agent interact with Google Calendar

/**
 * List upcoming calendar events
 * @param {string} accessToken - User's Google Calendar access token
 * @param {number} maxResults - Maximum number of events to return
 * @returns {Promise<Array>} Array of calendar events
 */
export const listCalendarEvents = async (accessToken, maxResults = 10) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${new Date().toISOString()}&` +
      `maxResults=${maxResults}&` +
      `singleEvents=true&` +
      `orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch calendar events')
    }
    
    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Error listing calendar events:', error)
    throw error
  }
}

/**
 * Create a new calendar event
 * @param {string} accessToken - User's Google Calendar access token
 * @param {Object} eventDetails - Event details
 * @returns {Promise<Object>} Created event object
 */
export const createCalendarEvent = async (accessToken, eventDetails) => {
  const {
    title,
    description,
    startTime,
    endTime,
    attendees = [],
    location = '',
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  } = eventDetails

  const event = {
    summary: title,
    description: description,
    location: location,
    start: {
      dateTime: startTime,
      timeZone: timeZone
    },
    end: {
      dateTime: endTime,
      timeZone: timeZone
    },
    attendees: attendees.map(email => ({ email })),
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 }
      ]
    }
  }

  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }
    )

    if (!response.ok) {
      throw new Error('Failed to create calendar event')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating calendar event:', error)
    throw error
  }
}

/**
 * Check user's availability for a given time range
 * @param {string} accessToken - User's Google Calendar access token
 * @param {string} timeMin - Start time (ISO format)
 * @param {string} timeMax - End time (ISO format)
 * @returns {Promise<Object>} Free/busy information
 */
export const checkAvailability = async (accessToken, timeMin, timeMax) => {
  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/freeBusy',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timeMin: timeMin,
          timeMax: timeMax,
          items: [{ id: 'primary' }]
        })
      }
    )

    if (!response.ok) {
      throw new Error('Failed to check availability')
    }

    const data = await response.json()
    const busySlots = data.calendars.primary.busy || []
    
    return {
      isFree: busySlots.length === 0,
      busySlots: busySlots
    }
  } catch (error) {
    console.error('Error checking availability:', error)
    throw error
  }
}

/**
 * Update an existing calendar event
 * @param {string} accessToken - User's Google Calendar access token
 * @param {string} eventId - ID of the event to update
 * @param {Object} updates - Updated event details
 * @returns {Promise<Object>} Updated event object
 */
export const updateCalendarEvent = async (accessToken, eventId, updates) => {
  try {
    // First, get the existing event
    const getResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!getResponse.ok) {
      throw new Error('Failed to fetch event')
    }

    const existingEvent = await getResponse.json()

    // Merge updates with existing event
    const updatedEvent = {
      ...existingEvent,
      ...updates
    }

    // Update the event
    const updateResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedEvent)
      }
    )

    if (!updateResponse.ok) {
      throw new Error('Failed to update event')
    }

    return await updateResponse.json()
  } catch (error) {
    console.error('Error updating calendar event:', error)
    throw error
  }
}

/**
 * Delete a calendar event
 * @param {string} accessToken - User's Google Calendar access token
 * @param {string} eventId - ID of the event to delete
 * @returns {Promise<void>}
 */
export const deleteCalendarEvent = async (accessToken, eventId) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to delete event')
    }

    return true
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    throw error
  }
}

/**
 * Find available time slots in user's calendar
 * @param {string} accessToken - User's Google Calendar access token
 * @param {string} startDate - Start date for search
 * @param {string} endDate - End date for search
 * @param {number} durationMinutes - Required meeting duration
 * @returns {Promise<Array>} Array of available time slots
 */
export const findAvailableSlots = async (accessToken, startDate, endDate, durationMinutes = 30) => {
  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/freeBusy',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timeMin: startDate,
          timeMax: endDate,
          items: [{ id: 'primary' }]
        })
      }
    )

    if (!response.ok) {
      throw new Error('Failed to find available slots')
    }

    const data = await response.json()
    const busySlots = data.calendars.primary.busy || []

    // Generate available slots (simplified algorithm)
    const availableSlots = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    let currentTime = new Date(start)
    
    while (currentTime < end) {
      const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000)
      
      // Check if this slot overlaps with any busy slot
      const isAvailable = !busySlots.some(busy => {
        const busyStart = new Date(busy.start)
        const busyEnd = new Date(busy.end)
        return (currentTime >= busyStart && currentTime < busyEnd) ||
               (slotEnd > busyStart && slotEnd <= busyEnd)
      })
      
      if (isAvailable) {
        availableSlots.push({
          start: currentTime.toISOString(),
          end: slotEnd.toISOString()
        })
      }
      
      // Move to next 30-minute slot
      currentTime = new Date(currentTime.getTime() + 30 * 60000)
    }
    
    return availableSlots
  } catch (error) {
    console.error('Error finding available slots:', error)
    throw error
  }
}

/**
 * Parse natural language date/time into ISO format
 * @param {string} naturalLanguage - Natural language date/time (e.g., "tomorrow at 2pm")
 * @returns {Object} Start and end times in ISO format
 */
export const parseDateTime = (naturalLanguage) => {
  // This is a simplified parser - in production, use a library like chrono-node
  const now = new Date()
  let startTime = new Date(now)
  
  // Handle "tomorrow"
  if (naturalLanguage.toLowerCase().includes('tomorrow')) {
    startTime.setDate(startTime.getDate() + 1)
  }
  
  // Handle "next week"
  if (naturalLanguage.toLowerCase().includes('next week')) {
    startTime.setDate(startTime.getDate() + 7)
  }
  
  // Handle time (e.g., "2pm", "14:00")
  const timeMatch = naturalLanguage.match(/(\d{1,2})(:\d{2})?\s*(am|pm)?/i)
  if (timeMatch) {
    let hours = parseInt(timeMatch[1])
    const minutes = timeMatch[2] ? parseInt(timeMatch[2].slice(1)) : 0
    const period = timeMatch[3]?.toLowerCase()
    
    if (period === 'pm' && hours !== 12) hours += 12
    if (period === 'am' && hours === 12) hours = 0
    
    startTime.setHours(hours, minutes, 0, 0)
  }
  
  // Default meeting duration: 1 hour
  const endTime = new Date(startTime.getTime() + 60 * 60000)
  
  return {
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString()
  }
}

/**
 * Format event for display
 * @param {Object} event - Google Calendar event object
 * @returns {string} Formatted event string
 */
export const formatEvent = (event) => {
  const start = new Date(event.start.dateTime || event.start.date)
  const end = new Date(event.end.dateTime || event.end.date)
  
  const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' }
  const timeOptions = { hour: 'numeric', minute: '2-digit' }
  
  return `📅 ${event.summary}
📍 ${event.location || 'No location'}
🕐 ${start.toLocaleDateString('en-US', dateOptions)} at ${start.toLocaleTimeString('en-US', timeOptions)} - ${end.toLocaleTimeString('en-US', timeOptions)}
${event.attendees ? `👥 ${event.attendees.length} attendee(s)` : ''}`
}

export default {
  listCalendarEvents,
  createCalendarEvent,
  checkAvailability,
  updateCalendarEvent,
  deleteCalendarEvent,
  findAvailableSlots,
  parseDateTime,
  formatEvent
}
