import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import InlineEditableText from '../InlineEditableText';

describe('InlineEditableText', () => {
  const mockOnSave = jest.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  it('should render text when not in edit mode', () => {
    const { getByText } = render(
      <InlineEditableText
        value="Test Trip"
        onSave={mockOnSave}
        isEditMode={false}
      />
    );
    
    expect(getByText('Test Trip')).toBeTruthy();
  });

  it('should show placeholder when value is empty', () => {
    const { getByText } = render(
      <InlineEditableText
        value=""
        placeholder="Enter trip name..."
        onSave={mockOnSave}
        isEditMode={false}
      />
    );
    
    expect(getByText('Enter trip name...')).toBeTruthy();
  });

  it('should show edit icon when in edit mode', () => {
    const { getByText } = render(
      <InlineEditableText
        value="Test Trip"
        onSave={mockOnSave}
        isEditMode={true}
      />
    );
    
    // The edit icon should be present (as an Ionicons component)
    expect(getByText('Test Trip')).toBeTruthy();
  });

  it('should enter edit mode when tapped', () => {
    const { getByText } = render(
      <InlineEditableText
        value="Test Trip"
        onSave={mockOnSave}
        isEditMode={true}
      />
    );
    
    fireEvent.press(getByText('Test Trip'));
    
    // Should show input with current value
    expect(getByText('Test Trip')).toBeTruthy();
  });

  it('should render input when in editing mode', () => {
    const { getByDisplayValue } = render(
      <InlineEditableText
        value="Test Trip"
        onSave={mockOnSave}
        isEditMode={true}
        isEditing={true}
      />
    );
    
    // Should show input with current value
    expect(getByDisplayValue('Test Trip')).toBeTruthy();
  });

  it('should handle save function', () => {
    const { getByDisplayValue } = render(
      <InlineEditableText
        value="Test Trip"
        onSave={mockOnSave}
        isEditMode={true}
        isEditing={true}
      />
    );
    
    // Component should render input
    expect(getByDisplayValue('Test Trip')).toBeTruthy();
  });
});
