import React from 'react';
import { render } from '@testing-library/react-native';
import ScreenLayout from '../ScreenLayout';
import { colors } from '../../../theme/colors';

describe('ScreenLayout', () => {
  it('should render with default props', () => {
    const { getByTestId } = render(
      <ScreenLayout testID="screen-layout">
        <div>Test content</div>
      </ScreenLayout>
    );
    
    expect(getByTestId('screen-layout')).toBeTruthy();
  });

  it('should render with custom background color', () => {
    const customColor = '#FF0000';
    const { getByTestId } = render(
      <ScreenLayout 
        testID="screen-layout"
        backgroundColor={customColor}
      >
        <div>Test content</div>
      </ScreenLayout>
    );
    
    const layout = getByTestId('screen-layout');
    expect(layout).toBeTruthy();
  });

  it('should render in edit mode with tint', () => {
    const { getByTestId } = render(
      <ScreenLayout 
        testID="screen-layout"
        isEditMode={true}
        editModeTint={colors.background.tertiary}
      >
        <div>Test content</div>
      </ScreenLayout>
    );
    
    const layout = getByTestId('screen-layout');
    expect(layout).toBeTruthy();
  });

  it('should render with custom padding', () => {
    const { getByTestId } = render(
      <ScreenLayout 
        testID="screen-layout"
        paddingHorizontal={16}
      >
        <div>Test content</div>
      </ScreenLayout>
    );
    
    const layout = getByTestId('screen-layout');
    expect(layout).toBeTruthy();
  });

  it('should render non-scrollable layout', () => {
    const { getByTestId } = render(
      <ScreenLayout 
        testID="screen-layout"
        scrollable={false}
      >
        <div>Test content</div>
      </ScreenLayout>
    );
    
    const layout = getByTestId('screen-layout');
    expect(layout).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <ScreenLayout 
        testID="screen-layout"
        style={customStyle}
      >
        <div>Test content</div>
      </ScreenLayout>
    );
    
    const layout = getByTestId('screen-layout');
    expect(layout).toBeTruthy();
  });
});
