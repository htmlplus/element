import path, { join, resolve, dirname } from "node:path";
import fs from "fs-extra";
import { glob } from "glob";
import { pascalCase, kebabCase, capitalCase } from "change-case";
import { COMMENT_AUTO_ADDED, DECORATOR_PROPERTY, STATIC_TAG, DECORATOR_PROPERTY_TYPE, PACKAGE_NAME, TYPE_OBJECT, TYPE_NULL, TYPE_ARRAY, TYPE_STRING, TYPE_ENUM, TYPE_NUMBER, TYPE_DATE, TYPE_BOOLEAN, TYPE_ANY, DECORATOR_CSS_VARIABLE, DECORATOR_EVENT, DECORATOR_METHOD, DECORATOR_STATE, STATIC_STYLE, STYLE_IMPORTED, DECORATOR_ELEMENT } from "./constants.js";
import core from "@babel/traverse";
import core$1 from "@babel/generator";
import { parse as parse$1 } from "@babel/parser";
import t from "@babel/types";
import template from "@babel/template";
const ASSETS_OPTIONS = {
  destination(context) {
    return path.join("dist", "assets", context.fileName || "");
  },
  source(context) {
    return path.join(context.directoryPath || "", "assets");
  },
  json(context) {
    return path.join("dist", "assets", `${context.fileName || ""}.json`);
  }
};
const assets = (context, userOptions) => {
  const options = { ...ASSETS_OPTIONS, ...userOptions };
  context.assetsDestination = options.destination(context);
  context.assetsSource = options.source(context);
  if (!context.assetsSource) return;
  if (!fs.existsSync(context.assetsSource)) return;
  fs.copySync(context.assetsSource, context.assetsDestination);
  const json = options.json?.(context);
  if (!json) return;
  fs.ensureDirSync(path.dirname(json));
  const files = glob.sync("**/*.*", { cwd: context.assetsDestination });
  fs.writeJSONSync(json, files, { encoding: "utf8", spaces: 2 });
};
const traverse = core.default || core;
const visitor = traverse;
function addDependency(path2, source, local, imported, comment) {
  let declaration;
  let file = path2;
  while (file.parentPath) file = file.parentPath;
  file = file.node || file;
  visitor(file, {
    ImportDeclaration(path22) {
      if (path22.node.source.value !== source) return;
      declaration = path22.node;
    }
  });
  let specifier = declaration?.specifiers.find((specifier2) => {
    {
      return specifier2.type === "ImportDefaultSpecifier";
    }
  });
  if (specifier)
    return {
      local: specifier.local.name,
      node: declaration
    };
  {
    specifier = t.importDefaultSpecifier(t.identifier(local));
  }
  if (declaration) {
    {
      declaration.specifiers.unshift(specifier);
    }
  } else {
    declaration = t.importDeclaration(specifier ? [specifier] : [], t.stringLiteral(source));
    (file.program || file).body.unshift(declaration);
    {
      t.addComment(declaration, "leading", COMMENT_AUTO_ADDED, true);
    }
  }
  return {
    local,
    node: declaration
  };
}
const extractAttribute = (property) => {
  try {
    return property.decorators.find((decorator) => decorator.expression.callee.name === DECORATOR_PROPERTY).expression.arguments.at(0).properties.find((property2) => property2.key.name === "attribute").value.value;
  } catch {
  }
};
const extractFromComment = (node, whitelist) => {
  const normalized = [];
  const result = {
    description: ""
  };
  const lines = node.leadingComments?.flatMap((comment) => {
    if (comment.type === "CommentLine") {
      return comment.value;
    }
    return comment.value.split("\n");
  })?.map((line) => line.trim().replace(/^\*/, "").trim())?.filter((line) => line.trim());
  for (const line of lines || []) {
    if (line.startsWith("@")) {
      normalized.push(line);
      continue;
    }
    if (!normalized.length) normalized.push("");
    normalized[normalized.length - 1] += ` ${line}`;
  }
  for (const line of normalized) {
    if (!line.startsWith("@")) {
      result.description = line.trim();
      continue;
    }
    const regex = /@(\w+)(?:\s*({\w+})\s*)?(?:\s*([-a-zA-Z\s]+)\s*-\s*)?(.*)/;
    const groups = regex.exec(line);
    if (!groups) continue;
    const tag = groups[1]?.trim();
    const type = groups[2]?.trim().slice(1, -1);
    const name = groups[3]?.trim();
    const description = groups[4]?.trim();
    if (name && description) {
      const key = `${tag}s`;
      if (whitelist && !whitelist.includes(key)) continue;
      result[key] ||= [];
      result[key].push({ name, type, description });
    } else {
      const key = tag;
      if (whitelist && !whitelist.includes(key)) continue;
      result[key] = description || true;
    }
  }
  return result;
};
const getInitializer = (node) => {
  return node?.extra?.raw || node?.["value"];
};
const getTypeReferenceName = (ref) => {
  switch (ref.typeName.type) {
    case "Identifier":
      return ref.typeName.name;
    default:
      return void 0;
  }
};
const getType = (directory, file, node) => {
  if (!node) return node;
  if (node.type !== "TSTypeReference") return node;
  let result;
  const typeName = getTypeReferenceName(node);
  if (!typeName) return node;
  visitor(file, {
    ClassDeclaration(path2) {
      if (path2.node.id?.name !== typeName) return;
      result = path2.node;
      path2.stop();
    },
    ImportDeclaration(path2) {
      for (const specifier of path2.node.specifiers) {
        const alias = specifier.local.name;
        if (alias !== typeName) continue;
        try {
          const reference = glob.sync(
            [".ts*", "/index.ts*"].map((key) => {
              return join(directory, path2.node.source.value).replace(/\\/g, "/") + key;
            })
          ).find((reference2) => reference2 && fs.existsSync(reference2));
          if (!reference) continue;
          const content = fs.readFileSync(reference, "utf8");
          const filePath = resolve(directory, `${path2.node.source.value}.ts`);
          const pathWithAst = path2;
          pathWithAst.$ast ||= parse$1(content, {
            allowImportExportEverywhere: true,
            plugins: ["typescript"],
            ranges: false
          });
          result = getType(dirname(filePath), pathWithAst.$ast, node);
        } catch {
        }
        path2.stop();
        break;
      }
    },
    TSInterfaceDeclaration(path2) {
      if (path2.node.id.name !== typeName) return;
      result = path2.node;
      path2.stop();
    },
    TSTypeAliasDeclaration(path2) {
      if (path2.node.id.name !== typeName) return;
      const typeAnnotation = path2.node.typeAnnotation;
      switch (typeAnnotation.type) {
        case "TSUnionType": {
          const types = [];
          for (const prev of typeAnnotation.types) {
            const next = getType(directory, file, prev);
            if (next.type === "TSUnionType") {
              types.push(...next.types);
            } else {
              types.push(next);
            }
          }
          typeAnnotation.types = types;
          result = typeAnnotation;
          break;
        }
        default: {
          result = getType(directory, file, typeAnnotation);
          break;
        }
      }
      path2.stop();
    }
  });
  return result || node;
};
const getTypeReference = (file, node) => {
  if (!node) return;
  if (node.type !== "TSTypeReference") return;
  let result;
  visitor(file, {
    ImportDeclaration(path2) {
      for (const specifier of path2.node.specifiers) {
        const alias = specifier.local.name;
        if (node.typeName.type !== "Identifier") continue;
        if (alias !== node.typeName.name) continue;
        result = path2.node.source.value;
        path2.stop();
        break;
      }
    }
  });
  return result;
};
const hasDecorator = (node, name) => {
  if ("decorators" in node === false) return false;
  if (!node.decorators) return false;
  for (const decorator of node.decorators) {
    const expression = decorator.expression;
    if (!t.isCallExpression(expression)) continue;
    if (!t.isIdentifier(expression.callee)) continue;
    if (expression.callee.name === name) {
      return true;
    }
  }
  return false;
};
const generator = core$1.default || core$1;
const print = (ast) => {
  if (!ast) return "";
  return generator(ast, { decoratorsBeforeExport: true }).code;
};
const customElement = (context) => {
  if (!context.fileAST) return;
  const ast = t.cloneNode(context.fileAST, true);
  context.elementTagName = `${context.elementKey}`;
  context.elementInterfaceName = `HTML${pascalCase(context.elementTagName)}Element`;
  visitor(ast, {
    ClassDeclaration(path2) {
      const { body, id } = path2.node;
      if (id?.name !== context.className) return;
      const node = t.classProperty(
        t.identifier(STATIC_TAG),
        t.stringLiteral(context.elementTagName || ""),
        void 0,
        void 0,
        void 0,
        true
      );
      t.addComment(node, "leading", COMMENT_AUTO_ADDED, true);
      body.body.unshift(node);
    }
  });
  visitor(ast, {
    Decorator(path2) {
      const { expression } = path2.node;
      if (!t.isCallExpression(expression)) return;
      if (!t.isIdentifier(expression.callee)) return;
      if (expression.callee.name !== DECORATOR_PROPERTY) return;
      if (!expression.arguments.length) {
        expression.arguments.push(t.objectExpression([]));
      }
      const [argument] = expression.arguments;
      if (!t.isObjectExpression(argument)) return;
      const property = argument.properties.find((property2) => {
        return t.isObjectProperty(property2) && t.isIdentifier(property2.key) && property2.key.name === DECORATOR_PROPERTY_TYPE;
      });
      if (property) return;
      let type = 0;
      const extract2 = (input) => {
        switch (input?.type) {
          case "bool":
          case "Boolean":
          case "BooleanLiteral":
          case "TSBooleanKeyword":
            type |= TYPE_BOOLEAN;
            break;
          case "Date":
            type |= TYPE_DATE;
            break;
          case "Number":
          case "NumericLiteral":
          case "TSNumberKeyword":
            type |= TYPE_NUMBER;
            break;
          case "StringLiteral":
            type |= TYPE_ENUM;
            break;
          case "TSStringKeyword":
            type |= TYPE_STRING;
            break;
          case "Array":
          case "TSArrayType":
          case "TSTupleType":
            type |= TYPE_ARRAY;
            break;
          case "TSLiteralType":
            extract2(input.literal);
            break;
          case "TSNullKeyword":
            type |= TYPE_NULL;
            break;
          case "Object":
          case "TSObjectKeyword":
          case "TSMappedType":
          case "TSTypeLiteral":
            type |= TYPE_OBJECT;
            break;
          case "TSTypeReference":
            extract2({ type: input?.typeName?.name });
            break;
          case "TSUnionType":
            input.types.forEach(extract2);
            break;
          // TODO
          case "TSParenthesizedType": {
            if (input?.typeAnnotation?.type !== "TSIntersectionType") break;
            let types = input.types || input.typeAnnotation.types;
            if (types.length !== 2) return;
            types = types.filter((type2) => type2.type !== "TSTypeLiteral");
            if (types.length !== 1) return;
            extract2(types[0]);
            break;
          }
        }
      };
      if (context.directoryPath) {
        extract2(
          // biome-ignore lint: TODO
          getType(context.directoryPath, ast, path2.parent["typeAnnotation"]?.typeAnnotation)
        );
      }
      type = type || TYPE_ANY;
      argument.properties.push(
        t.objectProperty(t.identifier(DECORATOR_PROPERTY_TYPE), t.numericLiteral(type))
      );
    }
  });
  visitor(ast, {
    Program(path2) {
      const extractKeys = (members, filter) => {
        if (!members?.length) return "never";
        return members.filter((method) => t.isIdentifier(method.key)).filter((method) => filter ? filter?.(method) : true).map((method) => method.key.name).map((key) => `'${key}'`).join(" | ");
      };
      const attributeMapper = (context.classProperties ?? []).filter((property) => t.isIdentifier(property.key)).map((property) => {
        const name = property.key.name;
        const attr = extractAttribute(property) || kebabCase(property.key.name);
        if (name === attr) return "";
        return `'${name}': '${attr}'`;
      }).filter(Boolean).join(",\n");
      const ast2 = template.default.ast(
        `
					// THE FOLLOWING TYPES HAVE BEEN ADDED AUTOMATICALLY

					type Filter<Base, Disables> = {
						[K in keyof Base as K extends keyof Disables
							? [Disables[K]] extends [false]
								? never
								: K
							: '*' extends keyof Disables
								? [Disables['*']] extends [false]
									? never
									: K
								: K]: Base[K];
					};

					type Override<
						Base,
						Overrides,
						AllowedKeys
					> = {
						[K in keyof Base]:
							K extends AllowedKeys
								? K extends keyof Overrides
									? Overrides[K]
									: Base[K]
								: Base[K];
					};

					type ToEventHandlers<T> = {
						[K in keyof T]?: T[K] extends EventEmitter<infer U> ? (event: CustomEvent<U>) => void : T[K];
					};

					type ToJSXEvent<T> = { [K in keyof T as \`on\${Capitalize<string & K>}\`]: T[K]; };

					type Rename<
						T,
						M extends Partial<Record<keyof T, PropertyKey>>
					> =
						Partial<Pick<T, Exclude<keyof T, keyof M>>>
						&
						{
							[K in keyof M as M[K] extends PropertyKey ? M[K] : K]?: K extends keyof T ? T[K] : never;
						};

					export type ${context.className}AttributesMapper = {
						${attributeMapper}
					};

					export type ${context.className}OverridableKeys = ${extractKeys(context.classProperties, (property) => property.typeAnnotation?.typeAnnotation?.typeName?.name === "OverridableValue")};

					export interface ${context.className}Disables {}

					export interface ${context.className}Overrides {}

					export type ${context.className}Attributes = Rename<
						${context.className}Properties, 
						${context.className}AttributesMapper
					>;

					export type ${context.className}AttributesOverridden = Rename<
						${context.className}PropertiesOverridden,
						${context.className}AttributesMapper
					>;

					export type ${context.className}AttributesBase = Rename<
						${context.className}PropertiesBase,
						${context.className}AttributesMapper
					>;

					export type ${context.className}Events = Filter<
						${context.className}EventsBase, 
						${context.className}Disables
					>;

					export type ${context.className}EventsBase = ToEventHandlers<Pick<${context.className}, ${context.className}EventsKeys>>;

					export type ${context.className}EventsKeys = ${extractKeys(context.classEvents)};

					export type ${context.className}EventsJSX = ToJSXEvent<${context.className}Events>;

					export type ${context.className}EventsBaseJSX = ToJSXEvent<${context.className}EventsBase>;

					export type ${context.className}Methods = Filter<
						${context.className}MethodsBase, 
						${context.className}Disables
					>;

					export type ${context.className}MethodsBase = Pick<
						${context.className},
						${context.className}MethodsKeys
					>;

					export type ${context.className}MethodsKeys = ${extractKeys(context.classMethods)};

					export type ${context.className}Properties = Filter<
						${context.className}PropertiesOverridden, 
						${context.className}Disables
					>;

					export type ${context.className}PropertiesOverridden = Override<
						${context.className}PropertiesBase, 
						${context.className}Overrides, 
						${context.className}OverridableKeys
					>;

					export type ${context.className}PropertiesBase = Pick<
						${context.className},
						${context.className}PropertiesKeys
					>;

					export type ${context.className}PropertiesKeys = ${extractKeys(context.classProperties)};

					export type ${context.className}Element = globalThis.${context.elementInterfaceName};

					export type ${context.className}JSX = ${context.className}Attributes & ${context.className}EventsJSX;
						
					export namespace JSX {
						interface IntrinsicElements {
							"${context.elementTagName}": ${context.className}JSX;
						}
					}

					declare global {
						interface ${context.elementInterfaceName} extends HTMLElement, ${context.className}Methods, ${context.className}Properties { }

						var ${context.elementInterfaceName}: {
							prototype: ${context.elementInterfaceName};
							new (): ${context.elementInterfaceName};
						};

						interface HTMLElementTagNameMap {
							"${context.elementTagName}": ${context.elementInterfaceName};
						}
					}

					declare module '${PACKAGE_NAME}' {
						interface HTMLPlusElements {
							'${context.elementTagName}': {
								properties: ${context.className}PropertiesOverridden;
							}
						}
					}
					
					declare module "react" {
						namespace JSX {
							interface IntrinsicElements {
								"${context.elementTagName}": ${context.className}JSX & Omit<DetailedHTMLProps<HTMLAttributes<${context.elementInterfaceName}>, ${context.elementInterfaceName}>, keyof ${context.className}JSX>;
							}
						}
					}
				`,
        {
          plugins: ["typescript"],
          preserveComments: true
        }
      );
      path2.node.body.push(...ast2);
    }
  });
  context.script = print(ast);
};
const DOCUMENT_OPTIONS = {
  destination: path.join("dist", "document.json"),
  transformer: (json) => json
};
const document = (contexts, userOptions) => {
  const options = { ...DOCUMENT_OPTIONS, ...userOptions };
  const json = {
    elements: []
  };
  for (const context of contexts) {
    const events = context.classEvents.map((event) => {
      const cancelable = (() => {
        if (!event.decorators) return false;
        try {
          for (const decorator of event.decorators) {
            for (const argument of decorator.expression["arguments"]) {
              for (const property of argument.properties) {
                if (property.key.name !== "cancelable") continue;
                if (property.value.type !== "BooleanLiteral") continue;
                if (!property.value.value) continue;
                return true;
              }
            }
          }
        } catch {
        }
        return false;
      })();
      const detail = print(event.typeAnnotation?.["typeAnnotation"]);
      const detailReference = getTypeReference(
        context.fileAST,
        event.typeAnnotation?.["typeAnnotation"].typeParameters.params[0]
      );
      const name = event.key["name"];
      return {
        cancelable,
        detail,
        detailReference,
        name,
        ...extractFromComment(event)
      };
    });
    const lastModified = glob.sync("**/*.*", { cwd: context.directoryPath }).map((file) => fs.statSync(path.join(context.directoryPath, file)).mtime).sort((a, b) => a > b ? 1 : -1).pop();
    const methods = context.classMethods.map((method) => {
      const async = method.async;
      const name = method.key["name"];
      const comments = extractFromComment(method);
      const parameters = method.params.map((param) => ({
        description: comments.params?.find((item) => item.name === param["name"])?.description,
        required: !param["optional"],
        name: param["name"],
        type: print(param?.["typeAnnotation"]?.typeAnnotation) || void 0,
        typeReference: getTypeReference(context.fileAST, param?.["typeAnnotation"]?.typeAnnotation)
      }));
      delete comments.params;
      const returns = print(method.returnType?.["typeAnnotation"]) || "void";
      const returnsReference = getTypeReference(
        context.fileAST,
        method.returnType?.["typeAnnotation"]
      );
      const signature = [
        method.key["name"],
        "(",
        parameters.map((parameter) => {
          let string = "";
          string += parameter.name;
          string += parameter.required ? "" : "?";
          string += parameter.type ? ": " : "";
          string += parameter.type ?? "";
          return string;
        }).join(", "),
        ")",
        " => ",
        returns
      ].join("");
      return {
        async,
        name,
        parameters,
        returnsReference,
        signature,
        ...comments,
        returns,
        tags: returns !== "void" && comments.returns ? [
          {
            key: "returns",
            value: `${comments.returns}`
          }
        ] : []
      };
    });
    const properties = context.classProperties.map((property) => {
      const attribute = extractAttribute(property) || kebabCase(property.key["name"]);
      const initializer = getInitializer(property.value);
      const name = property.key["name"];
      const readonly = property["kind"] === "get";
      const reflects = (() => {
        if (!property.decorators) return false;
        try {
          for (const decorator of property.decorators) {
            for (const argument of decorator.expression["arguments"]) {
              for (const property2 of argument.properties) {
                if (property2.key.name !== "reflect") continue;
                if (property2.value.type !== "BooleanLiteral") continue;
                if (!property2.value.value) continue;
                return true;
              }
            }
          }
        } catch {
        }
        return false;
      })();
      const required = "optional" in property && !property.optional;
      const type = property["returnType"] ? print(property["returnType"]?.["typeAnnotation"]) : print(property.typeAnnotation?.["typeAnnotation"]);
      const typeReference = getTypeReference(
        context.fileAST,
        property.typeAnnotation?.["typeAnnotation"]
      );
      return {
        attribute,
        initializer,
        name,
        readonly,
        reflects,
        required,
        type,
        typeReference,
        ...extractFromComment(property)
      };
    });
    const styles = (() => {
      if (!context.styleContent) return [];
      return context.styleContent.split(DECORATOR_CSS_VARIABLE).slice(1).map((section) => {
        const [first, second] = section.split(/\n/);
        const description = first.replace("*/", "").trim();
        const name = second.split(":")[0].trim();
        const initializerDefault = second.split(":").slice(1).join(":").replace(";", "").trim();
        const initializerTransformed = context.styleContentTransformed?.split(name)?.at(1)?.split(":")?.filter((section2) => !!section2)?.at(0)?.split(/;|}/)?.at(0)?.trim();
        const initializer = initializerTransformed || initializerDefault;
        return {
          description,
          initializer,
          name
        };
      });
    })();
    const title = capitalCase(context.elementKey);
    const element = {
      events,
      key: context.elementKey,
      lastModified,
      methods,
      properties,
      styles,
      title,
      ...extractFromComment(context.class)
    };
    json.elements.push(element);
  }
  json.elements = json.elements.sort((a, b) => a.title > b.title ? 1 : -1);
  const transformed = options.transformer?.(json) || json;
  const dirname2 = path.dirname(options.destination);
  fs.ensureDirSync(dirname2);
  fs.writeJSONSync(options.destination, transformed, {
    encoding: "utf8",
    spaces: 2
  });
};
const extract = (context) => {
  const body = context.fileAST?.program.body.find((child) => {
    return t.isExportNamedDeclaration(child);
  });
  context.class = body?.declaration;
  if (context.class) {
    context.class.leadingComments = body?.leadingComments;
  }
  context.classMembers = context.class?.body?.body || [];
  context.className = context.class?.id?.name;
  context.elementKey = kebabCase(context.className || "");
  context.classEvents = context.classMembers.filter(
    (member) => hasDecorator(member, DECORATOR_EVENT)
  );
  context.classMethods = context.classMembers.filter(
    (member) => hasDecorator(member, DECORATOR_METHOD)
  );
  context.classProperties = context.classMembers.filter(
    (member) => hasDecorator(member, DECORATOR_PROPERTY)
  );
  context.classStates = context.classMembers.filter(
    (member) => hasDecorator(member, DECORATOR_STATE)
  );
};
const PARSE_OPTIONS = {
  sourceType: "module",
  plugins: [["decorators", { decoratorsBeforeExport: true }], "jsx", "typescript"]
};
const parse = (context, userOptions) => {
  const options = { ...PARSE_OPTIONS, ...userOptions };
  context.fileAST = parse$1(context.fileContent || "", options);
};
const read = (context) => {
  if (!context.filePath) return;
  context.fileContent = fs.readFileSync(context.filePath, "utf8");
  context.fileExtension = path.extname(context.filePath);
  context.fileName = path.basename(context.filePath, context.fileExtension);
  context.directoryPath = path.dirname(context.filePath);
  context.directoryName = path.basename(context.directoryPath);
};
const STYLE_OPTIONS = {
  source(context) {
    return ["css", "less", "sass", "scss", "styl"].map((key) => {
      return path.join(context.directoryPath || "", `${context.fileName}.${key}`);
    });
  }
};
const style = (context, userOptions) => {
  const options = { ...STYLE_OPTIONS, ...userOptions };
  const sources = [options.source(context)].flat();
  for (const source of sources) {
    if (!source) continue;
    if (!fs.existsSync(source)) continue;
    context.stylePath = source;
    break;
  }
  if (!context.stylePath) return;
  context.styleContent = fs.readFileSync(context.stylePath, "utf8");
  context.styleExtension = path.extname(context.stylePath);
  context.styleName = path.basename(context.stylePath, context.styleExtension);
  if (!context.fileAST) return;
  const exists = context.class?.body.body.some((node) => {
    return t.isClassProperty(node) && node.static && t.isIdentifier(node.key) && node.key.name === STATIC_STYLE;
  });
  if (exists) return;
  const { local } = addDependency(
    context.fileAST,
    `${context.stylePath}?inline`,
    STYLE_IMPORTED
  );
  const property = t.classProperty(
    t.identifier(STATIC_STYLE),
    t.identifier(local || ""),
    void 0,
    null,
    void 0,
    true
  );
  t.addComment(property, "leading", COMMENT_AUTO_ADDED, true);
  context.class?.body.body.unshift(property);
};
const validate = (context) => {
  context.skipped = true;
  if (!context.fileAST) return;
  visitor(context.fileAST, {
    ImportDeclaration(path2) {
      if (path2.node.source?.value !== PACKAGE_NAME) return;
      for (const specifier of path2.node.specifiers) {
        if (!t.isImportSpecifier(specifier) || !t.isIdentifier(specifier.imported) || specifier.imported.name !== DECORATOR_ELEMENT) {
          continue;
        }
        const binding = path2.scope.getBinding(specifier.imported.name);
        if (!binding || binding.references === 0) {
          continue;
        }
        const referencePaths = binding.referencePaths.filter((referencePath) => {
          return t.isCallExpression(referencePath.parent) && t.isDecorator(referencePath.parentPath?.parent) && t.isClassDeclaration(referencePath.parentPath.parentPath?.parent) && t.isExportNamedDeclaration(referencePath.parentPath.parentPath.parentPath?.parent);
        });
        if (referencePaths.length > 1) {
          throw new Error(
            "In each file, only one custom element can be defined. \nIf more than one @Element() decorator is used in the file, it will result in an error.\n"
          );
        }
        context.skipped = false;
        if (referencePaths.length === 1) {
          break;
        }
        throw new Error(
          "It appears that the class annotated with the @Element() decorator is not being exported correctly."
        );
      }
      path2.stop();
    }
  });
  context.skipped;
};
const VISUAL_STUDIO_CODE_OPTIONS = {
  destination: path.join("dist", "visual-studio-code.json"),
  reference: () => "",
  transformer: (json) => json
};
const visualStudioCode = (contexts1, userOptions) => {
  const options = { ...VISUAL_STUDIO_CODE_OPTIONS, ...userOptions };
  const contexts = contexts1.sort((a, b) => {
    return a.elementKey.toUpperCase() > b.elementKey.toUpperCase() ? 1 : -1;
  });
  const json = {
    $schema: "TODO",
    version: 1.1,
    tags: []
  };
  for (const context of contexts) {
    const tag = {
      name: context.elementKey,
      attributes: [],
      references: [
        {
          name: "Source code",
          url: options.reference?.(context) || ""
        }
      ],
      ...extractFromComment(context.class, ["description"])
    };
    for (const property of context.classProperties || []) {
      const attribute = {
        name: extractAttribute(property) || kebabCase(property.key["name"]),
        values: [],
        ...extractFromComment(property, ["description"])
      };
      const type = print(
        getType(
          context.directoryPath,
          context.fileAST,
          property.typeAnnotation?.["typeAnnotation"]
        )
      );
      const sections = type.split("|");
      for (const section of sections) {
        const trimmed = section.trim();
        if (!trimmed) continue;
        const isBoolean = /bool|boolean|Boolean/.test(trimmed);
        const isNumber = !isNaN(trimmed);
        const isString = /^("|'|`)/.test(trimmed);
        if (isBoolean) {
          attribute.values.push(
            {
              name: "false"
            },
            {
              name: "true"
            }
          );
        } else if (isNumber) {
          attribute.values.push({
            name: trimmed
          });
        } else if (isString) {
          attribute.values.push({
            name: trimmed.slice(1, -1)
          });
        }
      }
      tag.attributes.push(attribute);
    }
    json.tags.push(tag);
  }
  const transformed = options.transformer?.(json) || json;
  const dirname2 = path.dirname(options.destination);
  fs.ensureDirSync(dirname2);
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
  transformer: (json) => json
};
const webTypes = (contexts1, userOptions) => {
  const options = { ...WEB_TYPES_OPTIONS, ...userOptions };
  const contexts = contexts1.sort((a, b) => {
    return (a.elementKey ?? "").toUpperCase().localeCompare((b.elementKey ?? "").toUpperCase());
  });
  const json = {
    $schema: "http://json.schemastore.org/web-types",
    name: options.packageName,
    version: options.packageVersion,
    "description-markup": "markdown",
    "framework-config": {
      "enable-when": {
        "node-packages": [options.packageName]
      }
    },
    contributions: {
      html: {
        elements: []
      }
    }
  };
  for (const context of contexts) {
    const element = {
      name: context.elementKey || "",
      "doc-url": options.reference?.(context),
      attributes: [],
      js: {
        events: [],
        properties: []
      },
      slots: [],
      ...extractFromComment(context.class, ["description", "deprecated", "experimental", "slots"])
    };
    context.classProperties?.forEach((property) => {
      element.attributes.push({
        name: extractAttribute(property) || kebabCase(property.key["name"]),
        value: {
          // kind: TODO
          type: print(
            getType(
              context.directoryPath,
              context.fileAST,
              property.typeAnnotation?.["typeAnnotation"]
            )
          )
          // required: TODO
          // default: TODO
        },
        default: getInitializer(property.value),
        ...extractFromComment(property, ["description", "deprecated", "experimental"])
      });
    });
    context.classEvents?.forEach((event) => {
      element.js.events.push({
        name: kebabCase(event.key["name"]),
        // TODO
        // 'value': TODO
        ...extractFromComment(event, ["description", "deprecated", "experimental"])
      });
    });
    context.classProperties?.forEach((property) => {
      element.js.properties.push({
        name: property.key["name"],
        // 'value': TODO
        default: getInitializer(property.value),
        ...extractFromComment(property, ["description", "deprecated", "experimental"])
      });
    });
    context.classMethods?.forEach((method) => {
      element.js.properties.push({
        name: method.key["name"],
        // 'value': TODO
        ...extractFromComment(method, ["description", "deprecated", "experimental"])
      });
    });
    json.contributions.html.elements.push(element);
  }
  const transformed = options.transformer?.(json) || json;
  const dirname2 = path.dirname(options.destination);
  fs.ensureDirSync(dirname2);
  fs.writeJSONSync(options.destination, transformed, {
    encoding: "utf8",
    spaces: 2
  });
};
const transformer = (options) => {
  const contexts = /* @__PURE__ */ new Map();
  const transform = (id) => {
    let context = {
      filePath: id
    };
    context = read(context) || context;
    context = parse(context) || context;
    context = validate(context) || context;
    context = extract(context) || context;
    context = style(context, options?.style) || context;
    context = customElement(context) || context;
    contexts.set(id, context);
    return context;
  };
  const finish = () => {
    const all = contexts.values().toArray();
    if (options?.assets) {
      for (const context of all) {
        assets(context, options.assets);
      }
    }
    if (options?.document) {
      document(all, options.document);
    }
    if (options?.visualStudioCode) {
      visualStudioCode(all, options.visualStudioCode);
    }
    if (options?.webTypes) {
      webTypes(all, options.webTypes);
    }
  };
  return { transform, finish };
};
export {
  ASSETS_OPTIONS,
  DOCUMENT_OPTIONS,
  PARSE_OPTIONS,
  STYLE_OPTIONS,
  VISUAL_STUDIO_CODE_OPTIONS,
  WEB_TYPES_OPTIONS,
  assets,
  customElement,
  document,
  extract,
  parse,
  read,
  style,
  transformer,
  validate,
  visualStudioCode,
  webTypes
};
