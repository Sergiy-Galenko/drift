import { Children, type ReactNode } from 'react';
import { Text as ReactNativeText, type TextProps } from 'react-native';

import { useTranslation } from '@/hooks/useTranslation';

type LocalizedTextProps = TextProps & {
  translate?: boolean;
};

function translateChildren(children: ReactNode, translate: (value: string) => string): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child !== 'string') return child;
    const trimmed = child.trim();
    const localized = translate(trimmed);
    return localized === trimmed ? child : child.replace(trimmed, localized);
  });
}

export function LocalizedText({ children, translate: shouldTranslate = false, ...props }: LocalizedTextProps) {
  const { t } = useTranslation();
  return <ReactNativeText {...props}>{shouldTranslate ? translateChildren(children, t) : children}</ReactNativeText>;
}
