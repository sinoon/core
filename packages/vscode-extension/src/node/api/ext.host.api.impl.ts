import { IRPCProtocol } from '@ali/ide-connection';
import { IExtensionProcessService, ExtHostAPIIdentifier } from '../../common';
import { createWindowApiFactory } from './ext.host.window.api.impl';
import { createDocumentModelApiFactory } from './ext.host.doc';
import { ExtensionDocumentDataManagerImpl } from '../doc';
import * as types from '../../common/ext-types';
import { ViewColumn } from '../../common/enums';
import { ExtHostCommands, createCommandsApiFactory } from './ext.host.command';
import { ExtHostWorkspace, createWorkspaceApiFactory } from './ext.host.workspace';
import { ExtensionHostEditorService } from '../editor/editor.host';
import {
  Hover,
  Uri,
  IndentAction,
  CodeLens,
  Disposable,
  CompletionItem,
  SnippetString,
  MarkdownString,
  CompletionItemKind,
  Location,
  Position,
  ColorPresentation,
  Range,
  Color,
  FoldingRangeKind,
  FoldingRange,
  DocumentHighlightKind,
  DocumentHighlight,
  DocumentLink,
  StatusBarAlignment,
  ProgressLocation,
  CodeActionKind,
} from '../../common/ext-types';
import { CancellationTokenSource, Emitter } from '@ali/ide-core-common';
import { ExtHostPreference } from './ext.host.preference';
import { createExtensionsApiFactory } from './ext.host.extensions';
import { createLanguagesApiFactory, ExtHostLanguages } from './ext.host.language';

export function createApiFactory(
  rpcProtocol: IRPCProtocol,
  extensionService: IExtensionProcessService,
) {
  const extHostDocs = rpcProtocol.set(ExtHostAPIIdentifier.ExtHostDocuments, new ExtensionDocumentDataManagerImpl(rpcProtocol));
  rpcProtocol.set(ExtHostAPIIdentifier.ExtHostExtensionService, extensionService);

  createDocumentModelApiFactory(rpcProtocol);
  const extHostCommands = rpcProtocol.set(ExtHostAPIIdentifier.ExtHostCommands, new ExtHostCommands(rpcProtocol));
  const extHostWorkspace = rpcProtocol.set(ExtHostAPIIdentifier.ExtHostWorkspace, new ExtHostWorkspace(rpcProtocol)) as ExtHostWorkspace;
  const extHostEditors = rpcProtocol.set(ExtHostAPIIdentifier.ExtHostEditors, new ExtensionHostEditorService(rpcProtocol, extHostDocs)) as ExtensionHostEditorService;
  const extHostPreference = rpcProtocol.set(ExtHostAPIIdentifier.ExtHostPreference, new ExtHostPreference(rpcProtocol, extHostWorkspace)) as ExtHostPreference;
  const extHostLanguages = rpcProtocol.set(ExtHostAPIIdentifier.ExtHostLanguages, new ExtHostLanguages(rpcProtocol, extHostDocs));

  return (extension) => {
    return {
      commands: createCommandsApiFactory(extHostCommands),
      window: createWindowApiFactory(rpcProtocol, extHostEditors),
      languages: createLanguagesApiFactory(extHostLanguages),
      workspace: createWorkspaceApiFactory(extHostWorkspace, extHostPreference, extHostDocs),
      env: {},
      // version: require('../../../package-lock.json').version,
      comment: {},
      languageServer: {},
      extensions: createExtensionsApiFactory(rpcProtocol, extensionService),
      debug: {},
      tasks: {},
      scm: {},
      // 类型定义
      ...types,
      Hover,
      CompletionItem,
      CompletionItemKind,
      SnippetString,
      MarkdownString,
      Location,
      Position,
      Uri,
      CancellationTokenSource,
      IndentAction,
      CodeLens,
      Disposable,
      EventEmitter: Emitter,
      ColorPresentation,
      Range,
      Color,
      FoldingRange,
      FoldingRangeKind,
      DocumentHighlight,
      DocumentHighlightKind,
      DocumentLink,
      StatusBarAlignment,
      ProgressLocation,
      CodeActionKind,
      ViewColumn,
    };
  };
}
