import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const ProfileAvatar = ({ photoURL, size = 80, style, displayName }) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarSize = size;
  const fontSize = Math.max(12, avatarSize * 0.4);

  if (photoURL) {
    return (
      <Image
        source={{ uri: photoURL }}
        style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
          style
        ]}
        defaultSource={require('../../../assets/icon.png')}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarPlaceholder,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        },
        style
      ]}
    >
      <Text
        style={[
          styles.avatarText,
          { fontSize }
        ]}
      >
        {getInitials(displayName)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderWidth: 3,
    borderColor: colors.border.primary,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.border.primary,
  },
  avatarText: {
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
});

export default ProfileAvatar;
