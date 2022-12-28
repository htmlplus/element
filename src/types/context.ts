import { ClassBody, ClassDeclaration, ClassMethod, ClassProperty, File } from '@babel/types';

export interface Context {
  // TODO
  customElementNames?: Array<string>;
  isInvalid?: boolean;
  script?: string;

  // assets
  assets?: string;

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

  // component
  componentInterfaceName?: string;
  componentKey?: string;
  componentTag?: string;

  // directory
  directoryName?: string;
  directoryPath?: string;

  // file
  fileAST?: File;
  fileContent?: string;
  fileExtension?: string;
  fileName?: string;
  filePath?: string;

  // readme
  readmeContent?: string;
  readmePath?: string;

  // style
  styleContent?: string;
  styleDependencies?: Array<string>;
  styleParsed?: string;
  stylePath?: string;
}
