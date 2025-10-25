// AI Tools Configuration for Llamanage
// Tools that the AI agent can use to assist customers

export const availableTools = [
  // 1. Search Knowledge Base
  {
    type: "function",
    function: {
      name: "search_knowledge_base",
      description: "Search the company's uploaded documents and business information for relevant answers. Use this when the customer asks questions about products, services, policies, or procedures.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query to find relevant information in the knowledge base"
          }
        },
        required: ["query"]
      }
    }
  },

  // 2. Check Calendar Availability
  {
    type: "function",
    function: {
      name: "check_calendar_availability",
      description: "Check if user is free at a specific time or find available time slots in Google Calendar. If checking a specific time (e.g., '1pm'), set timeMin to that time and timeMax to 1 hour later. If checking a time range, use actual start and end times.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "The date to check availability (format: YYYY-MM-DD or 'tomorrow', 'today', etc.)"
          },
          timeMin: {
            type: "string",
            description: "Start time in 24-hour format (e.g., '13:00' for 1pm). If checking a single time, this is the time to check."
          },
          timeMax: {
            type: "string",
            description: "End time in 24-hour format (e.g., '14:00' for 2pm). Should be AFTER timeMin. If checking a single time like '1pm', add at least 1 hour (e.g., '14:00')."
          }
        },
        required: ["date"]
      }
    }
  },

  // 3. Create Calendar Event
  {
    type: "function",
    function: {
      name: "create_calendar_event",
      description: "Create a new event in Google Calendar. Use this after confirming meeting details with the customer.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Event title/summary"
          },
          description: {
            type: "string",
            description: "Event description or agenda"
          },
          startDateTime: {
            type: "string",
            description: "Start date and time (ISO 8601 format: YYYY-MM-DDTHH:MM:SS)"
          },
          endDateTime: {
            type: "string",
            description: "End date and time (ISO 8601 format: YYYY-MM-DDTHH:MM:SS)"
          },
          attendeeEmail: {
            type: "string",
            description: "Customer's email address to send calendar invite"
          }
        },
        required: ["title", "startDateTime", "endDateTime", "attendeeEmail"]
      }
    }
  },

  // 4. Get Business Information
  {
    type: "function",
    function: {
      name: "get_business_info",
      description: "Retrieve specific business information like hours, contact details, policies, or FAQs from the business_info table.",
      parameters: {
        type: "object",
        properties: {
          infoType: {
            type: "string",
            enum: ["hours", "contact", "policy", "faq", "general"],
            description: "Type of business information to retrieve"
          }
        },
        required: ["infoType"]
      }
    }
  },

  // 5. List Uploaded Files
  {
    type: "function",
    function: {
      name: "list_available_documents",
      description: "List all uploaded documents and files available in the knowledge base. Use this when customer asks what documentation or resources are available.",
      parameters: {
        type: "object",
        properties: {
          fileType: {
            type: "string",
            description: "Filter by file type (e.g., 'pdf', 'docx', 'txt'). Leave empty for all files."
          }
        },
        required: []
      }
    }
  },

  // 6. Create Support Ticket
  {
    type: "function",
    function: {
      name: "create_support_ticket",
      description: "Create a support ticket for issues that require human agent attention. Use this for complex problems, complaints, or requests that can't be resolved by AI.",
      parameters: {
        type: "object",
        properties: {
          subject: {
            type: "string",
            description: "Brief subject line describing the issue"
          },
          description: {
            type: "string",
            description: "Detailed description of the customer's issue"
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high", "urgent"],
            description: "Priority level based on issue severity"
          },
          category: {
            type: "string",
            enum: ["technical", "billing", "product", "general"],
            description: "Category of the support ticket"
          }
        },
        required: ["subject", "description", "priority", "category"]
      }
    }
  },

  // 7. Send Email Notification
  {
    type: "function",
    function: {
      name: "send_email_notification",
      description: "Send an email notification to the customer. Use this for confirmations, follow-ups, or sending requested information.",
      parameters: {
        type: "object",
        properties: {
          recipientEmail: {
            type: "string",
            description: "Customer's email address"
          },
          subject: {
            type: "string",
            description: "Email subject line"
          },
          body: {
            type: "string",
            description: "Email body content"
          },
          templateType: {
            type: "string",
            enum: ["confirmation", "followup", "information", "alert"],
            description: "Type of email template to use"
          }
        },
        required: ["recipientEmail", "subject", "body", "templateType"]
      }
    }
  },

  // 8. Get Customer Order Status (example e-commerce tool)
  {
    type: "function",
    function: {
      name: "get_order_status",
      description: "Look up order status and tracking information. Use this when customer asks about their order.",
      parameters: {
        type: "object",
        properties: {
          orderId: {
            type: "string",
            description: "Order ID or order number provided by customer"
          }
        },
        required: ["orderId"]
      }
    }
  }
]

