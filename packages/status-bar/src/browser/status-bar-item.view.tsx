import cls from 'classnames';
import React from 'react';
import { IThemeService } from '@opensumi/ide-theme';
import { getExternalIcon } from '@opensumi/ide-core-browser';
import { IThemeColor, isThemeColor } from '@opensumi/ide-core-common';
import { StatusBarEntry } from '@opensumi/ide-core-browser/lib/services';
import { useInjectable } from '@opensumi/ide-core-browser/lib/react-hooks';

import styles from './status-bar.module.less';
import { parseLabel, LabelPart, LabelIcon, replaceLocalizePlaceholder } from '@opensumi/ide-core-browser';

export const StatusBarItem = React.memo((props: StatusBarEntry) => {
  const {
    entryId,
    text,
    onClick,
    tooltip,
    command,
    ariaLabel,
    iconClass,
    className,
    role = 'button',
    color: propsColor,
    backgroundColor: propsBackgroundColor,
  } = props;

  const themeService = useInjectable<IThemeService>(IThemeService);
  const getColor = (color: string | IThemeColor | undefined): string => {
    if (!color) {
      return '';
    }

    if (isThemeColor(color)) {
      return themeService.getColor(color)?.toString() ?? '';
    }

    return color;
  };

  let items: LabelPart[] = [];
  if (text) {
    items = parseLabel(text);
  }
  let hasIcon = false;
  return (
    <div
      id={entryId}
      className={cls(styles.element, className, {
        [styles.hasCommand]: command || onClick,
      })}
      title={tooltip}
      onClick={onClick}
      style={{
        color: getColor(propsColor),
        backgroundColor: getColor(propsBackgroundColor),
      }}
      aria-label={ariaLabel}
    >
      {iconClass && <span key={-1} className={cls(styles.icon, iconClass)}></span>}
      {items.map((item, key) => {
        if (!(typeof item === 'string') && LabelIcon.is(item)) {
          hasIcon = true;
          return (
            <span
              key={key}
              className={cls(
                styles.icon,
                getExternalIcon(item.name),
                `${item.animation ? 'iconfont-anim-' + item.animation : ''}`,
              )}
            ></span>
          );
        } else {
          // 22px高度限制用于解决文本超长时文本折叠问题
          return (
            <span
              style={{ marginLeft: iconClass || hasIcon ? '2px' : 0, height: '22px', lineHeight: '22px' }}
              key={key}
              aria-label={ariaLabel}
              role={role}
            >
              {replaceLocalizePlaceholder(item)}
            </span>
          );
        }
      })}
    </div>
  );
});
