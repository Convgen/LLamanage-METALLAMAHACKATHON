import { useState, useCallback, useRef } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'

// Custom Node Components
const StartNode = ({ data }) => (
  <div className="px-6 py-4 rounded-lg shadow-lg border-2" style={{ backgroundColor: '#2D2D2D', borderColor: '#75FDA8', minWidth: '200px' }}>
    <Handle type="source" position={Position.Bottom} style={{ background: '#75FDA8' }} />
    <div className="flex items-center space-x-2 mb-2">
      <span className="text-2xl">🚀</span>
      <span className="font-bold" style={{ color: '#75FDA8' }}>Start</span>
    </div>
    <div className="text-sm" style={{ color: '#E5E7EB' }}>
      {data.label || 'Conversation begins here'}
    </div>
  </div>
)

const MessageNode = ({ data }) => (
  <div className="px-6 py-4 rounded-lg shadow-lg border-2" style={{ backgroundColor: '#2D2D2D', borderColor: '#75FDA8', minWidth: '250px' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#75FDA8' }} />
    <Handle type="source" position={Position.Bottom} style={{ background: '#75FDA8' }} />
    <div className="flex items-center space-x-2 mb-2">
      <span className="text-2xl">💬</span>
      <span className="font-bold" style={{ color: '#75FDA8' }}>Message</span>
    </div>
    <textarea
      value={data.message || ''}
      onChange={(e) => data.onChange?.(e.target.value)}
      placeholder="Enter message..."
      className="w-full p-2 rounded text-sm resize-none"
      style={{ backgroundColor: '#1F1F1F', color: '#FFFFFF', border: '1px solid #27705D' }}
      rows="3"
    />
  </div>
)

const QuestionNode = ({ data }) => (
  <div className="px-6 py-4 rounded-lg shadow-lg border-2" style={{ backgroundColor: '#2D2D2D', borderColor: '#75FDA8', minWidth: '250px' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#75FDA8' }} />
    <Handle type="source" position={Position.Bottom} style={{ background: '#75FDA8' }} />
    <div className="flex items-center space-x-2 mb-2">
      <span className="text-2xl">❓</span>
      <span className="font-bold" style={{ color: '#75FDA8' }}>Question</span>
    </div>
    <input
      type="text"
      value={data.question || ''}
      onChange={(e) => data.onChange?.(e.target.value)}
      placeholder="Enter question..."
      className="w-full p-2 rounded text-sm mb-2"
      style={{ backgroundColor: '#1F1F1F', color: '#FFFFFF', border: '1px solid #27705D' }}
    />
    <div className="text-xs mt-2" style={{ color: '#E5E7EB' }}>
      Input Type: {data.inputType || 'Text'}
    </div>
  </div>
)

const ConditionNode = ({ data }) => (
  <div className="px-6 py-4 rounded-lg shadow-lg border-2" style={{ backgroundColor: '#2D2D2D', borderColor: '#FFB800', minWidth: '200px' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#FFB800' }} />
    <Handle type="source" position={Position.Bottom} id="true" style={{ background: '#FFB800', left: '30%' }} />
    <Handle type="source" position={Position.Bottom} id="false" style={{ background: '#FFB800', left: '70%' }} />
    <div className="flex items-center space-x-2 mb-2">
      <span className="text-2xl">🔀</span>
      <span className="font-bold" style={{ color: '#FFB800' }}>Condition</span>
    </div>
    <select
      value={data.condition || 'equals'}
      onChange={(e) => data.onChange?.(e.target.value)}
      className="w-full p-2 rounded text-sm"
      style={{ backgroundColor: '#1F1F1F', color: '#FFFFFF', border: '1px solid #27705D' }}
    >
      <option value="equals">Equals</option>
      <option value="contains">Contains</option>
      <option value="greater">Greater Than</option>
      <option value="less">Less Than</option>
    </select>
    <div className="flex justify-between mt-2 text-xs" style={{ color: '#E5E7EB' }}>
      <span>✓ True</span>
      <span>✗ False</span>
    </div>
  </div>
)

const ActionNode = ({ data }) => (
  <div className="px-6 py-4 rounded-lg shadow-lg border-2" style={{ backgroundColor: '#2D2D2D', borderColor: '#FF6B6B', minWidth: '200px' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#FF6B6B' }} />
    <Handle type="source" position={Position.Bottom} style={{ background: '#FF6B6B' }} />
    <div className="flex items-center space-x-2 mb-2">
      <span className="text-2xl">⚡</span>
      <span className="font-bold" style={{ color: '#FF6B6B' }}>Action</span>
    </div>
    <select
      value={data.action || 'send_email'}
      onChange={(e) => data.onChange?.(e.target.value)}
      className="w-full p-2 rounded text-sm"
      style={{ backgroundColor: '#1F1F1F', color: '#FFFFFF', border: '1px solid #27705D' }}
    >
      <option value="send_email">Send Email</option>
      <option value="create_ticket">Create Ticket</option>
      <option value="schedule">Schedule Meeting</option>
      <option value="transfer">Transfer to Human</option>
      <option value="webhook">Call Webhook</option>
    </select>
  </div>
)

const AIResponseNode = ({ data }) => (
  <div className="px-6 py-4 rounded-lg shadow-lg border-2" style={{ backgroundColor: '#2D2D2D', borderColor: '#9B59B6', minWidth: '250px' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#9B59B6' }} />
    <Handle type="source" position={Position.Bottom} style={{ background: '#9B59B6' }} />
    <div className="flex items-center space-x-2 mb-2">
      <span className="text-2xl">🤖</span>
      <span className="font-bold" style={{ color: '#9B59B6' }}>AI Response</span>
    </div>
    <textarea
      value={data.prompt || ''}
      onChange={(e) => data.onChange?.(e.target.value)}
      placeholder="Enter AI prompt context..."
      className="w-full p-2 rounded text-sm resize-none"
      style={{ backgroundColor: '#1F1F1F', color: '#FFFFFF', border: '1px solid #27705D' }}
      rows="3"
    />
  </div>
)

const EndNode = ({ data }) => (
  <div className="px-6 py-4 rounded-lg shadow-lg border-2" style={{ backgroundColor: '#2D2D2D', borderColor: '#FF6B6B', minWidth: '200px' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#FF6B6B' }} />
    <div className="flex items-center space-x-2 mb-2">
      <span className="text-2xl">🏁</span>
      <span className="font-bold" style={{ color: '#FF6B6B' }}>End</span>
    </div>
    <div className="text-sm" style={{ color: '#E5E7EB' }}>
      {data.label || 'Conversation ends'}
    </div>
  </div>
)

const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  question: QuestionNode,
  condition: ConditionNode,
  action: ActionNode,
  aiResponse: AIResponseNode,
  end: EndNode,
}

const initialNodes = [
  {
    id: '1',
    type: 'start',
    position: { x: 250, y: 50 },
    data: { label: 'Welcome to your AI Agent' },
  },
]

const initialEdges = []

function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [flowName, setFlowName] = useState('My AI Agent Flow')
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#75FDA8', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#75FDA8',
            },
          },
          eds
        )
      ),
    [setEdges]
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      if (!reactFlowInstance) return

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode = {
        id: `${Date.now()}`,
        type,
        position,
        data: {
          label: `${type} node`,
          onChange: (value) => {
            setNodes((nds) =>
              nds.map((node) => {
                if (node.id === newNode.id) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      [type === 'message' ? 'message' : type === 'question' ? 'question' : type === 'aiResponse' ? 'prompt' : type === 'condition' ? 'condition' : 'action']: value,
                    },
                  }
                }
                return node
              })
            )
          },
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes]
  )

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleSaveFlow = async () => {
    const flowData = {
      flowName,
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      })),
      createdAt: new Date().toISOString(),
    }

    console.log('Saving flow to backend:', flowData)

    try {
      // TODO: Replace with your actual backend endpoint
      const response = await fetch('/api/flows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(flowData),
      })

      if (response.ok) {
        alert('Flow saved successfully! 🎉')
      } else {
        throw new Error('Failed to save flow')
      }
    } catch (error) {
      console.error('Error saving flow:', error)
      alert('Flow saved locally (backend endpoint not configured yet)')
      // Save to localStorage as fallback
      localStorage.setItem('aiAgentFlow', JSON.stringify(flowData))
    }
  }

  const handleClearFlow = () => {
    if (confirm('Are you sure you want to clear the flow? This cannot be undone.')) {
      setNodes(initialNodes)
      setEdges(initialEdges)
    }
  }

  const nodeLibrary = [
    { type: 'start', icon: '🚀', label: 'Start', color: '#75FDA8' },
    { type: 'message', icon: '💬', label: 'Message', color: '#75FDA8' },
    { type: 'question', icon: '❓', label: 'Question', color: '#75FDA8' },
    { type: 'condition', icon: '🔀', label: 'Condition', color: '#FFB800' },
    { type: 'action', icon: '⚡', label: 'Action', color: '#FF6B6B' },
    { type: 'aiResponse', icon: '🤖', label: 'AI Response', color: '#9B59B6' },
    { type: 'end', icon: '🏁', label: 'End', color: '#FF6B6B' },
  ]

  return (
    <div className="h-[calc(100vh-200px)] flex gap-4">
      {/* Left Sidebar - Node Library */}
      <div className="w-64 p-4 rounded-lg overflow-y-auto" style={{ backgroundColor: '#2D2D2D', border: '1px solid #27705D' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: '#75FDA8' }}>
          Node Library
        </h3>
        <div className="space-y-2">
          {nodeLibrary.map((node) => (
            <div
              key={node.type}
              draggable
              onDragStart={(event) => onDragStart(event, node.type)}
              className="p-3 rounded-lg cursor-move transition-all duration-200 border-2"
              style={{
                backgroundColor: '#1F1F1F',
                borderColor: node.color,
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#27705D'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1F1F1F'
              }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-xl">{node.icon}</span>
                <span className="font-medium">{node.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6" style={{ borderTop: '1px solid #27705D' }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: '#75FDA8' }}>
            Flow Settings
          </h3>
          <input
            type="text"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            placeholder="Flow Name"
            className="w-full p-2 rounded text-sm mb-3"
            style={{ backgroundColor: '#1F1F1F', color: '#FFFFFF', border: '1px solid #27705D' }}
          />
          <button
            onClick={handleSaveFlow}
            className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 mb-2"
            style={{ backgroundColor: '#75FDA8', color: '#2D2D2D' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#27705D'
              e.target.style.color = '#FFFFFF'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#75FDA8'
              e.target.style.color = '#2D2D2D'
            }}
          >
            💾 Save Flow
          </button>
          <button
            onClick={handleClearFlow}
            className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-200"
            style={{ backgroundColor: '#FF6B6B', color: '#FFFFFF' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#CC0000'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#FF6B6B'
            }}
          >
            🗑️ Clear Flow
          </button>
        </div>

        <div className="mt-4 p-3 rounded" style={{ backgroundColor: '#1F1F1F' }}>
          <p className="text-xs" style={{ color: '#E5E7EB' }}>
            <strong>Tip:</strong> Drag and drop nodes onto the canvas, then connect them to create your AI agent flow.
          </p>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 rounded-lg overflow-hidden" style={{ border: '2px solid #27705D' }}>
        <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            style={{ backgroundColor: '#1F1F1F' }}
          >
            <Controls style={{ button: { backgroundColor: '#2D2D2D', borderColor: '#27705D' } }} />
            <MiniMap
              style={{ backgroundColor: '#2D2D2D' }}
              nodeColor={(node) => {
                switch (node.type) {
                  case 'start':
                  case 'message':
                  case 'question':
                    return '#75FDA8'
                  case 'condition':
                    return '#FFB800'
                  case 'action':
                  case 'end':
                    return '#FF6B6B'
                  case 'aiResponse':
                    return '#9B59B6'
                  default:
                    return '#75FDA8'
                }
              }}
            />
            <Background color="#27705D" gap={16} />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}

export default FlowBuilder
