import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AddDayButton from '../AddDayButton';

describe('AddDayButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByTestId, getByText } = render(
      <AddDayButton onPress={mockOnPress} />
    );

    expect(getByTestId('add-day-button')).toBeTruthy();
    expect(getByText('Add Day')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(
      <AddDayButton onPress={mockOnPress} />
    );

    fireEvent.press(getByTestId('add-day-button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const { getByTestId } = render(
      <AddDayButton onPress={mockOnPress} disabled={true} />
    );

    const button = getByTestId('add-day-button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('is disabled when loading prop is true', () => {
    const { getByTestId } = render(
      <AddDayButton onPress={mockOnPress} loading={true} />
    );

    const button = getByTestId('add-day-button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('uses custom testID when provided', () => {
    const { getByTestId } = render(
      <AddDayButton onPress={mockOnPress} testID="custom-add-day" />
    );

    expect(getByTestId('custom-add-day')).toBeTruthy();
  });

  it('applies custom style when provided', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <AddDayButton onPress={mockOnPress} style={customStyle} />
    );

    const button = getByTestId('add-day-button');
    const buttonStyle = Array.isArray(button.props.style) 
      ? button.props.style 
      : [button.props.style];
    
    expect(buttonStyle.some(style => 
      style && style.backgroundColor === 'red'
    )).toBe(true);
  });
});