// Tool Execution Handler
export async function executeTool(
  toolName: string,
  args: any,
  context: {
    supabase: any,
    userId: string,
    userEmail?: string
  }
) {
  const { supabase, userId, userEmail } = context

  try {
    switch (toolName) {
      // ===== KNOWLEDGE BASE SEARCH =====
      case "search_knowledge_base": {
        const { query } = args
        
        // Use the existing semantic search function
        const results = await context.semanticSearch(userId, query, 5)
        
        return {
          success: true,
          results: results.map((doc: any) => ({
            content: doc.content,
            source: doc.file_name || 'Business Info',
            similarity: doc.similarity
          })),
          summary: `Found ${results.length} relevant documents`
        }
      }

      // ===== CALENDAR AVAILABILITY =====
      case "check_calendar_availability": {
        let { date, timeMin = "09:00", timeMax = "17:00" } = args
        
        // Parse natural language dates like "tomorrow", "today"
        let targetDate = date
        if (date.toLowerCase() === 'tomorrow') {
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          targetDate = tomorrow.toISOString().split('T')[0]
        } else if (date.toLowerCase() === 'today') {
          targetDate = new Date().toISOString().split('T')[0]
        }
        
        // Fix if timeMin and timeMax are the same (checking a specific time)
        if (timeMin === timeMax) {
          // Add 1 hour to timeMax for a reasonable check window
          const [hours, minutes] = timeMin.split(':').map(Number)
          const endHour = (hours + 1) % 24
          timeMax = `${String(endHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
        }
        
        // If timeMax is before or equal to timeMin, set it to end of business day
        const [minHours, minMinutes] = timeMin.split(':').map(Number)
        const [maxHours, maxMinutes] = timeMax.split(':').map(Number)
        if (maxHours < minHours || (maxHours === minHours && maxMinutes <= minMinutes)) {
          timeMax = "17:00" // Default to 5pm
        }
        
        // Get user's Google access token from context (passed from frontend)
        const accessToken = context.googleAccessToken
        
        console.log('Tool check_calendar_availability - accessToken from context:', accessToken ? 'Token present (length: ' + accessToken.length + ')' : 'NO TOKEN')
        
        if (!accessToken) {
          return {
            success: false,
            message: "It looks like you're not connected to your Google Calendar yet. To check your availability, you'll need to link your calendar first. You can do this by going to the Integrations tab and clicking 'Connect Google Calendar'. Once that's done, I'll be happy to check your schedule for you!"
          }
        }
        
        try {
          // Build ISO datetime strings
          const startDateTime = `${targetDate}T${timeMin}:00`
          const endDateTime = `${targetDate}T${timeMax}:00`
          
          // Check availability using Google Calendar API
          const response = await fetch(
            'https://www.googleapis.com/calendar/v3/freeBusy',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                timeMin: startDateTime,
                timeMax: endDateTime,
                items: [{ id: 'primary' }]
              })
            }
          )
          
          if (!response.ok) {
            throw new Error('Failed to check Google Calendar')
          }
          
          const data = await response.json()
          const busySlots = data.calendars?.primary?.busy || []
          
          // Generate available slots (30-minute intervals)
          const availableSlots = []
          const start = new Date(startDateTime)
          const end = new Date(endDateTime)
          let currentTime = new Date(start)
          
          while (currentTime < end) {
            const slotEnd = new Date(currentTime.getTime() + 30 * 60000)
            
            // Check if slot is free
            const isFree = !busySlots.some((busy: any) => {
              const busyStart = new Date(busy.start)
              const busyEnd = new Date(busy.end)
              return (currentTime >= busyStart && currentTime < busyEnd) ||
                     (slotEnd > busyStart && slotEnd <= busyEnd)
            })
            
            if (isFree && slotEnd <= end) {
              availableSlots.push({
                start: currentTime.toISOString(),
                end: slotEnd.toISOString()
              })
            }
            
            currentTime = new Date(currentTime.getTime() + 30 * 60000)
          }
          
          // Format date nicely for response
          const dateObj = new Date(targetDate)
          const formattedDate = dateObj.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
          
          // Check if the specific requested time is free
          const requestedTime = timeMin
          const requestedSlot = availableSlots.find(slot => {
            const slotStart = new Date(slot.start)
            const slotTime = `${String(slotStart.getHours()).padStart(2, '0')}:${String(slotStart.getMinutes()).padStart(2, '0')}`
            return slotTime === requestedTime
          })
          
          let message = ''
          if (requestedSlot) {
            message = `Yes! You're free on ${formattedDate} at ${timeMin}. `
          } else {
            message = `You're busy on ${formattedDate} at ${timeMin}. `
          }
          
          if (availableSlots.length > 0) {
            message += `Available slots on this day: ${availableSlots.length} slots between ${timeMin} and ${timeMax}.`
          } else {
            message += `No available slots between ${timeMin} and ${timeMax}.`
          }
          
          return {
            success: true,
            availableSlots,
            busySlots,
            isFreeAtRequestedTime: !!requestedSlot,
            requestedTime: timeMin,
            date: formattedDate,
            message
          }
        } catch (error) {
          console.error('Calendar availability error:', error)
          return {
            success: false,
            message: "Failed to check calendar availability. Please try reconnecting Google Calendar."
          }
        }
      }

      // ===== CREATE CALENDAR EVENT =====
      case "create_calendar_event": {
        const { title, description, startDateTime, endDateTime, attendeeEmail } = args
        
        // Get user's Google access token from context (passed from frontend)
        const accessToken = context.googleAccessToken
        
        if (!accessToken) {
          return {
            success: false,
            message: "Please connect your Google Calendar first. Go to Integrations tab and click 'Connect Google Calendar'."
          }
        }
        
        try {
          // Create event in Google Calendar
          const event = {
            summary: title,
            description: description || '',
            start: {
              dateTime: startDateTime,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            end: {
              dateTime: endDateTime,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            attendees: attendeeEmail ? [{ email: attendeeEmail }] : [],
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 30 }
              ]
            }
          }
          
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
            const errorData = await response.json()
            throw new Error(errorData.error?.message || 'Failed to create calendar event')
          }
          
          const createdEvent = await response.json()
          
          // Also store in our database for reference
          const { data: dbData, error: dbError } = await supabase
            .from('calendar_events')
            .insert({
              user_id: userId,
              title,
              description,
              start_time: startDateTime,
              end_time: endDateTime,
              attendee_email: attendeeEmail,
              google_event_id: createdEvent.id,
              status: 'confirmed'
            })
            .select()
          
          if (dbError) {
            console.error('Failed to save event to database:', dbError)
          }
          
          const formattedDate = new Date(startDateTime).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })
          
          return {
            success: true,
            eventId: createdEvent.id,
            eventLink: createdEvent.htmlLink,
            message: `✅ Meeting "${title}" scheduled for ${formattedDate}${attendeeEmail ? `. Calendar invite sent to ${attendeeEmail}` : ''}.`
          }
        } catch (error) {
          console.error('Create calendar event error:', error)
          return {
            success: false,
            message: `Failed to create calendar event: ${error.message}`
          }
        }
      }

      // ===== GET BUSINESS INFO =====
      case "get_business_info": {
        const { infoType } = args
        
        const { data, error } = await supabase
          .from('business_info')
          .select('*')
          .eq('user_id', userId)
          .eq('info_type', infoType)
          .limit(5)
        
        if (error) throw error
        
        return {
          success: true,
          information: data || [],
          count: data?.length || 0
        }
      }

      // ===== LIST DOCUMENTS =====
      case "list_available_documents": {
        const { fileType } = args
        
        let query = supabase
          .from('files')
          .select('file_name, file_type, file_size, created_at')
          .eq('user_id', userId)
        
        if (fileType) {
          query = query.ilike('file_type', `%${fileType}%`)
        }
        
        const { data, error } = await query.limit(20)
        
        if (error) throw error
        
        return {
          success: true,
          documents: data || [],
          count: data?.length || 0
        }
      }

      // ===== CREATE SUPPORT TICKET =====
      case "create_support_ticket": {
        const { subject, description, priority, category } = args
        
        const { data, error } = await supabase
          .from('support_tickets')
          .insert({
            user_id: userId,
            customer_email: userEmail,
            subject,
            description,
            priority,
            category,
            status: 'open',
            created_at: new Date().toISOString()
          })
          .select()
        
        if (error) throw error
        
        return {
          success: true,
          ticketId: data[0]?.id,
          message: `Support ticket #${data[0]?.id} created. Our team will respond within 24 hours.`
        }
      }

      // ===== SEND EMAIL =====
      case "send_email_notification": {
        const { recipientEmail, subject, body, templateType } = args
        
        // Log email request (implement actual email sending with Supabase Edge Function)
        const { data, error } = await supabase
          .from('email_logs')
          .insert({
            user_id: userId,
            recipient_email: recipientEmail,
            subject,
            body,
            template_type: templateType,
            status: 'queued',
            created_at: new Date().toISOString()
          })
        
        if (error) throw error
        
        return {
          success: true,
          message: `Email queued to ${recipientEmail}`
        }
      }

      // ===== GET ORDER STATUS =====
      case "get_order_status": {
        const { orderId } = args
        
        // Example implementation - adapt to your database schema
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('order_id', orderId)
          .single()
        
        if (error) {
          return {
            success: false,
            message: `Order ${orderId} not found. Please verify the order number.`
          }
        }
        
        return {
          success: true,
          order: data,
          message: `Order ${orderId} is currently ${data.status}. Expected delivery: ${data.delivery_date}`
        }
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`)
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error)
    return {
      success: false,
      error: error.message
    }
  }
}
