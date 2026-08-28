// components/builder/LayoutEditor.jsx - COMPLETE MODERN VERSION
import React, { useState } from 'react';
import {
  GripVertical, Edit, Trash2, Maximize,
  Minimize, Copy, RefreshCw, X,
  Grid, Layout, Eye, Settings,
  Target, Clock, Users, BarChart2,
  Activity, AlertCircle, CheckCircle,
  Calendar, Filter, Plus, Move
} from 'lucide-react';
import toast from 'react-hot-toast';

const LayoutEditor = ({ 
  layout, 
  onLayoutChange, 
  onWidgetRemove,
  onWidgetConfig,
  onWidgetDuplicate,
  readOnly = false 
}) => {
  const [draggingWidget, setDraggingWidget] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [hoveredWidget, setHoveredWidget] = useState(null);

  const handleDragStart = (e, widgetId) => {
    if (readOnly) return;
    setDraggingWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widgetId);
    // Add drag ghost styling
    e.target.style.opacity = '0.5';
  };

  const handleDragOver = (e, widgetId) => {
    if (readOnly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(widgetId);
  };

  const handleDragEnd = (e) => {
    if (readOnly) return;
    e.target.style.opacity = '1';
    setDraggingWidget(null);
    setDragOver(null);
  };

  const handleDrop = (e, targetId) => {
    if (readOnly) return;
    e.preventDefault();
    e.target.style.opacity = '1';
    
    const sourceId = e.dataTransfer.getData('text/plain') || draggingWidget;
    
    if (sourceId && sourceId !== targetId) {
      const oldIndex = layout.findIndex(w => w.id === sourceId);
      const newIndex = layout.findIndex(w => w.id === targetId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newLayout = [...layout];
        const [movedItem] = newLayout.splice(oldIndex, 1);
        newLayout.splice(newIndex, 0, movedItem);
        onLayoutChange(newLayout);
        toast.success('Widget repositioned');
      }
    }
    setDraggingWidget(null);
    setDragOver(null);
  };

  const handleDuplicate = (widgetId) => {
    if (onWidgetDuplicate) {
      onWidgetDuplicate(widgetId);
      toast.success('Widget duplicated');
    }
  };

  const getWidgetSize = (widget) => {
    const sizeMap = {
      1: 'le-col-span-1',
      2: 'le-col-span-2',
      3: 'le-col-span-3',
      4: 'le-col-span-4',
      5: 'le-col-span-5',
      6: 'le-col-span-6'
    };
    return sizeMap[widget.position?.w || 3] || 'le-col-span-3';
  };

  const getWidgetHeight = (widget) => {
    const heightMap = {
      1: 'le-h-32',
      2: 'le-h-44',
      3: 'le-h-56',
      4: 'le-h-68',
      5: 'le-h-80',
      6: 'le-h-92'
    };
    return heightMap[widget.position?.h || 3] || 'le-h-56';
  };

  const getWidgetIcon = (type) => {
    const icons = {
      'kpi_card': Target,
      'task_status': CheckCircle,
      'activity_feed': Activity,
      'risk_list': AlertCircle,
      'performance_chart': BarChart2,
      'goal_progress': Target,
      'number': BarChart2,
      'percentage': Activity,
      'progress_bar': Layout,
      'table': Grid,
      'employee_ranking': Users,
      'team_ranking': Users,
      'revenue_chart': BarChart2,
      'project_status': CheckCircle,
      'calendar': Calendar
    };
    const Icon = icons[type] || Layout;
    return <Icon className="le-widget-icon" />;
  };

  const getWidgetColor = (type) => {
    const colors = {
      'kpi_card': 'le-widget-kpi',
      'task_status': 'le-widget-task',
      'activity_feed': 'le-widget-activity',
      'risk_list': 'le-widget-risk',
      'performance_chart': 'le-widget-chart',
      'goal_progress': 'le-widget-goal',
      'number': 'le-widget-number',
      'percentage': 'le-widget-percentage',
      'progress_bar': 'le-widget-progress',
      'table': 'le-widget-table',
      'employee_ranking': 'le-widget-ranking',
      'team_ranking': 'le-widget-ranking',
      'revenue_chart': 'le-widget-chart',
      'project_status': 'le-widget-task',
      'calendar': 'le-widget-activity'
    };
    return colors[type] || 'le-widget-default';
  };

  const getWidgetTypeLabel = (type) => {
    const labels = {
      'kpi_card': 'KPI',
      'task_status': 'Tasks',
      'activity_feed': 'Activity',
      'risk_list': 'Risks',
      'performance_chart': 'Chart',
      'goal_progress': 'Goals',
      'number': 'Number',
      'percentage': 'Percent',
      'progress_bar': 'Progress',
      'table': 'Table',
      'employee_ranking': 'Ranking',
      'team_ranking': 'Ranking',
      'revenue_chart': 'Revenue',
      'project_status': 'Project',
      'calendar': 'Calendar'
    };
    return labels[type] || type;
  };

  const handleExpandAll = () => {
    const newLayout = layout.map(w => ({
      ...w,
      position: { ...w.position, w: Math.min((w.position?.w || 3) + 2, 6) }
    }));
    onLayoutChange(newLayout);
    toast.success('All widgets expanded');
  };

  const handleShrinkAll = () => {
    const newLayout = layout.map(w => ({
      ...w,
      position: { ...w.position, w: Math.max((w.position?.w || 3) - 2, 1) }
    }));
    onLayoutChange(newLayout);
    toast.success('All widgets shrunk');
  };

  const handleResetLayout = () => {
    const newLayout = layout.map((w, index) => ({
      ...w,
      position: {
        x: index % 2 === 0 ? 0 : 3,
        y: Math.floor(index / 2) * 3,
        w: 3,
        h: 3
      }
    }));
    onLayoutChange(newLayout);
    toast.success('Layout reset');
  };

  if (layout.length === 0) {
    return (
      <div className="le-empty">
        <div className="le-empty-icon-wrapper">
          <Layout className="le-empty-icon" />
        </div>
        <h3 className="le-empty-title">No widgets added yet</h3>
        <p className="le-empty-subtitle">Click "Add Widget" to start building your dashboard</p>
        <div className="le-empty-hint">
          <Move className="le-empty-hint-icon" />
          Drag widgets to rearrange them
        </div>
      </div>
    );
  }

  return (
    <div className="le-container">
      <div className="le-grid">
        {layout.map((widget) => {
          const isSelected = selectedWidget === widget.id;
          const isDragging = draggingWidget === widget.id;
          const isDragOver = dragOver === widget.id;
          const isHovered = hoveredWidget === widget.id;
          const widgetColor = getWidgetColor(widget.type);
          
          return (
            <div
              key={widget.id}
              draggable={!readOnly}
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDragOver={(e) => handleDragOver(e, widget.id)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, widget.id)}
              onMouseEnter={() => setHoveredWidget(widget.id)}
              onMouseLeave={() => setHoveredWidget(null)}
              className={`
                ${getWidgetSize(widget)}
                ${getWidgetHeight(widget)}
                le-widget
                ${widgetColor}
                ${isSelected ? 'le-widget-selected' : ''}
                ${isDragging ? 'le-widget-dragging' : ''}
                ${isDragOver ? 'le-widget-drag-over' : ''}
                ${isHovered ? 'le-widget-hovered' : ''}
                ${readOnly ? 'le-widget-readonly' : ''}
              `}
              onClick={() => setSelectedWidget(widget.id)}
            >
              {/* Widget Header */}
              <div className="le-widget-header">
                <div className="le-widget-header-left">
                  {!readOnly && (
                    <div className="le-widget-grip" title="Drag to reposition">
                      <GripVertical className="le-grip-icon" />
                    </div>
                  )}
                  <div className="le-widget-icon-wrapper">
                    {getWidgetIcon(widget.type)}
                  </div>
                  <span className="le-widget-name">{widget.name}</span>
                  <span className="le-widget-type-badge">
                    {getWidgetTypeLabel(widget.type)}
                  </span>
                </div>
                {!readOnly && (
                  <div className="le-widget-actions">
                    <button
                      className="le-action-btn le-action-config"
                      onClick={(e) => {
                        e.stopPropagation();
                        onWidgetConfig(widget);
                      }}
                      title="Configure"
                    >
                      <Settings className="le-action-icon" />
                    </button>
                    <button
                      className="le-action-btn le-action-duplicate"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(widget.id);
                      }}
                      title="Duplicate"
                    >
                      <Copy className="le-action-icon" />
                    </button>
                    <button
                      className="le-action-btn le-action-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onWidgetRemove(widget.id);
                      }}
                      title="Remove"
                    >
                      <Trash2 className="le-action-icon" />
                    </button>
                  </div>
                )}
              </div>

              {/* Widget Content */}
              <div className="le-widget-body">
                <div className="le-widget-content">
                  <div className="le-widget-preview-icon">
                    {getWidgetIcon(widget.type)}
                  </div>
                  <p className="le-widget-preview-name">{widget.name}</p>
                  <p className="le-widget-preview-hint">
                    {readOnly ? 'Preview mode' : 'Click to select • Drag to reposition'}
                  </p>
                  {!readOnly && (
                    <div className="le-widget-size-info">
                      <span>W: {widget.position?.w || 3}</span>
                      <span>H: {widget.position?.h || 3}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Resize Handle */}
              {!readOnly && (
                <div className="le-resize-handle" title="Resize widget">
                  <div className="le-resize-dot"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      {!readOnly && layout.length > 0 && (
        <div className="le-controls">
          <div className="le-controls-left">
            <span className="le-controls-info">
              {layout.length} widget{layout.length !== 1 ? 's' : ''}
            </span>
            <span className="le-controls-divider">•</span>
            <span className="le-controls-hint">
              Click to select • Drag to reorder
            </span>
          </div>
          <div className="le-controls-right">
            <button
              onClick={handleShrinkAll}
              className="le-control-btn"
              title="Shrink all widgets"
            >
              <Minimize className="le-control-icon" />
              Shrink
            </button>
            <button
              onClick={handleExpandAll}
              className="le-control-btn"
              title="Expand all widgets"
            >
              <Maximize className="le-control-icon" />
              Expand
            </button>
            <button
              onClick={handleResetLayout}
              className="le-control-btn le-control-btn-reset"
              title="Reset layout"
            >
              <RefreshCw className="le-control-icon" />
              Reset
            </button>
          </div>
        </div>
      )}

      <style>{`
        /* ============================================
           CONTAINER
           ============================================ */
        .le-container {
          padding: 0;
          max-width: 100%;
        }

        /* ============================================
           GRID
           ============================================ */
        .le-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          padding: 4px;
        }

        .le-col-span-1 { grid-column: span 1; }
        .le-col-span-2 { grid-column: span 2; }
        .le-col-span-3 { grid-column: span 3; }
        .le-col-span-4 { grid-column: span 4; }
        .le-col-span-5 { grid-column: span 5; }
        .le-col-span-6 { grid-column: span 6; }

        .le-h-32 { min-height: 128px; }
        .le-h-44 { min-height: 176px; }
        .le-h-56 { min-height: 224px; }
        .le-h-68 { min-height: 272px; }
        .le-h-80 { min-height: 320px; }
        .le-h-92 { min-height: 368px; }

        /* ============================================
           WIDGET
           ============================================ */
        .le-widget {
          background: #ffffff;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          position: relative;
          cursor: pointer;
          overflow: hidden;
        }

        .le-widget:hover {
          border-color: #94a3b8;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .le-widget-selected {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(59, 130, 246, 0.1);
        }

        .le-widget-dragging {
          opacity: 0.4;
          transform: scale(0.95);
          border-color: #3b82f6;
        }

        .le-widget-drag-over {
          border-color: #3b82f6;
          background: #eff6ff;
          transform: scale(1.02);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .le-widget-hovered {
          border-color: #93c5fd;
        }

        .le-widget-readonly {
          cursor: default;
        }

        .le-widget-readonly:hover {
          border-color: #e5e7eb;
          box-shadow: none;
        }

        /* Widget Colors */
        .le-widget-kpi { border-color: #bfdbfe; background: #eff6ff; }
        .le-widget-task { border-color: #bbf7d0; background: #f0fdf4; }
        .le-widget-activity { border-color: #e9d5ff; background: #faf5ff; }
        .le-widget-risk { border-color: #fecaca; background: #fef2f2; }
        .le-widget-chart { border-color: #fed7aa; background: #fff7ed; }
        .le-widget-goal { border-color: #c7d2fe; background: #eef2ff; }
        .le-widget-number { border-color: #e5e7eb; background: #f9fafb; }
        .le-widget-percentage { border-color: #bfdbfe; background: #eff6ff; }
        .le-widget-progress { border-color: #e5e7eb; background: #f9fafb; }
        .le-widget-table { border-color: #e5e7eb; background: #f9fafb; }
        .le-widget-ranking { border-color: #bfdbfe; background: #eff6ff; }
        .le-widget-default { border-color: #e5e7eb; background: #ffffff; }

        /* ============================================
           WIDGET HEADER
           ============================================ */
        .le-widget-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.8);
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          flex-shrink: 0;
          min-height: 44px;
        }

        .le-widget-header-left {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          flex: 1;
        }

        .le-widget-grip {
          padding: 2px;
          cursor: grab;
          display: flex;
          align-items: center;
          opacity: 0.5;
          transition: opacity 0.2s ease;
        }

        .le-widget-grip:hover {
          opacity: 1;
        }

        .le-grip-icon {
          width: 14px;
          height: 14px;
          color: #9ca3af;
        }

        .le-widget-icon-wrapper {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: rgba(59, 130, 246, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .le-widget-icon {
          width: 14px;
          height: 14px;
          color: #3b82f6;
        }

        .le-widget-name {
          font-size: 13px;
          font-weight: 500;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .le-widget-type-badge {
          font-size: 9px;
          padding: 1px 6px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }

        /* ============================================
           WIDGET ACTIONS
           ============================================ */
        .le-widget-actions {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .le-widget:hover .le-widget-actions,
        .le-widget-selected .le-widget-actions {
          opacity: 1;
        }

        .le-action-btn {
          padding: 3px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
        }

        .le-action-btn:hover {
          background: rgba(0, 0, 0, 0.06);
        }

        .le-action-config:hover {
          color: #3b82f6;
          background: #eff6ff;
        }

        .le-action-duplicate:hover {
          color: #8b5cf6;
          background: #f5f3ff;
        }

        .le-action-delete:hover {
          color: #ef4444;
          background: #fef2f2;
        }

        .le-action-icon {
          width: 13px;
          height: 13px;
        }

        /* ============================================
           WIDGET BODY
           ============================================ */
        .le-widget-body {
          flex: 1;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
        }

        .le-widget-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: #9ca3af;
          text-align: center;
        }

        .le-widget-preview-icon {
          width: 32px;
          height: 32px;
          color: #d1d5db;
        }

        .le-widget-preview-icon .le-widget-icon {
          width: 32px;
          height: 32px;
          color: #d1d5db;
        }

        .le-widget-preview-name {
          font-size: 14px;
          font-weight: 500;
          color: #4b5563;
        }

        .le-widget-preview-hint {
          font-size: 11px;
          color: #d1d5db;
        }

        .le-widget-size-info {
          display: flex;
          gap: 8px;
          font-size: 10px;
          color: #d1d5db;
          font-family: monospace;
          margin-top: 4px;
        }

        /* ============================================
           RESIZE HANDLE
           ============================================ */
        .le-resize-handle {
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 16px;
          height: 16px;
          cursor: nw-resize;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .le-widget:hover .le-resize-handle,
        .le-widget-selected .le-resize-handle {
          opacity: 1;
        }

        .le-resize-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 8px;
          height: 8px;
          border-right: 2px solid #9ca3af;
          border-bottom: 2px solid #9ca3af;
          border-radius: 0 0 2px 0;
        }

        /* ============================================
           EMPTY STATE
           ============================================ */
        .le-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          min-height: 300px;
        }

        .le-empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: #f3f4f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .le-empty-icon {
          width: 40px;
          height: 40px;
          color: #9ca3af;
        }

        .le-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .le-empty-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }

        .le-empty-hint {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          padding: 6px 16px;
          background: #f9fafb;
          border-radius: 8px;
          font-size: 13px;
          color: #6b7280;
        }

        .le-empty-hint-icon {
          width: 16px;
          height: 16px;
          color: #9ca3af;
        }

        /* ============================================
           CONTROLS
           ============================================ */
        .le-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 4px 0 4px;
          margin-top: 16px;
          border-top: 1px solid #f3f4f6;
          flex-wrap: wrap;
          gap: 8px;
        }

        .le-controls-left {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6b7280;
        }

        .le-controls-divider {
          color: #d1d5db;
        }

        .le-controls-hint {
          color: #9ca3af;
          font-size: 12px;
        }

        .le-controls-right {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .le-control-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #ffffff;
          color: #6b7280;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .le-control-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .le-control-btn-reset:hover {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .le-control-icon {
          width: 14px;
          height: 14px;
        }

        /* ============================================
           RESPONSIVE
           ============================================ */
        @media (max-width: 1024px) {
          .le-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .le-col-span-1,
          .le-col-span-2,
          .le-col-span-3,
          .le-col-span-4,
          .le-col-span-5,
          .le-col-span-6 {
            grid-column: span 1;
          }
        }

        @media (max-width: 768px) {
          .le-grid {
            grid-template-columns: 1fr 1fr;
          }
          .le-col-span-1,
          .le-col-span-2,
          .le-col-span-3,
          .le-col-span-4,
          .le-col-span-5,
          .le-col-span-6 {
            grid-column: span 1;
          }

          .le-controls {
            flex-direction: column;
            align-items: flex-start;
          }

          .le-controls-right {
            width: 100%;
            justify-content: flex-start;
          }

          .le-widget-actions {
            opacity: 1;
          }
        }

        @media (max-width: 480px) {
          .le-grid {
            grid-template-columns: 1fr;
          }

          .le-widget-header {
            flex-wrap: wrap;
            gap: 4px;
          }

          .le-widget-actions {
            margin-left: auto;
          }

          .le-controls-right {
            flex-wrap: wrap;
          }

          .le-control-btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default LayoutEditor;