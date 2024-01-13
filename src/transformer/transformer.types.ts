import { ClassBody, ClassDeclaration, ClassMethod, ClassProperty, File } from '@babel/types';

type Return<T> = void | T | Promise<void | T>;

export interface TransformerPluginContext {
  // TODO
  skipped?: boolean;
  script?: string;

  // assets
  assetsDestination?: string;
  assetsSource?: string;

  // class
  class?: ClassDeclaration;
  classEvents?: Array<ClassProperty>;
  classHasMount?: boolean;
  classHasUnmount?: boolean;
  classMembers?: ClassBody['body'];
  classMethods?: Array<ClassMethod>;
  className?: string;
  classProperties?: Array<ClassProperty>;
  classRender?: ClassMethod;
  classStates?: Array<ClassProperty>;

  // directory
  directoryName?: string;
  directoryPath?: string;

  // element
  elementKey?: string;
  elementInterfaceName?: string;
  elementTagName?: string;

  // file
  fileAST?: File;
  fileContent?: string;
  fileExtension?: string;
  fileName?: string;
  filePath?: string;

  // metadata
  metadata?: {
    [key: string]: any;
  };

  // readme
  readmeContent?: string;
  readmeExtension?: string;
  readmeName?: string;
  readmePath?: string;

  // style
  styleContent?: string;
  styleExtension?: string;
  styleName?: string;
  stylePath?: string;
}

export interface TransformerPluginGlobal {
  contexts: Array<TransformerPluginContext>;
}

export interface TransformerPlugin {
  name: string;
  options?: any;
  start?: (global: TransformerPluginGlobal) => Return<TransformerPluginGlobal>;
  run?: (context: TransformerPluginContext, global: TransformerPluginGlobal) => Return<TransformerPluginContext>;
  finish?: (global: TransformerPluginGlobal) => Return<TransformerPluginGlobal>;
}
