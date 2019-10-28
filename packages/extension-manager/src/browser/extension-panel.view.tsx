import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { AccordionWidget } from '@ali/ide-core-browser/lib/layout';
import Tabs from 'antd/lib/tabs';
import 'antd/lib/tabs/style/index.less';
import { useInjectable, localize, CommandRegistry } from '@ali/ide-core-browser';
import { Widget } from '@phosphor/widgets';
import { enableExtensionsContainerId, enableExtensionsTarbarHandlerId, disableExtensionsTarbarHandlerId, searchExtensionsFromMarketplaceTarbarHandlerId, searchExtensionsFromInstalledTarbarHandlerId, IExtensionManagerService, hotExtensionsFromMarketplaceTarbarHandlerId, TabActiveKey, SearchFromMarketplaceCommandId } from '../common';
import { ExtensionHotAccordion, ExtensionEnableAccordion, ExtensionDisableAccordion, ExtensionSearchInstalledAccordion, ExtensionSearchMarketplaceAccordion } from './extension-panel-accordion.view';
import { ExtensionSearch } from './components/extension-search';
import * as styles from './extension-panel.module.less';

const { TabPane } = Tabs;

export default observer(() => {
  const extensionManagerService = useInjectable<IExtensionManagerService>(IExtensionManagerService);
  const [ marketElement, setMarketElement ] = React.useState<HTMLElement | null>(null);
  const [ installedElement, setInstalledElement ] = React.useState<HTMLElement | null>(null);
  const [ marketAccordion, setMarketAccordion ] = React.useState<AccordionWidget>();
  const [ installedAccordion, setInstalledAccordion ] = React.useState<AccordionWidget>();
  const commandRegistry = useInjectable<CommandRegistry>(CommandRegistry);
  const marketAccordionInstance = useInjectable<AccordionWidget>(AccordionWidget, [enableExtensionsContainerId, [{
    component: ExtensionHotAccordion,
    id: hotExtensionsFromMarketplaceTarbarHandlerId,
    name: localize('marketplace.panel.hot', '热门插件'),
    forceHidden: false,
  }, {
    component: ExtensionSearchMarketplaceAccordion,
    id: searchExtensionsFromMarketplaceTarbarHandlerId,
    name: localize('marketplace.panel.search', '搜索'),
    forceHidden: true,
  }], 'left']);

  const installedAccordionInstance = useInjectable<AccordionWidget>(AccordionWidget, ['enableExtensionsContainerId', [{
    component: ExtensionEnableAccordion,
    id: enableExtensionsTarbarHandlerId,
    name: localize('marketplace.panel.enable', '已启用'),
    forceHidden: false,
  }, {
    component: ExtensionDisableAccordion,
    id: disableExtensionsTarbarHandlerId,
    name: localize('marketplace.panel.disabled', '已禁用'),
    forceHidden: false,
  }, {
    component: ExtensionSearchInstalledAccordion,
    id: searchExtensionsFromInstalledTarbarHandlerId,
    name: localize('marketplace.panel.search', '搜索'),
    forceHidden: true,
  }], 'left']);
  React.useEffect(() => {
    // 设置 accordion 只设置一次
    setMarketAccordion(marketAccordionInstance);
    setInstalledAccordion(installedAccordionInstance);
  }, []);

  const hotExtensionSection = React.useMemo(() => {
    return marketAccordion && marketAccordion.sections.get(hotExtensionsFromMarketplaceTarbarHandlerId);
  }, [marketAccordion]);

  const searchFromMarketplaceSection = React.useMemo(() => {
    return marketAccordion && marketAccordion.sections.get(searchExtensionsFromMarketplaceTarbarHandlerId);
  }, [marketAccordion]);

  const enableExtensionSection = React.useMemo(() => {
    return installedAccordion && installedAccordion.sections.get(enableExtensionsTarbarHandlerId);
  }, [installedAccordion]);

  const disableExtensionSection = React.useMemo(() => {
    return installedAccordion && installedAccordion.sections.get(disableExtensionsTarbarHandlerId);
  }, [installedAccordion]);

  const searchFromInstalledSection = React.useMemo(() => {
    return installedAccordion && installedAccordion.sections.get(searchExtensionsFromInstalledTarbarHandlerId);
  }, [installedAccordion]);

  const showEnableAndDisable = React.useCallback(() => {
    if (enableExtensionSection) {
      enableExtensionSection!.setHidden(false);
    }
    if (disableExtensionSection) {
      disableExtensionSection.setHidden(false);
    }
    if (searchFromInstalledSection) {
      searchFromInstalledSection.setHidden(true);
    }
  }, [enableExtensionSection, disableExtensionSection, searchFromInstalledSection]);

  const showHotSection = React.useCallback(() => {
    if (hotExtensionSection) {
      hotExtensionSection.setHidden(false);
    }
    if (searchFromMarketplaceSection) {
      searchFromMarketplaceSection.setHidden(true);
    }
    if (marketAccordion) {
      marketAccordion.updateTitleVisibility();
    }
  }, [marketAccordion, hotExtensionSection, searchFromMarketplaceSection]);

  const hideHotSearch = React.useCallback(() => {
    if (hotExtensionSection) {
      hotExtensionSection.setHidden(true);
    }

    if (searchFromMarketplaceSection) {
      searchFromMarketplaceSection.setHidden(false);
    }

    if (marketAccordion) {
      marketAccordion.updateTitleVisibility();
    }
  }, [marketAccordion, hotExtensionSection, searchFromMarketplaceSection]);

  React.useEffect(() => {
    if (marketAccordion && marketElement) {
      Widget.attach(marketAccordion, marketElement);
    }
  }, [marketAccordion, marketElement]);

  React.useEffect(() => {
    if (installedAccordion && installedElement) {
      Widget.attach(installedAccordion, installedElement);
    }
  }, [installedAccordion, installedElement]);

  React.useEffect(() => {
    // 默认要调用一次，不使用layout状态
    showEnableAndDisable();
    showHotSection();
  }, [showEnableAndDisable, showHotSection]);

  const handleChangeFromMarket = React.useCallback((value: string) => {
    extensionManagerService.marketplaceQuery = value;
    if (value) {
      hideHotSearch();
      extensionManagerService.searchFromMarketplace(value);
    } else {
      showHotSection();
    }
  }, [hideHotSearch, showHotSection]);

  React.useEffect(() => {
    commandRegistry.registerCommand({
      id: SearchFromMarketplaceCommandId,
    }, {
      execute: () => {
        extensionManagerService.tabActiveKey = TabActiveKey.MARKETPLACE;
        handleChangeFromMarket(extensionManagerService.installedQuery);
      },
    });
    return () => {
      commandRegistry.unregisterCommand(SearchFromMarketplaceCommandId);
    };
  }, [hideHotSearch]);

  function handleChangeFromInstalled(value: string) {
    extensionManagerService.installedQuery = value;
    if (value) {
      enableExtensionSection!.setHidden(true);
      disableExtensionSection!.setHidden(true);
      searchFromInstalledSection!.setHidden(false);
      extensionManagerService.searchFromInstalled(value);
    } else {
      showEnableAndDisable();
    }
    // 如果只有一个则隐藏 titlebar
    if (installedAccordion) {
      installedAccordion.updateTitleVisibility();
    }
  }

  return (
    <div className={styles.panel}>
      <Tabs
        activeKey={extensionManagerService.tabActiveKey}
        onChange={(activeKey: TabActiveKey) => extensionManagerService.tabActiveKey = activeKey}
        tabBarStyle={{margin: 0, border: 'none'}}
        tabBarGutter={0}
        >
        <TabPane tab={localize('marketplace.panel.tab.marketplace', '扩展市场')} key={TabActiveKey.MARKETPLACE}>
          <ExtensionSearch
            query={extensionManagerService.marketplaceQuery}
            onChange={handleChangeFromMarket}
            placeholder={localize('marketplace.panel.tab.placeholder.search', '搜索市场中的扩展')}
            />
          <div className={styles.content} ref={setMarketElement}></div>
        </TabPane>
        <TabPane tab={localize('marketplace.tab.installed', '已安装的扩展')} key={TabActiveKey.INSTALLED}>
          <ExtensionSearch
            query={extensionManagerService.installedQuery}
            onChange={handleChangeFromInstalled}
            placeholder={localize('marketplace.panel.tab.placeholder.installed', '搜索已安装的扩展')}
            />
          <div className={styles.content} ref={setInstalledElement}></div>
        </TabPane>
      </Tabs>
    </div>
  );
});
