// SchemaFlow.js
import { useState, useRef, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, Controls, Panel, SmoothStepEdge, getSmoothStepPath } from 'reactflow';
import { FiX, FiZoomIn, FiZoomOut, FiMinimize2 } from 'react-icons/fi';
import 'reactflow/dist/style.css';
import TableNode from './TableNode';

// Custom Edge Component with Database Notation
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleMouseEnter = (event) => {
    setShowTooltip(true);
    setTooltipPosition({
      x: event.clientX + 15,
      y: event.clientY - 10
    });
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleMouseMove = (event) => {
    if (showTooltip) {
      setTooltipPosition({
        x: event.clientX + 15,
        y: event.clientY - 10
      });
    }
  };

  const getRelationshipTypeLabel = (type) => {
    switch (type) {
      case 'one-to-one': return 'One-to-One (1:1)';
      case 'one-to-many': return 'One-to-Many (1:N)';
      case 'many-to-one': return 'Many-to-One (N:1)';
      case 'many-to-many': return 'Many-to-Many (M:N)';
      default: return 'Many-to-One (N:1)';
    }
  };

  const getRelationshipDescription = (type, sourceTable, targetTable, sourceColumn) => {
    switch (type) {
      case 'one-to-one':
        return `Each record in ${targetTable} corresponds to exactly one record in ${sourceTable}. This is typically used for extending table data or splitting large tables.`;
      case 'one-to-many':
        return `One record in ${targetTable} can be associated with multiple records in ${sourceTable}. This is the most common relationship type.`;
      case 'many-to-one':
        return `Multiple records in ${sourceTable} can reference the same record in ${targetTable} through the ${sourceColumn} foreign key.`;
      case 'many-to-many':
        return `${sourceTable} acts as a junction table, allowing many-to-many relationships between ${targetTable} and other tables.`;
      default:
        return `${sourceTable} references ${targetTable} through a foreign key relationship.`;
    }
  };

  // Create tooltip portal
  useEffect(() => {
    if (showTooltip && data) {
      const tooltip = document.createElement('div');
      tooltip.className = 'fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm max-w-xs pointer-events-none';
      tooltip.style.left = `${tooltipPosition.x + 10}px`;
      tooltip.style.top = `${tooltipPosition.y - 10}px`;

      tooltip.innerHTML = `
        <div class="space-y-3">
          <div class="border-b border-gray-200 pb-2">
            <span class="font-semibold text-gray-800 text-base">Foreign Key Relationship</span>
          </div>
          <div class="space-y-2">
            <div>
              <span class="text-gray-600 text-sm">References:</span>
              <div class="font-mono text-blue-700 text-sm mt-1">
                <span class="font-semibold">${data.targetTable}</span>.<span class="text-blue-600">${data.targetColumn}</span>
                <span class="text-gray-500 mx-2">→</span>
                <span class="font-semibold">${data.sourceTable}</span>.<span class="text-blue-600">${data.sourceColumn}</span>
              </div>
            </div>
            <div>
              <span class="text-gray-600 text-sm">Relationship Type:</span>
              <span class="ml-2 px-2 py-1 text-xs font-semibold rounded ${data.relationshipType === 'one-to-one' ? 'bg-purple-100 text-purple-800' :
          data.relationshipType === 'one-to-many' ? 'bg-blue-100 text-blue-800' :
            data.relationshipType === 'many-to-one' ? 'bg-green-100 text-green-800' :
              data.relationshipType === 'many-to-many' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
        }">${getRelationshipTypeLabel(data.relationshipType)}</span>
            </div>
            ${data.constraintName ? `
            <div>
              <span class="text-gray-600 text-sm">Constraint:</span>
              <span class="font-mono text-xs text-gray-700 ml-2">${data.constraintName}</span>
            </div>
            ` : ''}
            <div class="pt-2 border-t border-gray-100">
              <span class="text-gray-600 text-sm">Description:</span>
              <p class="text-gray-700 text-sm mt-1 leading-relaxed">
                ${getRelationshipDescription(data.relationshipType, data.sourceTable, data.targetTable, data.sourceColumn)}
              </p>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(tooltip);

      return () => {
        if (document.body.contains(tooltip)) {
          document.body.removeChild(tooltip);
        }
      };
    }
  }, [showTooltip, tooltipPosition, data]);

  // Use the exact same patterns as the legend - markers positioned exactly on the line endpoints
  const renderRelationshipMarkers = () => {
    if (!data?.relationshipType) return null;

    // Position markers exactly at the line endpoints (no offset)
    const startX = sourceX;
    const startY = sourceY;
    const endX = targetX;
    const endY = targetY;

    // Red color for markers, different sizes for different marker types
    const markerColor = "#ef4444"; // Red color for relationship markers
    const strokeWidth = "1"; // Thin stroke as before
    const crowFootSize = 18; // Even larger size for crow's foot (many) markers for better visibility
    const barSize = 8; // Smaller size for bar (one) markers

    switch (data.relationshipType) {
      case 'one-to-one':
        // 1:1 - Bar on both ends (smaller bars)
        return (
          <g>
            <line x1={startX} y1={startY - barSize} x2={startX} y2={startY + barSize} stroke={markerColor} strokeWidth={strokeWidth} />
            <line x1={endX} y1={endY - barSize} x2={endX} y2={endY + barSize} stroke={markerColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'one-to-many':
        // 1:N - Bar at start (smaller), crow's foot at end (larger)
        return (
          <g>
            <line x1={startX} y1={startY - barSize} x2={startX} y2={startY + barSize} stroke={markerColor} strokeWidth={strokeWidth} />
            <path d={`M${endX},${endY} L${endX + crowFootSize},${endY - crowFootSize} M${endX},${endY} L${endX + crowFootSize},${endY} M${endX},${endY} L${endX + crowFootSize},${endY + crowFootSize}`} stroke={markerColor} strokeWidth={strokeWidth} fill="none" />
          </g>
        );

      case 'many-to-one':
        // N:1 - Crow's foot at start (larger), bar at end (smaller)
        return (
          <g>
            <path d={`M${startX},${startY} L${startX - crowFootSize},${startY - crowFootSize} M${startX},${startY} L${startX - crowFootSize},${startY} M${startX},${startY} L${startX - crowFootSize},${startY + crowFootSize}`} stroke={markerColor} strokeWidth={strokeWidth} fill="none" />
            <line x1={endX} y1={endY - barSize} x2={endX} y2={endY + barSize} stroke={markerColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'many-to-many':
        // M:N - Crow's foot on both ends (larger)
        return (
          <g>
            <path d={`M${startX},${startY} L${startX - crowFootSize},${startY - crowFootSize} M${startX},${startY} L${startX - crowFootSize},${startY} M${startX},${startY} L${startX - crowFootSize},${startY + crowFootSize}`} stroke={markerColor} strokeWidth={strokeWidth} fill="none" />
            <path d={`M${endX},${endY} L${endX + crowFootSize},${endY - crowFootSize} M${endX},${endY} L${endX + crowFootSize},${endY} M${endX},${endY} L${endX + crowFootSize},${endY + crowFootSize}`} stroke={markerColor} strokeWidth={strokeWidth} fill="none" />
          </g>
        );

      default:
        // Default to N:1 (crow's foot larger, bar smaller)
        return (
          <g>
            <path d={`M${startX},${startY} L${startX - crowFootSize},${startY - crowFootSize} M${startX},${startY} L${startX - crowFootSize},${startY} M${startX},${startY} L${startX - crowFootSize},${startY + crowFootSize}`} stroke={markerColor} strokeWidth={strokeWidth} fill="none" />
            <line x1={endX} y1={endY - barSize} x2={endX} y2={endY + barSize} stroke={markerColor} strokeWidth={strokeWidth} />
          </g>
        );
    }
  };

  return (
    <g>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path cursor-pointer"
        d={edgePath}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        strokeWidth={style.strokeWidth || 1.5}
        fill="none"
      />
      {renderRelationshipMarkers()}
    </g>
  );
};

// Define nodeTypes and edgeTypes outside the component to prevent recreation on every render
const nodeTypes = {
  tableNode: TableNode
};

const edgeTypes = {
  default: SmoothStepEdge,
  custom: CustomEdge
};

const SchemaFlow = ({ tables, tableDetails, onClose, onTableSelect }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);


  const [zoom, setZoom] = useState(1);
  const [hoveredRelationship, setHoveredRelationship] = useState(null);
  const [relationshipCardPosition, setRelationshipCardPosition] = useState({ x: 0, y: 0 });



  useEffect(() => {
    if (tables.length > 0 && Object.keys(tableDetails).length > 0) {
      // Calculate positions in a grid layout with proper spacing
      const cols = Math.ceil(Math.sqrt(tables.length));
      const horizontalSpacing = 400; // Reset to original spacing
      const verticalSpacing = 400; // Reset to original spacing

      const initialNodes = tables.map((table, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;

        return {
          id: table.name,
          type: 'tableNode',
          position: {
            x: col * horizontalSpacing + 50,
            y: row * verticalSpacing + 88 // Added 38px (1cm) top margin to avoid navbar overlay
          },
          data: {
            tableName: table.name,
            columns: tableDetails[table.name]?.columns || []
          },
          sourcePosition: 'right',
          targetPosition: 'left'
        };
      });

      const foreignKeys = [];
      tables.forEach(table => {
        const columns = tableDetails[table.name]?.columns || [];
        columns.forEach(col => {
          if (col.relationship) {
            const { referencedTable, referencedColumn, relationshipType } = col.relationship;

            // Skip self-referencing relationships (table referencing itself)
            if (tableDetails[referencedTable] && referencedTable !== table.name) {
              let edgeStyle = {
                stroke: '#d1d5db',
                strokeWidth: 1.5
              };
              let label = `${col.name} → ${referencedColumn}`;

              // Set label based on relationship type
              switch (relationshipType) {
                case 'one-to-one':
                  label = `1:1 ${col.name}`;
                  break;
                case 'one-to-many':
                  label = `1:N ${col.name}`;
                  break;
                case 'many-to-one':
                  label = `N:1 ${col.name}`;
                  break;
                case 'many-to-many':
                  label = `M:N ${col.name}`;
                  break;
                default:
                  label = `N:1 ${col.name}`;
              }

              foreignKeys.push({
                source: table.name,
                target: referencedTable,
                sourceHandle: `${table.name}-${col.name}-source`,
                targetHandle: `${referencedTable}-${referencedColumn}-target`,
                id: `${table.name}-${referencedTable}-${col.name}`,
                label,
                style: edgeStyle,
                labelStyle: {
                  fontSize: '10px',
                  fontWeight: '500',
                  fill: '#6b7280'
                },
                labelBgStyle: {
                  fill: 'white',
                  opacity: 0.95,
                  rx: 4,
                  ry: 4
                },
                data: {
                  relationshipType,
                  sourceColumn: referencedColumn,
                  targetColumn: col.name,
                  sourceTable: referencedTable,
                  targetTable: table.name
                },
                type: 'custom'
              });
            }
          }
        });
      });

      setNodes(initialNodes);
      setEdges(foreignKeys);
    }
  }, [tables, tableDetails]);

  // Add event listeners for relationship hover
  useEffect(() => {
    const handleRelationshipHover = (event) => {
      const relationshipElement = event.target.closest('[data-relationship]');
      if (relationshipElement) {
        const relationshipData = JSON.parse(relationshipElement.getAttribute('data-relationship'));
        setHoveredRelationship(relationshipData);
        setRelationshipCardPosition({
          x: event.clientX + 10,
          y: event.clientY - 10
        });
      }
    };

    const handleRelationshipLeave = (event) => {
      if (!event.target.closest('[data-relationship]')) {
        setHoveredRelationship(null);
      }
    };

    document.addEventListener('mouseover', handleRelationshipHover);
    document.addEventListener('mouseout', handleRelationshipLeave);

    return () => {
      document.removeEventListener('mouseover', handleRelationshipHover);
      document.removeEventListener('mouseout', handleRelationshipLeave);
    };
  }, []);

  const onElementClick = (_, element) => {
    if (element.type === 'tableNode') {
      onTableSelect(element.data);
    }
  };

  const onPaneClick = () => {
    // Handle pane click if needed
  };

  const handleFitView = () => {
    reactFlowInstance?.fitView({ padding: 0.2, duration: 200 });
  };

  const handleZoomIn = () => {
    reactFlowInstance?.zoomIn({ duration: 200 });
  };

  const handleZoomOut = () => {
    reactFlowInstance?.zoomOut({ duration: 200 });
  };

  return (
    <div className="flex-1 h-full relative" ref={reactFlowWrapper}>


      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onElementClick}
        onEdgeClick={onElementClick}
        onPaneClick={onPaneClick}
        onMove={(_, viewport) => setZoom(viewport.zoom)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { strokeWidth: 1.5, stroke: '#d1d5db' },
        }}
        nodesDraggable
        nodesConnectable={false}
      >
        <Controls
          className="!bg-white !rounded-md !shadow-sm !border !border-gray-300"
          position="top-right"
        />
        <Panel position="top-right" className="space-x-1 mt-10">
          <button
            onClick={handleFitView}
            className="bg-white p-1.5 rounded-md shadow-sm border border-gray-300 hover:bg-gray-50 text-gray-600"
            title="Fit View"
          >
            <FiMinimize2 size={14} />
          </button>
          <button
            onClick={handleZoomIn}
            className="bg-white p-1.5 rounded-md shadow-sm border border-gray-300 hover:bg-gray-50 text-gray-600"
            title="Zoom In"
          >
            <FiZoomIn size={14} />
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-white p-1.5 rounded-md shadow-sm border border-gray-300 hover:bg-gray-50 text-gray-600"
            title="Zoom Out"
          >
            <FiZoomOut size={14} />
          </button>

          <button
            onClick={onClose}
            className="bg-white p-1.5 rounded-md shadow-sm border border-gray-300 hover:bg-red-50 hover:text-red-600 text-gray-600"
            title="Close"
          >
            <FiX size={14} />
          </button>
        </Panel>
      </ReactFlow>



      <div className="absolute top-3 left-3 bg-white px-2 py-0.5 rounded-md shadow-sm text-xs text-gray-600 z-10 border border-gray-300">
        {Math.round(zoom * 100)}%
      </div>

      {/* Relationship Card */}
      {hoveredRelationship && (
        <div
          className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm max-w-xs pointer-events-none"
          style={{
            left: relationshipCardPosition.x,
            top: relationshipCardPosition.y
          }}
        >
          <div className="space-y-2">
            <div className="font-semibold text-gray-700 border-b border-gray-200 pb-1">
              Relationship Details
            </div>
            <div>
              <span className="text-gray-600">Connected Table: </span>
              <span className="font-semibold text-blue-600">{hoveredRelationship.table}</span>
            </div>
            <div>
              <span className="text-gray-600">Relationship: </span>
              <span className="font-mono text-sm text-gray-800">{hoveredRelationship.column} → {hoveredRelationship.referencedColumn}</span>
            </div>
            <div>
              <span className="text-gray-600">Type: </span>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${hoveredRelationship.type === '1:1' ? 'bg-purple-100 text-purple-800' :
                hoveredRelationship.type === '1:N' ? 'bg-blue-100 text-blue-800' :
                  hoveredRelationship.type === 'M:N' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                }`}>{hoveredRelationship.type}</span>
            </div>
            {hoveredRelationship.constraintName && (
              <div>
                <span className="text-gray-600">Constraint: </span>
                <span className="font-mono text-xs text-gray-700">{hoveredRelationship.constraintName}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaFlow;