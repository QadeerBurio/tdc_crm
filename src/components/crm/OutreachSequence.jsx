// components/crm/OutreachSequence.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Send, Plus, Trash2, Clock, Users, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card, { CardContent, CardHeader, CardTitle } from '../common/Card';

const OutreachSequence = ({ sequence, onSave, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(sequence || {
    name: '',
    description: '',
    type: 'cold_email',
    steps: [],
  });

  const addStep = () => {
    const newStep = {
      id: Date.now(),
      order: formData.steps.length + 1,
      channel: 'email',
      subject: '',
      template: '',
      delay: 24,
      conditions: {},
    };
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (stepId, field, value) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, [field]: value } : step
      )
    }));
  };

  const removeStep = (stepId) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const moveStep = (stepId, direction) => {
    const index = formData.steps.findIndex(s => s.id === stepId);
    if (index === -1) return;
    
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= formData.steps.length) return;
    
    const newSteps = [...formData.steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setFormData(prev => ({
      ...prev,
      steps: newSteps.map((step, i) => ({ ...step, order: i + 1 }))
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Sequence Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            style={styles.input}
            required
            placeholder="Enter sequence name"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            style={styles.select}
          >
            <option value="cold_email">Cold Email</option>
            <option value="linkedin">LinkedIn</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          style={styles.textarea}
          placeholder="Describe this sequence..."
        />
      </div>

      <div>
        <div style={styles.stepsHeader}>
          <h3 style={styles.stepsTitle}>Steps</h3>
          <button type="button" style={styles.addStepButton} onClick={addStep}>
            <Plus style={styles.buttonIcon} />
            Add Step
          </button>
        </div>

        <div style={styles.stepsContainer}>
          {formData.steps.map((step, index) => (
            <div key={step.id} style={styles.stepCard}>
              <div style={styles.stepContent}>
                <div style={styles.stepHeader}>
                  <div style={styles.stepInfo}>
                    <span style={styles.stepNumber}>{step.order}</span>
                    <div>
                      <span style={styles.stepLabel}>Step {step.order}</span>
                      <span style={styles.stepChannel}>{step.channel}</span>
                    </div>
                  </div>
                  <div style={styles.stepActions}>
                    <button
                      type="button"
                      onClick={() => moveStep(step.id, -1)}
                      style={{
                        ...styles.stepActionButton,
                        ...(index === 0 ? styles.stepActionDisabled : {})
                      }}
                      disabled={index === 0}
                    >
                      <ArrowUp style={styles.stepActionIcon} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(step.id, 1)}
                      style={{
                        ...styles.stepActionButton,
                        ...(index === formData.steps.length - 1 ? styles.stepActionDisabled : {})
                      }}
                      disabled={index === formData.steps.length - 1}
                    >
                      <ArrowDown style={styles.stepActionIcon} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      style={styles.stepDeleteButton}
                    >
                      <Trash2 style={styles.stepDeleteIcon} />
                    </button>
                  </div>
                </div>

                <div style={styles.stepFields}>
                  <div style={styles.stepField}>
                    <label style={styles.stepFieldLabel}>Channel</label>
                    <select
                      value={step.channel}
                      onChange={(e) => updateStep(step.id, 'channel', e.target.value)}
                      style={styles.stepSelect}
                    >
                      <option value="email">Email</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="call">Call</option>
                      <option value="sms">SMS</option>
                    </select>
                  </div>
                  <div style={styles.stepField}>
                    <label style={styles.stepFieldLabel}>Subject</label>
                    <input
                      type="text"
                      value={step.subject}
                      onChange={(e) => updateStep(step.id, 'subject', e.target.value)}
                      style={styles.stepInput}
                      placeholder="Email subject"
                    />
                  </div>
                  <div style={styles.stepField}>
                    <label style={styles.stepFieldLabel}>Delay (hours)</label>
                    <input
                      type="number"
                      value={step.delay}
                      onChange={(e) => updateStep(step.id, 'delay', parseInt(e.target.value) || 0)}
                      style={styles.stepInput}
                      min="0"
                    />
                  </div>
                </div>

                <div style={styles.stepTemplate}>
                  <label style={styles.stepFieldLabel}>Template</label>
                  <textarea
                    value={step.template}
                    onChange={(e) => updateStep(step.id, 'template', e.target.value)}
                    rows={3}
                    style={styles.stepTextarea}
                    placeholder="Enter email template content..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {formData.steps.length === 0 && (
          <div style={styles.emptyState}>
            <Mail style={styles.emptyIcon} />
            <p style={styles.emptyText}>No steps added yet</p>
            <button type="button" style={styles.emptyButton} onClick={addStep}>
              <Plus style={styles.buttonIcon} />
              Add First Step
            </button>
          </div>
        )}
      </div>

      <div style={styles.actions}>
        <button type="button" style={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" style={styles.submitButton}>
          <Send style={styles.buttonIcon} />
          Save Sequence
        </button>
      </div>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    width: '100%',
    boxSizing: 'border-box',
  },
  textarea: {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    width: '100%',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  stepsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  stepsTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#111827',
    margin: 0,
  },
  addStepButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonIcon: {
    width: '16px',
    height: '16px',
  },
  stepsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    overflow: 'hidden',
  },
  stepContent: {
    padding: '16px',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  stepInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  stepNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#DBEAFE',
    color: '#2563EB',
    fontSize: '14px',
    fontWeight: '600',
  },
  stepLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
  },
  stepChannel: {
    marginLeft: '8px',
    fontSize: '13px',
    color: '#6B7280',
  },
  stepActions: {
    display: 'flex',
    gap: '4px',
  },
  stepActionButton: {
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActionDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  stepActionIcon: {
    width: '16px',
    height: '16px',
    color: '#6B7280',
  },
  stepDeleteButton: {
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDeleteIcon: {
    width: '16px',
    height: '16px',
    color: '#EF4444',
  },
  stepFields: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '12px',
    marginBottom: '12px',
  },
  stepField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  stepFieldLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6B7280',
  },
  stepSelect: {
    padding: '4px 8px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    width: '100%',
  },
  stepInput: {
    padding: '4px 8px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    width: '100%',
    boxSizing: 'border-box',
  },
  stepTemplate: {
    marginTop: '4px',
  },
  stepTextarea: {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    width: '100%',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
    minHeight: '60px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    color: '#D1D5DB',
    margin: '0 auto 8px',
  },
  emptyText: {
    color: '#6B7280',
    marginBottom: '8px',
  },
  emptyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};

// Add hover styles and media queries
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .add-step-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .step-action-button:hover:not(:disabled) {
    background-color: #F3F4F6 !important;
  }
  
  .step-delete-button:hover:not(:disabled) {
    background-color: #FEE2E2 !important;
  }
  
  .cancel-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .submit-button:hover:not(:disabled) {
    background-color: #2563EB !important;
  }
  
  .empty-button:hover:not(:disabled) {
    background-color: #F9FAFB !important;
  }
  
  .input:focus,
  .select:focus,
  .textarea:focus,
  .step-select:focus,
  .step-input:focus,
  .step-textarea:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  .cancel-button:disabled,
  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr !important;
    }
    
    .step-fields {
      grid-template-columns: 1fr !important;
    }
    
    .step-header {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }
    
    .step-actions {
      align-self: flex-start !important;
    }
    
    .actions {
      flex-direction: column !important;
    }
    
    .cancel-button,
    .submit-button {
      width: 100% !important;
      justify-content: center !important;
    }
  }
  
  @media (max-width: 480px) {
    .step-content {
      padding: 12px !important;
    }
    
    .step-info {
      flex-wrap: wrap !important;
    }
    
    .step-channel {
      margin-left: 0 !important;
      display: block !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default OutreachSequence;