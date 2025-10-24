# Flow Builder - AI Agent Configuration

## Overview
The Flow Builder is a visual node-based editor that allows businesses to create custom conversation flows for their AI agents. It's similar to Typebot but specifically designed for Llamanage's AI customer support system.

## Features

### Node Types
1. **Start Node** 🚀 - Entry point for the conversation
2. **Message Node** 💬 - Send predefined messages to users
3. **Question Node** ❓ - Ask questions and collect user input
4. **Condition Node** 🔀 - Branch conversation based on conditions (equals, contains, greater than, less than)
5. **Action Node** ⚡ - Trigger actions (send email, create ticket, schedule meeting, transfer to human, webhook)
6. **AI Response Node** 🤖 - Generate dynamic AI responses with custom prompts
7. **End Node** 🏁 - Terminate the conversation

### How to Use
1. Navigate to the "Flow Builder" tab in your dashboard
2. Drag nodes from the left sidebar onto the canvas
3. Connect nodes by dragging from one node's handle to another
4. Configure each node by typing in the input fields
5. Save your flow using the "Save Flow" button

### Data Structure
When you save a flow, the following data is sent to the backend via POST request to `/api/flows`:

```json
{
  "flowName": "My AI Agent Flow",
  "nodes": [
    {
      "id": "1",
      "type": "start",
      "position": { "x": 250, "y": 50 },
      "data": { "label": "Welcome message" }
    },
    {
      "id": "2",
      "type": "message",
      "position": { "x": 250, "y": 200 },
      "data": { "message": "Hello! How can I help you?" }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "1",
      "target": "2"
    }
  ],
  "createdAt": "2025-10-24T21:25:00.000Z"
}
```

### Backend Integration
The flow data is sent to your backend with:
- **Endpoint**: `POST /api/flows`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}`
- **Body**: JSON containing flowName, nodes, edges, and createdAt

If the backend endpoint is not configured, the flow is saved to localStorage as a fallback.

## Node Configuration Details

### Message Node
- **Purpose**: Display static messages to users
- **Data**: `{ message: string }`

### Question Node
- **Purpose**: Collect user input
- **Data**: `{ question: string, inputType: 'Text' | 'Email' | 'Phone' }`

### Condition Node
- **Purpose**: Branch conversation flow based on user responses
- **Data**: `{ condition: 'equals' | 'contains' | 'greater' | 'less' }`

### Action Node
- **Purpose**: Trigger business actions
- **Data**: `{ action: 'send_email' | 'create_ticket' | 'schedule' | 'transfer' | 'webhook' }`

### AI Response Node
- **Purpose**: Generate contextual AI responses
- **Data**: `{ prompt: string }` - The prompt context for the AI

## Future Enhancements
- [ ] Load existing flows from backend
- [ ] Real-time flow testing
- [ ] Analytics on flow performance
- [ ] A/B testing different flows
- [ ] Export/import flows
- [ ] Template library
- [ ] Version control for flows
- [ ] Multi-language support

## Technical Stack
- **React Flow**: Node-based UI library
- **React**: Component framework
- **Tailwind CSS**: Styling
- **Local Storage**: Fallback storage
