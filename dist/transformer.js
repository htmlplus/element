import path from "node:path";
import fs from "fs-extra";
import MagicString from "magic-string";
import ts from "typescript";
import { DECORATOR_CSS_VARIABLE, DECORATOR_ELEMENT, DECORATOR_PROPERTY, DECORATOR_METHOD, DECORATOR_EVENT, PACKAGE_NAME, TYPE_ANY, TYPE_BOOLEAN, TYPE_BIGINT, TYPE_NUMBER, TYPE_STRING, TYPE_NULL, TYPE_UNDEFINED, TYPE_ARRAY, TYPE_DATE, TYPE_FUNCTION, TYPE_OBJECT, STYLE_IMPORTED, STATIC_STYLE, STATIC_TAG } from "./constants.js";
import { capitalCase, kebabCase, pascalCase } from "change-case";
import { glob } from "glob";
const ASSETS_OPTIONS = {
  destination(context) {
    return path.join("dist", "assets", context.fileName);
  },
  json(context) {
    return path.join("dist", "assets", `${context.fileName}.json`);
  },
  source(context) {
    return path.join(context.directoryPath, "assets");
  }
};
const assets = (contexts, userOptions) => {
  const options = { ...ASSETS_OPTIONS, ...userOptions };
  for (const context of contexts) {
    for (const element of context.elements) {
      element.assetsDestination = options.destination(context, element);
      element.assetsSource = options.source(context, element);
      if (!element.assetsSource) continue;
      if (!fs.existsSync(element.assetsSource)) continue;
      fs.copySync(element.assetsSource, element.assetsDestination);
      const json = options.json(context, element);
      if (!json) continue;
      fs.ensureDirSync(path.dirname(json));
      const files = glob.sync("**/*.*", { cwd: element.assetsDestination });
      fs.writeJSONSync(json, files, { encoding: "utf8", spaces: 2 });
    }
  }
};
const findDecorator = (node, name) => {
  if (!ts.canHaveDecorators(node)) return;
  const decorators = ts.getDecorators(node);
  if (!decorators) return;
  for (const decorator of decorators) {
    const expression = decorator.expression;
    if (!ts.isCallExpression(expression)) continue;
    if (!ts.isIdentifier(expression.expression)) continue;
    if (expression.expression.text === name) return decorator;
  }
};
const getDescription = (node) => {
  return ts.getJSDocCommentsAndTags(node).find(ts.isJSDoc)?.comment?.toString()?.replaceAll("\n\n", " ")?.replaceAll("\n", " ") || "";
};
const getTags = (node, filter, transform) => {
  const filters = [filter].flat().filter(Boolean);
  const excludes = filters.filter((name) => name.startsWith("!")).map((name) => name.slice(1));
  const includes = filters.filter((name) => !name.startsWith("!"));
  return ts.getJSDocTags(node).filter((tag2) => {
    const name = tag2.tagName.text;
    if (excludes.includes(name)) return false;
    if (includes.length) return includes.includes(name);
    return true;
  }).map((tag2) => {
    const result = {
      name: tag2.tagName.text,
      description: (tag2.comment?.toString() ?? "").replace(/\s+/g, " ")
    };
    return transform ? transform(result) : result;
  });
};
const getTypeReference = (type) => {
  if (!type || !ts.isTypeReferenceNode(type)) return;
  const typeName = type.typeName;
  if (!ts.isIdentifier(typeName)) return;
  const sourceFile = type.getSourceFile();
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    for (const specifier of statement.importClause?.namedBindings ? ts.isNamedImports(statement.importClause.namedBindings) ? statement.importClause.namedBindings.elements : [] : []) {
      const localName = specifier.name.text;
      const importedName = specifier.propertyName?.text ?? localName;
      if (localName === typeName.text || importedName === typeName.text) {
        return ts.isStringLiteral(statement.moduleSpecifier) ? statement.moduleSpecifier.text : void 0;
      }
    }
  }
  return;
};
const hasDecorator = (node, name) => {
  return !!findDecorator(node, name);
};
const hasStaticClassProperty = (node, name) => {
  return node.members.some(
    (member) => ts.isPropertyDeclaration(member) && member.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword) && ts.isIdentifier(member.name) && member.name.text === name
  );
};
const hasTag = (node, name) => getTags(node, name).length > 0;
const parseNamedTag = (tag2) => {
  const [name, description] = tag2.description.split(" - ").map((section) => section.trim());
  return { name, description };
};
const toDeprecated = (tags) => {
  const tag2 = tags.find((item) => item.name === "deprecated");
  if (!tag2) return void 0;
  return tag2.description || true;
};
const DOCUMENT_OPTIONS = {
  destination: path.join("dist", "document.json"),
  transform: (json) => json
};
const document = (contexts, userOptions) => {
  const options = { ...DOCUMENT_OPTIONS, ...userOptions };
  const entries = contexts.flatMap((context) => context.elements.map((element) => ({ context, element }))).sort((a, b) => a.element.key > b.element.key ? 1 : -1);
  const elements = entries.map(({ context, element }) => {
    const lastModified = glob.sync("**/*.*", { cwd: context.directoryPath }).map((file) => fs.statSync(path.join(context.directoryPath, file)).mtime).sort((a, b) => a > b ? 1 : -1).pop();
    const events = element.events.map((event) => ({
      name: event.name,
      description: event.description,
      cancelable: event.cancelable,
      detail: event.detail,
      detailReference: getTypeReference(
        event.node.type?.typeArguments?.at(0)
      ),
      tags: event.tags
    }));
    const methods = element.methods.map((method) => ({
      name: method.name,
      description: method.description,
      async: method.async,
      parameters: method.parameters.map((parameter) => ({
        name: parameter.name,
        description: parameter.description,
        required: parameter.required,
        type: parameter.type,
        typeReference: getTypeReference(parameter.node.type)
      })),
      signature: method.signature,
      returns: method.returns,
      tags: method.tags.filter((tag2) => tag2.name !== "param")
    }));
    const properties = element.properties.map((property2) => ({
      attribute: property2.attribute,
      initializer: property2.initializer,
      name: property2.name,
      readonly: property2.readonly,
      reflects: property2.reflects,
      required: property2.required,
      type: property2.type,
      typeReference: getTypeReference(property2.node.type),
      description: property2.description,
      values: getTags(property2.node, "value", parseNamedTag),
      tags: property2.tags.filter((tag2) => tag2.name !== "value")
    }));
    const styles = (() => {
      if (!element.styleContent) return [];
      return element.styleContent.split(DECORATOR_CSS_VARIABLE).slice(1).map((section) => {
        const [first, second] = section.split(/\n/);
        return {
          description: first.replace("*/", "").trim(),
          initializer: second.split(":").slice(1).join(":").replace(";", "").trim(),
          name: second.split(":")[0].trim()
        };
      });
    })();
    return {
      key: element.key,
      title: capitalCase(element.key),
      description: getDescription(element.node),
      lastModified,
      development: hasTag(element.node, "development"),
      thirdParty: hasTag(element.node, "thirdParty"),
      stable: hasTag(element.node, "stable"),
      subset: hasTag(element.node, "subset"),
      dependencies: getTags(element.node, "dependency").at(0)?.description,
      events,
      methods,
      properties,
      styles,
      parts: getTags(element.node, "part", parseNamedTag),
      slots: getTags(element.node, "slot", parseNamedTag),
      tags: getTags(element.node, [
        "!thirdParty",
        "!dependency",
        "!development",
        "!stable",
        "!subset",
        "!part",
        "!slot"
      ])
    };
  });
  const json = { elements };
  const transformed = options.transform(json);
  fs.ensureDirSync(path.dirname(options.destination));
  fs.writeJSONSync(options.destination, transformed, { encoding: "utf8", spaces: 2 });
};
const FALLBACK_OPTIONS = {
  allowJs: true,
  jsx: ts.JsxEmit.Preserve,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  skipLibCheck: true,
  strict: false,
  target: ts.ScriptTarget.ESNext
};
let cache;
const sourceFiles = /* @__PURE__ */ new Map();
const createHost = (options) => {
  const host = ts.createCompilerHost(options, true);
  const defaultGetSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile) => {
    const text = host.readFile(fileName);
    const cached = text !== void 0 ? sourceFiles.get(fileName) : void 0;
    if (cached && cached.text === text) return cached;
    const sourceFile = defaultGetSourceFile(fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile);
    if (sourceFile) sourceFiles.set(fileName, sourceFile);
    return sourceFile;
  };
  return host;
};
const build = (fromPath, oldProgram) => {
  const configPath = ts.findConfigFile(path.dirname(fromPath), ts.sys.fileExists, "tsconfig.json");
  let rootNames = [];
  let options = { ...FALLBACK_OPTIONS };
  if (configPath) {
    const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(config ?? {}, ts.sys, path.dirname(configPath));
    rootNames = parsed.fileNames;
    options = { ...options, ...parsed.options, noEmit: true };
  }
  const program = ts.createProgram({ options, rootNames, oldProgram, host: createHost(options) });
  return { program, checker: program.getTypeChecker() };
};
const getSourceFile = (filePath, content) => {
  if (!cache) cache = build(filePath);
  let fromProgram = cache.program.getSourceFile(filePath);
  if (fromProgram && fromProgram.text !== content) {
    cache = build(filePath, cache.program);
    fromProgram = cache.program.getSourceFile(filePath);
  }
  if (fromProgram) return fromProgram;
  return ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
};
const getTypeChecker = (node) => {
  const sourceFile = node.getSourceFile();
  if (!cache || cache.program.getSourceFile(sourceFile.fileName) !== sourceFile) {
    throw new Error("TODO");
  }
  return cache.checker;
};
const readOptions = (decorator) => {
  const argument = ts.isCallExpression(decorator.expression) ? decorator.expression.arguments[0] : void 0;
  if (!argument || !ts.isObjectLiteralExpression(argument)) return {};
  return Object.fromEntries(
    argument.properties.filter(ts.isPropertyAssignment).map((property2) => [
      property2.name.getText(),
      (() => {
        try {
          return JSON.parse(property2.initializer.getText());
        } catch {
          return property2.initializer.getText();
        }
      })()
    ])
  );
};
const extractEvent = (node) => {
  if (!ts.isPropertyDeclaration(node)) return;
  const decorator = findDecorator(node, DECORATOR_EVENT);
  if (!decorator) return;
  const options = readOptions(decorator);
  return {
    get node() {
      return node;
    },
    get decorator() {
      return decorator;
    },
    get name() {
      return node.name?.getText() || "";
    },
    get description() {
      return getDescription(node);
    },
    get cancelable() {
      return options.cancelable ?? false;
    },
    get detail() {
      return node.type?.getText() || "";
    },
    get tags() {
      return getTags(node);
    }
  };
};
const extractMethod = (node) => {
  if (!ts.isMethodDeclaration(node)) return;
  const decorator = findDecorator(node, DECORATOR_METHOD);
  if (!decorator) return;
  const parameters = node.parameters.map((parameter) => {
    const name = parameter.name.getText();
    return {
      node: parameter,
      name,
      description: ts.getJSDocParameterTags(parameter).find((tag2) => tag2.name.getText() === name)?.comment?.toString().replace(/\s+/g, " "),
      required: !parameter.questionToken,
      type: parameter.type?.getText()
    };
  });
  const returns = node.type?.getText() || "void";
  return {
    get node() {
      return node;
    },
    get decorator() {
      return decorator;
    },
    get name() {
      return node.name?.getText() || "";
    },
    get description() {
      return getDescription(node);
    },
    get async() {
      const checker = getTypeChecker(node);
      const signature = checker.getSignatureFromDeclaration(node);
      return !!(signature && checker.getReturnTypeOfSignature(signature).getSymbol()?.getName() === "Promise");
    },
    get parameters() {
      return parameters;
    },
    get returns() {
      return returns;
    },
    get signature() {
      const list = parameters.map((parameter) => `${parameter.name}${parameter.required ? "" : "?"}: ${parameter.type}`).join(", ");
      return `${node.name?.getText()}(${list}) => ${returns}`;
    },
    get tags() {
      return getTags(node);
    }
  };
};
const extractProperty = (node) => {
  if (!ts.isPropertyDeclaration(node) && !ts.isGetAccessorDeclaration(node)) return;
  const decorator = findDecorator(node, DECORATOR_PROPERTY);
  if (!decorator) return;
  const options = readOptions(decorator);
  const initializer = ts.isPropertyDeclaration(node) && node.initializer ? node.initializer.getText() : void 0;
  return {
    get node() {
      return node;
    },
    get decorator() {
      return decorator;
    },
    get name() {
      return node.name?.getText();
    },
    get description() {
      return getDescription(node);
    },
    get attribute() {
      return options.attribute || kebabCase(node.name?.getText() ?? "");
    },
    get initializer() {
      return initializer;
    },
    get readonly() {
      return ts.isGetAccessorDeclaration(node);
    },
    get reflects() {
      return options.reflect ?? false;
    },
    get required() {
      return ts.isPropertyDeclaration(node) && !node.questionToken && initializer === void 0;
    },
    get type() {
      return node.type?.getText() || "";
    },
    get tags() {
      return getTags(node);
    }
  };
};
const collect = (classes, extractor) => {
  const result = [];
  for (const classNode of classes) {
    for (const member of classNode.members) {
      const extracted = extractor(member);
      if (extracted === void 0) continue;
      result.push(extracted);
    }
  }
  return result;
};
const extract = (context) => {
  const classes = [];
  const visit = (node) => {
    if (ts.isClassDeclaration(node)) {
      classes.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(context.parsed);
  context.classes = classes.map((node) => ({ node }));
  context.elements = classes.filter((node) => hasDecorator(node, DECORATOR_ELEMENT)).map((node) => ({
    node,
    key: kebabCase(node.name?.text ?? ""),
    name: node.name?.text ?? "",
    events: collect([node], extractEvent),
    methods: collect([node], extractMethod),
    properties: collect([node], extractProperty)
  }));
  context.events = collect(classes, extractEvent);
  context.methods = collect(classes, extractMethod);
  context.properties = collect(classes, extractProperty);
};
const validate = (parsed) => {
  return parsed.statements.filter((statement) => ts.isImportDeclaration(statement)).filter(
    (statement) => ts.isStringLiteral(statement.moduleSpecifier) && statement.moduleSpecifier.text === PACKAGE_NAME
  ).flatMap((statement) => {
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) return [];
    return bindings.elements;
  }).some((element) => {
    const name = (element.propertyName ?? element.name).text;
    if (name === DECORATOR_ELEMENT) return true;
    if (name === DECORATOR_PROPERTY) return true;
    return false;
  });
};
const property = (context) => {
  for (const property2 of context.properties) {
    const expression = property2.decorator.expression;
    if (!ts.isCallExpression(expression)) continue;
    const options = expression.arguments.at(0);
    const object = options && ts.isObjectLiteralExpression(options) ? options : void 0;
    const value = object?.properties.find(
      (property3) => property3.name && ts.isIdentifier(property3.name) && property3.name.text === "type"
    );
    if (value) continue;
    const checker = getTypeChecker(property2.node);
    const type = extractTypeFlags(checker.getTypeAtLocation(property2.node), checker);
    if (object) {
      context.script.appendRight(expression.expression.end + 2, ` type: ${type},`);
    } else {
      context.script.appendRight(expression.expression.end + 1, `{ type: ${type} }`);
    }
  }
};
const extractTypeFlags = (type, checker) => {
  if (type.isUnionOrIntersection()) {
    let result = 0;
    for (const member of type.types) {
      if (type.isIntersection() && member.flags & ts.TypeFlags.Object && !member.getProperties().length)
        continue;
      result |= extractTypeFlags(member, checker);
    }
    return result || TYPE_ANY;
  }
  if (type.flags & ts.TypeFlags.BooleanLike) return TYPE_BOOLEAN;
  if (type.flags & ts.TypeFlags.BigIntLike) return TYPE_BIGINT;
  if (type.flags & ts.TypeFlags.NumberLike) return TYPE_NUMBER;
  if (type.flags & ts.TypeFlags.StringLike) return TYPE_STRING;
  if (type.flags & ts.TypeFlags.Null) return TYPE_NULL;
  if (type.flags & ts.TypeFlags.VoidLike) return TYPE_UNDEFINED;
  if (!(type.flags & ts.TypeFlags.Object)) return TYPE_ANY;
  if (checker.isArrayType(type)) return TYPE_ARRAY;
  if (checker.isTupleType(type)) return TYPE_ARRAY;
  if (type.getSymbol()?.name === "Date") return TYPE_DATE;
  if (type.getCallSignatures().length) return TYPE_FUNCTION;
  return TYPE_OBJECT;
};
const README_OPTIONS = {};
const readme = (_context, userOptions) => {
  ({ ...README_OPTIONS, ...userOptions });
};
const STYLE_OPTIONS = {
  resolver(_context, element) {
    return `${element.stylePath}?inline`;
  },
  source(context) {
    return ["css", "less", "sass", "scss", "styl"].map((key) => {
      return path.join(context.directoryPath, `${context.fileName}.${key}`);
    });
  }
};
const style = (context, userOptions) => {
  const options = { ...STYLE_OPTIONS, ...userOptions };
  for (const element of context.elements) {
    element.stylePath = [options.source(context, element)].flat().find((source) => fs.existsSync(source));
    if (!element.stylePath) continue;
    if (!Object.getOwnPropertyDescriptor(element, "styleContent")?.get) {
      Object.defineProperty(element, "styleContent", {
        configurable: true,
        enumerable: true,
        get() {
          return fs.readFileSync(element.stylePath, "utf8");
        }
      });
    }
    element.styleExtension = path.extname(element.stylePath);
    element.styleName = path.basename(element.stylePath, element.styleExtension);
    const exists = hasStaticClassProperty(element.node, STATIC_STYLE);
    if (exists) continue;
    const local = `${STYLE_IMPORTED}_${element.name}`;
    context.script.prepend(`
import ${local} from '${options.resolver(context, element)}';
`);
    context.script.prependLeft(
      element.node.members.pos,
      `
static readonly ${STATIC_STYLE} = ${local};
`
    );
  }
};
const tag = (context) => {
  for (const element of context.elements) {
    const exists = hasStaticClassProperty(element.node, STATIC_TAG);
    if (exists) continue;
    const elementTagName = kebabCase(element.name);
    context.script.prependLeft(
      element.node.members.pos,
      `
static readonly ${STATIC_TAG} = '${elementTagName}';
`
    );
  }
};
const TYPES_OPTIONS = {
  mode: "new",
  destination(context) {
    return path.join(context.directoryPath, `${context.fileName}.d.ts`);
  },
  transform(_context, output) {
    return output.final;
  }
};
const extractKeys = (members, filter) => {
  return members?.filter((member) => member && (filter ? filter?.(member) : true))?.map((member) => member.name && ts.isIdentifier(member.name) ? member.name.text : "")?.map((key) => `'${key}'`)?.join(" | ") || "never";
};
const types = (contexts, userOptions) => {
  const options = { ...TYPES_OPTIONS, ...userOptions };
  for (const context of contexts) {
    if (!context.elements.length) continue;
    let content = "";
    let current = "";
    for (const element of context.elements) {
      content += template({
        events: element.events,
        interface: `HTML${pascalCase(element.key)}Element`,
        methods: element.methods,
        name: element.name,
        properties: element.properties,
        tag: element.key
      });
    }
    const destination = options.destination(context);
    if (options.mode !== "new" && fs.existsSync(destination)) {
      current = fs.readFileSync(destination, "utf8");
    }
    const final = options.mode === "prepend" ? `${content}${current}` : `${current}${content}`;
    const transformed = options.transform(context, { content, current, final });
    fs.outputFileSync(destination, transformed);
  }
};
const template = (model) => `
// THE FOLLOWING TYPES HAVE BEEN ADDED AUTOMATICALLY

type Filter<Base, Disables> = { [K in keyof Base as K extends keyof Disables ? [Disables[K]] extends [false] ? never : K : '*' extends keyof Disables ? [Disables['*']] extends [false] ? never : K : K]: Base[K] };
type Override<Base, Overrides, AllowedKeys> = { [K in keyof Base]: K extends AllowedKeys ? K extends keyof Overrides ? Overrides[K] : Base[K] : Base[K] };
type ToEventHandlers<T> = { [K in keyof T]?: T[K] extends EventEmitter<infer U> ? (event: CustomEvent<U>) => void : T[K] };
type ToJSXEvent<T> = { [K in keyof T as \`on\${Capitalize<string & K>}\`]: T[K] };
type Rename<T, M extends Partial<Record<keyof T, PropertyKey>>> = Partial<Pick<T, Exclude<keyof T, keyof M>>> & { [K in keyof M as M[K] extends PropertyKey ? M[K] : K]?: K extends keyof T ? T[K] : never };
export type ${model.name}AttributesMapper = {
  ${model.properties.map((property2) => {
  if (!property2.node.name || !ts.isIdentifier(property2.node.name)) return "";
  const name = property2.node.name.text;
  const override = property2.decorator.expression.arguments?.at(0)?.properties.find((property22) => property22.name.text === "attribute")?.found?.initializer.text;
  const attribute = override || kebabCase(name);
  if (name === attribute) return "";
  return `'${name}': '${attribute}'`;
}).filter(Boolean).join(";\n  ")}
};
export type ${model.name}OverridableKeys = ${extractKeys(
  model.properties.map((item) => item.node),
  (property2) => !!property2.type && ts.isTypeReferenceNode(property2.type) && ts.isIdentifier(property2.type.typeName) && property2.type.typeName.text === "OverridableValue"
)};
export interface ${model.name}Disables {}
export interface ${model.name}Overrides {}
export type ${model.name}Attributes = Rename<${model.name}Properties, ${model.name}AttributesMapper>;
export type ${model.name}AttributesOverridden = Rename<${model.name}PropertiesOverridden, ${model.name}AttributesMapper>;
export type ${model.name}AttributesBase = Rename<${model.name}PropertiesBase, ${model.name}AttributesMapper>;
export type ${model.name}Events = Filter<${model.name}EventsBase, ${model.name}Disables>;
export type ${model.name}EventsBase = ToEventHandlers<Pick<${model.name}, ${model.name}EventsKeys>>;
export type ${model.name}EventsKeys = ${extractKeys(model.events.map((item) => item.node))};
export type ${model.name}EventsJSX = ToJSXEvent<${model.name}Events>;
export type ${model.name}EventsBaseJSX = ToJSXEvent<${model.name}EventsBase>;
export type ${model.name}Methods = Filter<${model.name}MethodsBase, ${model.name}Disables>;
export type ${model.name}MethodsBase = Pick<${model.name}, ${model.name}MethodsKeys>;
export type ${model.name}MethodsKeys = ${extractKeys(model.methods.map((item) => item.node))};
export type ${model.name}Properties = Filter<${model.name}PropertiesOverridden, ${model.name}Disables>;
export type ${model.name}PropertiesOverridden = Override<${model.name}PropertiesBase, ${model.name}Overrides, ${model.name}OverridableKeys>;
export type ${model.name}PropertiesBase = Pick<${model.name}, ${model.name}PropertiesKeys>;
export type ${model.name}PropertiesKeys = ${extractKeys(model.properties.map((item) => item.node))};
export type ${model.name}Element = globalThis.${model.interface};
export type ${model.name}JSX = ${model.name}Attributes & ${model.name}EventsJSX;
export namespace JSX {
  interface IntrinsicElements {
    "${model.tag}": ${model.name}JSX;
  }
}
declare global {
  interface ${model.interface} extends HTMLElement, ${model.name}Methods, ${model.name}Properties {}
  var ${model.interface}: {
    prototype: ${model.interface};
    new (): ${model.interface};
  };
  interface HTMLElementTagNameMap {
    "${model.tag}": ${model.interface};
  }
}
declare module '${PACKAGE_NAME}' {
  interface HTMLPlusElements {
    '${model.tag}': {
      properties: ${model.name}PropertiesOverridden;
    };
  }
}
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "${model.tag}": ${model.name}JSX & Omit<DetailedHTMLProps<HTMLAttributes<${model.interface}>, ${model.interface}>, keyof ${model.name}JSX>;
    }
  }
}
`;
const VISUAL_STUDIO_CODE_OPTIONS = {
  destination: path.join("dist", "visual-studio-code.json"),
  reference: () => "",
  transform: (json) => json
};
const getValues = (type) => {
  if (type.flags & ts.TypeFlags.BooleanLike) {
    return ["false", "true"];
  }
  if (type.isUnion()) {
    return [...new Set(type.types.flatMap((member) => getValues(member)))];
  }
  if (type.flags & ts.TypeFlags.EnumLiteral && type.symbol) {
    return [type.symbol.name];
  }
  if (type.isStringLiteral()) {
    return [type.value];
  }
  if (type.isNumberLiteral()) {
    return [String(type.value)];
  }
  return [];
};
const visualStudioCode = (contexts, userOptions) => {
  const options = { ...VISUAL_STUDIO_CODE_OPTIONS, ...userOptions };
  const entries = contexts.flatMap((context) => context.elements.map((element) => ({ context, element }))).sort((a, b) => a.element.key > b.element.key ? 1 : -1);
  const tags = entries.map(({ context, element }) => {
    const attributes = element.properties.map((property2) => {
      const checker = getTypeChecker(property2.node);
      const type = checker.getTypeAtLocation(property2.node);
      return {
        name: property2.attribute,
        values: getValues(type).sort().map((name) => ({ name })),
        description: property2.description
      };
    });
    return {
      name: element.key,
      attributes,
      references: [
        {
          name: "Source code",
          url: options.reference(context, element)
        }
      ],
      description: getDescription(element.node)
    };
  });
  const json = {
    $schema: "TODO",
    version: 1.1,
    tags
  };
  const transformed = options.transform(json);
  const dirname = path.dirname(options.destination);
  fs.ensureDirSync(dirname);
  fs.writeJSONSync(options.destination, transformed, {
    encoding: "utf8",
    spaces: 2
  });
};
const WEB_TYPES_OPTIONS = {
  destination: path.join("dist", "web-types.json"),
  packageName: "",
  packageVersion: "",
  reference: () => "",
  transform: (json) => json
};
const webTypes = (contexts, userOptions) => {
  const options = { ...WEB_TYPES_OPTIONS, ...userOptions };
  const entries = contexts.flatMap((context) => context.elements.map((element) => ({ context, element }))).sort((a, b) => a.element.key > b.element.key ? 1 : -1);
  const elements = entries.map(({ context, element }) => {
    const attributes = element.properties.map((property2) => ({
      name: property2.attribute,
      description: property2.description,
      deprecated: toDeprecated(property2.tags),
      required: property2.required,
      default: property2.initializer,
      value: {
        kind: "plain",
        type: property2.type
      }
    }));
    const events = element.events.map((event) => ({
      name: kebabCase(event.name),
      description: event.description,
      deprecated: toDeprecated(event.tags),
      type: event.detail
    }));
    const properties = [
      ...element.properties.map((property2) => ({
        name: property2.name,
        description: property2.description,
        deprecated: toDeprecated(property2.tags),
        type: property2.type,
        default: property2.initializer,
        "read-only": property2.readonly
      })),
      ...element.methods.map((method) => ({
        name: method.name,
        description: method.description,
        deprecated: toDeprecated(method.tags),
        type: method.signature
      }))
    ];
    const slots = getTags(element.node, "slot", parseNamedTag).map((slot) => ({
      name: slot.name,
      description: slot.description
    }));
    return {
      name: element.key,
      description: getDescription(element.node),
      "doc-url": options.reference(context, element),
      deprecated: toDeprecated(getTags(element.node)),
      attributes,
      slots,
      js: { events, properties }
    };
  });
  const json = {
    $schema: "https://json.schemastore.org/web-types",
    name: options.packageName,
    version: options.packageVersion,
    "js-types-syntax": "typescript",
    "description-markup": "markdown",
    "framework-config": {
      "enable-when": {
        "node-packages": [options.packageName]
      }
    },
    contributions: {
      html: {
        elements
      }
    }
  };
  const transformed = options.transform(json);
  fs.ensureDirSync(path.dirname(options.destination));
  fs.writeJSONSync(options.destination, transformed, { encoding: "utf8", spaces: 2 });
};
const run = (plugin, arg, options) => {
  if (options?.enable === false) return;
  const { enable, ...rest } = options ?? {};
  plugin(arg, rest);
};
const createTransformer = (options) => {
  const contexts = /* @__PURE__ */ new Map();
  const transform = (filePath) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const fileExtension = path.extname(filePath);
    const fileName = path.basename(filePath, fileExtension);
    const directoryPath = path.dirname(filePath);
    const directoryName = path.basename(directoryPath);
    const parsed = getSourceFile(filePath, fileContent);
    if (!validate(parsed)) return;
    const script = new MagicString(fileContent);
    const context = {
      directoryName,
      directoryPath,
      fileContent,
      fileExtension,
      fileName,
      filePath,
      classes: [],
      elements: [],
      events: [],
      methods: [],
      properties: [],
      parsed,
      script
    };
    extract(context);
    tag(context);
    property(context);
    run(style, context, options?.style);
    contexts.set(filePath, context);
    return context.script.toString();
  };
  const finish = () => {
    const all = contexts.values().toArray();
    run(assets, all, options?.assets);
    run(types, all, options?.types);
    run(document, all, options?.document);
    run(visualStudioCode, all, options?.visualStudioCode);
    run(webTypes, all, options?.webTypes);
  };
  return { finish, transform };
};
export {
  ASSETS_OPTIONS,
  DOCUMENT_OPTIONS,
  README_OPTIONS,
  STYLE_OPTIONS,
  TYPES_OPTIONS,
  VISUAL_STUDIO_CODE_OPTIONS,
  WEB_TYPES_OPTIONS,
  assets,
  createTransformer,
  document,
  property,
  readme,
  style,
  tag,
  types,
  visualStudioCode,
  webTypes
};
