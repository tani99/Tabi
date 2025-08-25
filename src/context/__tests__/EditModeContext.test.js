import React from 'react';
import { render, act } from '@testing-library/react-native';
import { EditModeProvider, useEditMode } from '../EditModeContext';

// Test component to access the context
const TestComponent = () => {
  const editMode = useEditMode();
  return (
    <div>
      <div testID="isEditMode">{editMode.isEditMode.toString()}</div>
      <div testID="hasUnsavedChanges">{editMode.hasUnsavedChanges.toString()}</div>
      <div testID="isSaving">{editMode.isSaving.toString()}</div>
      <div testID="saveError">{editMode.saveError || ''}</div>
      <button testID="toggleEditMode" onPress={editMode.toggleEditMode} />
      <button testID="enterEditMode" onPress={editMode.enterEditMode} />
      <button testID="exitEditMode" onPress={editMode.exitEditMode} />
      <button testID="markUnsavedChanges" onPress={editMode.markUnsavedChanges} />
      <button testID="clearUnsavedChanges" onPress={editMode.clearUnsavedChanges} />
      <button 
        testID="setSavingState" 
        onPress={() => editMode.setSavingState(true, 'Test error')} 
      />
    </div>
  );
};

const renderWithProvider = (component) => {
  return render(
    <EditModeProvider>
      {component}
    </EditModeProvider>
  );
};

describe('EditModeContext', () => {
  it('should provide initial state', () => {
    const { getByTestId } = renderWithProvider(<TestComponent />);
    
    expect(getByTestId('isEditMode').props.children).toBe('false');
    expect(getByTestId('hasUnsavedChanges').props.children).toBe('false');
    expect(getByTestId('isSaving').props.children).toBe('false');
    expect(getByTestId('saveError').props.children).toBe('');
  });

  it('should toggle edit mode', () => {
    const { getByTestId } = renderWithProvider(<TestComponent />);
    
    // Initially not in edit mode
    expect(getByTestId('isEditMode').props.children).toBe('false');
    
    // Toggle to enter edit mode
    act(() => {
      getByTestId('toggleEditMode').props.onPress();
    });
    
    expect(getByTestId('isEditMode').props.children).toBe('true');
    
    // Toggle to exit edit mode
    act(() => {
      getByTestId('toggleEditMode').props.onPress();
    });
    
    expect(getByTestId('isEditMode').props.children).toBe('false');
  });

  it('should enter edit mode', () => {
    const { getByTestId } = renderWithProvider(<TestComponent />);
    
    act(() => {
      getByTestId('enterEditMode').props.onPress();
    });
    
    expect(getByTestId('isEditMode').props.children).toBe('true');
    expect(getByTestId('hasUnsavedChanges').props.children).toBe('false');
    expect(getByTestId('saveError').props.children).toBe('');
  });

  it('should exit edit mode', () => {
    const { getByTestId } = renderWithProvider(<TestComponent />);
    
    // First enter edit mode
    act(() => {
      getByTestId('enterEditMode').props.onPress();
    });
    
    // Then exit edit mode
    act(() => {
      getByTestId('exitEditMode').props.onPress();
    });
    
    expect(getByTestId('isEditMode').props.children).toBe('false');
    expect(getByTestId('hasUnsavedChanges').props.children).toBe('false');
    expect(getByTestId('saveError').props.children).toBe('');
  });

  it('should mark unsaved changes', () => {
    const { getByTestId } = renderWithProvider(<TestComponent />);
    
    act(() => {
      getByTestId('markUnsavedChanges').props.onPress();
    });
    
    expect(getByTestId('hasUnsavedChanges').props.children).toBe('true');
  });

  it('should clear unsaved changes', () => {
    const { getByTestId } = renderWithProvider(<TestComponent />);
    
    // First mark unsaved changes
    act(() => {
      getByTestId('markUnsavedChanges').props.onPress();
    });
    
    // Then clear them
    act(() => {
      getByTestId('clearUnsavedChanges').props.onPress();
    });
    
    expect(getByTestId('hasUnsavedChanges').props.children).toBe('false');
  });

  it('should set saving state', () => {
    const { getByTestId } = renderWithProvider(<TestComponent />);
    
    act(() => {
      getByTestId('setSavingState').props.onPress();
    });
    
    expect(getByTestId('isSaving').props.children).toBe('true');
    expect(getByTestId('saveError').props.children).toBe('Test error');
  });

  it('should clear unsaved changes when exiting edit mode', () => {
    const { getByTestId } = renderWithProvider(<TestComponent />);
    
    // Enter edit mode and mark unsaved changes
    act(() => {
      getByTestId('enterEditMode').props.onPress();
      getByTestId('markUnsavedChanges').props.onPress();
    });
    
    expect(getByTestId('isEditMode').props.children).toBe('true');
    expect(getByTestId('hasUnsavedChanges').props.children).toBe('true');
    
    // Exit edit mode
    act(() => {
      getByTestId('exitEditMode').props.onPress();
    });
    
    expect(getByTestId('isEditMode').props.children).toBe('false');
    expect(getByTestId('hasUnsavedChanges').props.children).toBe('false');
  });
});
