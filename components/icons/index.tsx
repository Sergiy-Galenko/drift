import type { ComponentType } from 'react';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

import { Colors } from '@/constants/tokens';

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
};

function iconDefaults(props: IconProps) {
  return {
    size: props.size ?? 24,
    color: props.color ?? Colors.textPrimary,
    strokeWidth: props.strokeWidth ?? 1.5,
    filled: props.filled ?? false,
  };
}

export const HomeIcon = (props: IconProps) => {
  const { size, color, strokeWidth, filled } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Path d="M3 10.5 12 3l9 7.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 10v10h12V10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 20v-5h4v5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill={Colors.black} />
    </Svg>
  );
};

export const ExploreIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={strokeWidth} />
      <Path d="m16.5 16.5 4 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M9 7.5 14.5 9 13 14.5 7.5 13 9 7.5Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </Svg>
  );
};

export const CreateIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="16" height="16" rx="4" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M12 8v8M8 12h8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const ReelsIcon = (props: IconProps) => {
  const { size, color, strokeWidth, filled } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Rect x="4" y="5" width="16" height="15" rx="3" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M8 5 11 10M13 5l3 5M4.5 10h15" stroke={filled ? Colors.black : color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Polygon points="11,13 16,15.5 11,18" fill={filled ? Colors.black : color} />
    </Svg>
  );
};

export const ActivityIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 13h3l2-6 4 12 2-6h5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="19" cy="6" r="2" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
};

export const HeartIcon = (props: IconProps) => {
  const { size, color, strokeWidth, filled } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Path
        d="M20.4 5.6c-1.8-1.9-4.7-1.8-6.4.1L12 7.8 10 5.7C8.3 3.8 5.4 3.7 3.6 5.6 1.7 7.6 1.9 10.8 4 13l8 7 8-7c2.1-2.2 2.3-5.4.4-7.4Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const PaperPlaneIcon = (props: IconProps) => {
  const { size, color, strokeWidth, filled } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Path d="M21 3 10.5 21l-2-8.2L3 10.5 21 3Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <Path d="m8.5 12.8 6.6-4.3" stroke={filled ? Colors.black : color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const MoreIcon = (props: IconProps) => {
  const { size, color } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Circle cx="5" cy="12" r="1.5" />
      <Circle cx="12" cy="12" r="1.5" />
      <Circle cx="19" cy="12" r="1.5" />
    </Svg>
  );
};

export const GridIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="5" height="5" stroke={color} strokeWidth={strokeWidth} />
      <Rect x="9.5" y="4" width="5" height="5" stroke={color} strokeWidth={strokeWidth} />
      <Rect x="15" y="4" width="5" height="5" stroke={color} strokeWidth={strokeWidth} />
      <Rect x="4" y="9.5" width="5" height="5" stroke={color} strokeWidth={strokeWidth} />
      <Rect x="9.5" y="9.5" width="5" height="5" stroke={color} strokeWidth={strokeWidth} />
      <Rect x="15" y="9.5" width="5" height="5" stroke={color} strokeWidth={strokeWidth} />
      <Rect x="4" y="15" width="5" height="5" stroke={color} strokeWidth={strokeWidth} />
      <Rect x="9.5" y="15" width="5" height="5" stroke={color} strokeWidth={strokeWidth} />
      <Rect x="15" y="15" width="5" height="5" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
};

export const ProfileIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M4.5 21c1.2-4 3.7-6 7.5-6s6.3 2 7.5 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const BackIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5 8 12l7 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const CheckIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m5 12 4.5 4.5L19 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const XIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 7l10 10M17 7 7 17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const BookmarkIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 4h10v16l-5-3-5 3V4Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </Svg>
  );
};

export const CommentIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 5h14v10H9l-4 4V5Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <Path d="M8 9h8M8 12h5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const ShareIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const UploadIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 16V4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="m7 9 5-5 5 5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 18v2h14v-2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const SearchIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth={strokeWidth} />
      <Path d="m15.5 15.5 4 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const SettingsIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M19.8 7.5 17.2 9M6.8 15l-2.6 1.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const UsersIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="8" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M3.5 19c.8-3 2.6-4.5 5.5-4.5s4.7 1.5 5.5 4.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M15 6.3a3 3 0 0 1 0 5.4M16 14.5c2.4.3 3.9 1.8 4.5 4.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const BellIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 10a6 6 0 0 1 12 0v4l2 3H4l2-3v-4Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <Path d="M10 20a2 2 0 0 0 4 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const PhoneProofIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Rect x="24" y="8" width="32" height="58" rx="8" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M40 45V27M33 34l7-7 7 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="40" cy="57" r="2" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M58 18h6M61 15v6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export const ChatVoteIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Path d="M10 18h27v18H19l-9 8V18Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <Path d="M43 34h27v18h-9l-9 8v-8h-9V34Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <Path d="m31 50 7 7 13-17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const HourglassIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Path d="M24 10h32M24 70h32M28 10v15c0 8 12 10 12 15S28 47 28 55v15M52 10v15c0 8-12 10-12 15s12 7 12 15v15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="40" cy="30" r="1.5" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="36" cy="38" r="1.5" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="44" cy="47" r="1.5" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
};

export const GoogleMarkIcon = (props: IconProps) => {
  const { size, color, strokeWidth } = iconDefaults(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M12 12h7c-.3 4-3 7-7 7a7 7 0 1 1 4.8-12.1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export type AppIcon = ComponentType<IconProps>;
