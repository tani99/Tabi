import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// Get screen width with fallback for testing
const getScreenWidth = () => {
  try {
    return Dimensions.get('window').width;
  } catch (error) {
    return 375; // Default fallback width
  }
};

const screenWidth = getScreenWidth();

const ContextMenu = ({ 
  trigger, 
  actions = [], 
  position = 'bottom-right',
  onActionPress 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const showMenu = () => {
    if (triggerRef.current) {
      triggerRef.current.measure((x, y, width, height, pageX, pageY) => {
        let menuX, menuY;
        
        switch (position) {
          case 'bottom-right':
            menuX = pageX + width - 220; // Adjust for menu width
            menuY = pageY + height + 8;
            break;
          case 'bottom-left':
            menuX = pageX;
            menuY = pageY + height + 8;
            break;
          case 'top-right':
            menuX = pageX + width - 220;
            menuY = pageY - 8;
            break;
          case 'top-left':
            menuX = pageX;
            menuY = pageY - 8;
            break;
          default:
            menuX = pageX + width - 220;
            menuY = pageY + height + 8;
        }

        // Ensure menu stays within screen bounds
        if (menuX + 220 > screenWidth) {
          menuX = screenWidth - 220 - 16;
        }
        if (menuX < 16) {
          menuX = 16;
        }

        setMenuPosition({ x: menuX, y: menuY });
        setIsVisible(true);
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const hideMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
    });
  };

  const handleActionPress = (action) => {
    hideMenu();
    if (onActionPress) {
      onActionPress(action);
    }
  };

  const renderTrigger = () => {
    if (typeof trigger === 'function') {
      return trigger({ onPress: showMenu, ref: triggerRef });
    }
    
    return (
      <TouchableOpacity
        ref={triggerRef}
        style={styles.triggerButton}
        onPress={showMenu}
        activeOpacity={0.7}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={colors.text.secondary} />
      </TouchableOpacity>
    );
  };

  return (
    <>
      {renderTrigger()}
      
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideMenu}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={hideMenu}
        >
          <Animated.View
            style={[
              styles.menuContainer,
              {
                left: menuPosition.x,
                top: menuPosition.y,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {actions.map((action, index) => {
              if (action.separator) {
                return (
                  <View key={action.id || `separator-${index}`} style={styles.separator} />
                );
              }
              
              return (
                <TouchableOpacity
                  key={action.id || index}
                  style={[
                    styles.menuItem,
                    index === actions.length - 1 && styles.lastMenuItem,
                  ]}
                  onPress={() => handleActionPress(action)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.menuItemText,
                      action.destructive && styles.destructiveText,
                    ]}
                  >
                    {action.title}
                  </Text>
                  <Ionicons
                    name={action.icon}
                    size={18}
                    color={action.destructive ? colors.status.error.main : colors.text.secondary}
                    style={styles.menuItemIcon}
                  />
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    paddingVertical: 12,
    minWidth: 220,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginVertical: 4,
  },
  menuItemIcon: {
    marginLeft: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    flex: 0,
  },
  destructiveText: {
    color: colors.status.error.main,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ContextMenu;
