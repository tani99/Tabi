import React from 'react';
import { render } from '@testing-library/react-native';
import ContextMenu from '../ContextMenu';

// Mock the Ionicons component
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('ContextMenu', () => {
  const mockActions = [
    {
      id: 'delete',
      title: 'Delete Trip',
      icon: 'trash-outline',
      destructive: true,
    }
  ];

  const mockOnActionPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { root } = render(
      <ContextMenu
        actions={mockActions}
        onActionPress={mockOnActionPress}
      />
    );

    expect(root).toBeTruthy();
  });

  it('renders with custom trigger', () => {
    const customTrigger = ({ onPress, ref }) => (
      <div testID="custom-trigger" onClick={onPress} ref={ref}>
        Custom Trigger
      </div>
    );

    const { getByTestId } = render(
      <ContextMenu
        trigger={customTrigger}
        actions={mockActions}
        onActionPress={mockOnActionPress}
      />
    );

    expect(getByTestId('custom-trigger')).toBeTruthy();
  });
});
