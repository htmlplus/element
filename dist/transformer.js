import path, { join, resolve, dirname } from "node:path";
import ora from "ora";
import { COMMENT_AUTO_ADDED, DECORATOR_PROPERTY, STATIC_TAG, DECORATOR_PROPERTY_TYPE, PACKAGE_NAME, TYPE_OBJECT, TYPE_NULL, TYPE_ARRAY, TYPE_STRING, TYPE_ENUM, TYPE_NUMBER, TYPE_DATE, TYPE_BOOLEAN, TYPE_ANY, DECORATOR_CSS_VARIABLE, DECORATOR_EVENT, DECORATOR_METHOD, DECORATOR_STATE, STATIC_STYLE, STYLE_IMPORTED, DECORATOR_ELEMENT, KEY } from "./constants.js";
import fs from "fs-extra";
import { glob } from "glob";
import template from "@babel/template";
import t from "@babel/types";
import { pascalCase, kebabCase, capitalCase } from "change-case";
import { parse as parse$1 } from "@babel/parser";
import core from "@babel/traverse";
import core$1 from "@babel/generator";
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
const assets = (userOptions) => {
  const name = "assets";
  const options = Object.assign({}, ASSETS_OPTIONS, userOptions);
  const finish = (global) => {
    for (const context of global.contexts) {
      context.assetsDestination = options.destination(context);
      context.assetsSource = options.source(context);
      if (!context.assetsSource) continue;
      if (!fs.existsSync(context.assetsSource)) continue;
      fs.copySync(context.assetsSource, context.assetsDestination);
      const json = options.json?.(context);
      if (!json) continue;
      fs.ensureDirSync(path.dirname(json));
      const files = glob.sync("**/*.*", { cwd: context.assetsDestination });
      fs.writeJSONSync(json, files, { encoding: "utf8", spaces: 2 });
    }
  };
  return { name, finish };
};
const COPY_OPTIONS = {
  at: "start",
  transformer: (content) => content
};
const copy = (userOptions) => {
  const name = "copy";
  const options = Object.assign({}, COPY_OPTIONS, userOptions);
  const copy2 = (caller) => {
    if (options.at !== caller) return;
    let content = fs.readFileSync(options.source, "utf8");
    if (options.transformer) content = options.transformer(content);
    fs.ensureDirSync(path.dirname(options.destination));
    fs.writeFileSync(options.destination, content, "utf8");
  };
  const start = () => {
    copy2("start");
  };
  const run = () => {
    copy2("run");
  };
  const finish = () => {
    copy2("finish");
  };
  return { name, start, run, finish };
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
const CUSTOM_ELEMENT_OPTIONS = {
  prefix: "",
  typings: true
};
const customElement = (userOptions) => {
  const name = "customElement";
  const options = Object.assign(
    {},
    CUSTOM_ELEMENT_OPTIONS,
    userOptions
  );
  const run = (context) => {
    if (!context.fileAST) return;
    const ast = t.cloneNode(context.fileAST, true);
    context.elementTagName = `${options.prefix}${context.elementKey}`;
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
    if (options.typings) {
      visitor(ast, {
        Program(path2) {
          const attributes = (context.classProperties || []).filter((property) => !t.isClassMethod(property)).map((property) => {
            const keyName = extractAttribute(property) ?? (t.isIdentifier(property.key) ? kebabCase(property.key.name) : "");
            const typeAnnotation = property.typeAnnotation ? property.typeAnnotation : void 0;
            const signature = t.tSPropertySignature(
              t.stringLiteral(kebabCase(keyName)),
              typeAnnotation
            );
            signature.optional = property.optional ?? !!property.value;
            signature.leadingComments = t.cloneNode(property, true).leadingComments;
            return signature;
          });
          const events = (context.classEvents ?? []).map((event) => {
            if (!t.isIdentifier(event.key)) return null;
            const key = event.key;
            const parameter = t.identifier("event");
            parameter.typeAnnotation = t.tsTypeAnnotation(
              t.tsTypeReference(
                t.identifier("CustomEvent"),
                // biome-ignore lint: TODO
                event.typeAnnotation?.["typeAnnotation"]?.typeParameters
              )
            );
            const functionType = t.tsFunctionType(
              void 0,
              [parameter],
              t.tsTypeAnnotation(t.tsVoidKeyword())
            );
            const signature = t.tSPropertySignature(
              t.identifier(key.name),
              t.tsTypeAnnotation(functionType)
            );
            signature.optional = true;
            signature.leadingComments = t.cloneNode(event, true).leadingComments;
            return signature;
          }).filter((event) => !!event);
          const methods = (context.classMethods ?? []).map((method) => {
            if (!t.isIdentifier(method.key)) return null;
            const parameters = method.params ?? [];
            const returnType = method.returnType;
            const signature = t.tsMethodSignature(method.key, void 0, parameters, returnType);
            signature.leadingComments = t.cloneNode(method, true).leadingComments;
            return signature;
          }).filter((method) => !!method);
          const properties = (context.classProperties ?? []).map((property) => {
            if (!t.isIdentifier(property.key)) return null;
            const key = property.key;
            const readonly = property.readonly || !!property["returnType"];
            const typeAnnotation = property.typeAnnotation || property["returnType"];
            const signature = t.tsPropertySignature(t.identifier(key.name), typeAnnotation);
            signature.readonly = readonly;
            signature.optional = property.optional ?? !!property.value;
            signature.leadingComments = t.cloneNode(property, true).leadingComments;
            return signature;
          }).filter((property) => !!property);
          const attributeMapper = (context.classProperties ?? []).filter((property) => t.isIdentifier(property.key)).map((property) => {
            return `'${property.key.name}': '${extractAttribute(property) || kebabCase(property.key.name)}'`;
          }).join(",\n");
          const overridableKeys = (context.classProperties ?? []).filter((property) => {
            if (!t.isIdentifier(property.key)) return false;
            const isOverridableValue = (
              // biome-ignore lint: TODO
              property.typeAnnotation?.typeAnnotation?.typeName?.name === "OverridableValue"
            );
            return isOverridableValue;
          }).map((property) => `'${property.key.name}'`).join(" | ");
          const ast2 = template.default.ast(
            `
              // THE FOLLOWING TYPES HAVE BEEN ADDED AUTOMATICALLY

							type Filter<
								Base,
								Disables,
								Mapper extends Record<PropertyKey, PropertyKey> | undefined = undefined
							> = {
								[K in keyof Base as
									Mapper extends Record<PropertyKey, PropertyKey>
										? { [P in keyof Mapper as Mapper[P]]: P }[K] extends infer PropKey
											? PropKey extends keyof Disables
												? [Disables[PropKey]] extends [false]
													? never
													: K
												: '*' extends keyof Disables
													? [Disables['*']] extends [false]
														? never
														: K
													: K
											: K
										: K extends keyof Disables
											? [Disables[K]] extends [false]
												? never
												: K
											: '*' extends keyof Disables
												? [Disables['*']] extends [false]
													? never
													: K
												: K
								]: Base[K];
							};

							type Override<
								Base,
								Overrides,
								AllowedKeys,
								Mapper extends Record<PropertyKey, PropertyKey> | undefined = undefined
							> = {
								[K in keyof Base]:
									Mapper extends Record<PropertyKey, PropertyKey>
										? {
												[P in keyof Mapper as Mapper[P]]: P
											}[K] extends infer PropKey
												? PropKey extends AllowedKeys
													? PropKey extends keyof Overrides
														? Overrides[PropKey]
														: Base[K]
													: Base[K]
												: Base[K]
										: K extends AllowedKeys
											? K extends keyof Overrides
												? Overrides[K]
												: Base[K]
											: Base[K];
							};

							export type ${context.className}AttributesMapper = {
								${attributeMapper}
							};

							export type ${context.className}OverridableKeys = ${overridableKeys || "never"};

							export interface ${context.className}Disables {}

							export interface ${context.className}Overrides {}

							export type ${context.className}Attributes = Filter<
								${context.className}AttributesOverridden, 
								${context.className}Disables, 
								${context.className}AttributesMapper
							>;

							export type ${context.className}AttributesOverridden = Override<
								${context.className}AttributesBase, 
								${context.className}Overrides, 
								${context.className}OverridableKeys, 
								${context.className}AttributesMapper
							>;

              export type ${context.className}AttributesBase = {
                ${attributes.map(print).join("")}
              }

							export type ${context.className}Events = Filter<
								${context.className}EventsBase, 
								${context.className}Disables
							>;

              export type ${context.className}EventsBase = {
                ${events.map(print).join("")}
              }

							export type ${context.className}EventsJSX = Filter<
								${context.className}EventsBaseJSX, 
								${context.className}Disables, 
								{
									${events.map((event) => `${print(event.key)}: 'on${pascalCase(print(event.key))}';`).join("")}
								}
							>;

							export type ${context.className}EventsBaseJSX = {
                ${events.map((event) => ({
              ...event,
              key: t.identifier(`on${pascalCase(print(event.key))}`)
            })).map(print).join("")}
							};

							export type ${context.className}Methods = Filter<
								${context.className}MethodsBase, 
								${context.className}Disables
							>;

              export type ${context.className}MethodsBase = {
                ${methods.map(print).join("")}
              }

							export type ${context.className}Properties = Filter<
								${context.className}PropertiesOverridden, 
								${context.className}Disables
							>;

							export type ${context.className}PropertiesOverridden = Override<
								${context.className}PropertiesBase, 
								${context.className}Overrides, 
								${context.className}OverridableKeys
							>;

              export type ${context.className}PropertiesBase = {
                ${properties.map(print).join("")}
              }

							declare module '${PACKAGE_NAME}' {
							  interface HTMLPlusElements {
									'${context.elementTagName}': {
										properties: ${context.className}PropertiesOverridden;
									}
								}
							}

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
      visitor(ast, {
        TSTypeReference(path2) {
          if (!t.isIdentifier(path2.node.typeName)) return;
          if (path2.node.typeName.name !== "OverridesConfig") return;
          const property = path2.findParent((p) => p.isTSPropertySignature());
          if (!property) return;
          if (!t.isTSPropertySignature(property.node)) return;
          const name2 = property.node.key.name || property.node.key.extra.rawValue;
          if (!name2) return;
          if (!path2.node.typeParameters?.params) return;
          path2.node.typeParameters.params[1] = t.tsTypeReference(
            t.identifier("Omit"),
            t.tsTypeParameterInstantiation([
              t.tsTypeReference(t.identifier(`${context.className}Properties`)),
              t.tsLiteralType(t.stringLiteral(name2))
            ])
          );
          path2.skip();
        }
      });
    }
    context.script = print(ast);
  };
  return { name, run };
};
const DOCUMENT_OPTIONS = {
  destination: path.join("dist", "document.json"),
  transformer: (_context, element) => element
};
const document = (userOptions) => {
  const name = "document";
  const options = Object.assign({}, DOCUMENT_OPTIONS, userOptions);
  const finish = (global) => {
    const json = {
      elements: []
    };
    for (const context of global.contexts) {
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
        const name2 = event.key["name"];
        return Object.assign(
          {
            cancelable,
            detail,
            detailReference,
            name: name2
          },
          extractFromComment(event)
        );
      });
      const lastModified = glob.sync("**/*.*", { cwd: context.directoryPath }).map((file) => fs.statSync(path.join(context.directoryPath, file)).mtime).sort((a, b) => a > b ? 1 : -1).pop();
      const methods = context.classMethods.map((method) => {
        const async = method.async;
        const name2 = method.key["name"];
        const comments = extractFromComment(method);
        const parameters = method.params.map((param) => ({
          description: comments.params?.find((item) => item.name === param["name"])?.description,
          required: !param["optional"],
          name: param["name"],
          type: print(param?.["typeAnnotation"]?.typeAnnotation) || void 0,
          typeReference: getTypeReference(
            context.fileAST,
            param?.["typeAnnotation"]?.typeAnnotation
          )
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
        return Object.assign(
          {
            async,
            name: name2,
            parameters,
            returns,
            returnsReference,
            signature
          },
          comments,
          // TODO
          {
            returns
          },
          // TODO
          returns !== "void" && comments.returns && {
            tags: [
              {
                key: "returns",
                value: `${comments.returns}`
              }
            ]
          }
        );
      });
      const properties = context.classProperties.map((property) => {
        const attribute = extractAttribute(property) || kebabCase(property.key["name"]);
        const initializer = getInitializer(property.value);
        const name2 = property.key["name"];
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
        return Object.assign(
          {
            attribute,
            initializer,
            name: name2,
            readonly,
            reflects,
            required,
            type,
            typeReference
          },
          extractFromComment(property)
        );
      });
      const styles = (() => {
        if (!context.styleContent) return [];
        return context.styleContent.split(DECORATOR_CSS_VARIABLE).slice(1).map((section) => {
          const [first, second] = section.split(/\n/);
          const description = first.replace("*/", "").trim();
          const name2 = second.split(":")[0].trim();
          const initializerDefault = second.split(":").slice(1).join(":").replace(";", "").trim();
          const initializerTransformed = context.styleContentTransformed?.split(name2)?.at(1)?.split(":")?.filter((section2) => !!section2)?.at(0)?.split(/;|}/)?.at(0)?.trim();
          const initializer = initializerTransformed || initializerDefault;
          return {
            description,
            initializer,
            name: name2
          };
        });
      })();
      const title = capitalCase(context.elementKey);
      const element = Object.assign(
        {
          events,
          key: context.elementKey,
          lastModified,
          methods,
          properties,
          readmeContent: context.readmeContent,
          styles,
          title
        },
        extractFromComment(context.class)
      );
      const transformed = options.transformer?.(context, element) || element;
      json.elements.push(transformed);
    }
    json.elements = json.elements.sort((a, b) => a.title > b.title ? 1 : -1);
    const dirname2 = path.dirname(options.destination);
    fs.ensureDirSync(dirname2);
    fs.writeJSONSync(options.destination, json, {
      encoding: "utf8",
      spaces: 2
    });
  };
  return { name, finish };
};
const extract = () => {
  const name = "extract";
  const run = (context) => {
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
  return { name, run };
};
const PARSE_OPTIONS = {
  sourceType: "module",
  plugins: [["decorators", { decoratorsBeforeExport: true }], "jsx", "typescript"]
};
const parse = (userOptions) => {
  const name = "parse";
  const options = Object.assign({}, PARSE_OPTIONS, userOptions);
  const run = (context) => {
    context.fileAST = parse$1(context.fileContent || "", options);
  };
  return { name, run };
};
const read = () => {
  const name = "read";
  const run = (context) => {
    if (!context.filePath) return;
    context.fileContent = fs.readFileSync(context.filePath, "utf8");
    context.fileExtension = path.extname(context.filePath);
    context.fileName = path.basename(context.filePath, context.fileExtension);
    context.directoryPath = path.dirname(context.filePath);
    context.directoryName = path.basename(context.directoryPath);
  };
  return { name, run };
};
const README_OPTIONS = {
  source(context) {
    return path.join(context.directoryPath || "", `${context.fileName}.md`);
  }
};
const readme = (userOptions) => {
  const name = "readme";
  const options = Object.assign({}, README_OPTIONS, userOptions);
  const finish = (global) => {
    for (const context of global.contexts) {
      context.readmePath = options.source(context);
      if (!context.readmePath) continue;
      if (!fs.existsSync(context.readmePath)) continue;
      context.readmeContent = fs.readFileSync(context.readmePath, "utf8");
      context.readmeExtension = path.extname(context.readmePath);
      context.readmeName = path.basename(context.readmePath, context.readmeExtension);
    }
  };
  return { name, finish };
};
const STYLE_OPTIONS = {
  source(context) {
    return ["css", "less", "sass", "scss", "styl"].map((key) => {
      return path.join(context.directoryPath || "", `${context.fileName}.${key}`);
    });
  }
};
const style = (userOptions) => {
  const name = "style";
  const options = Object.assign({}, STYLE_OPTIONS, userOptions);
  const run = (context) => {
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
      context.stylePath,
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
  return { name, run };
};
const validate = () => {
  const name = "validate";
  const run = (context) => {
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
  return { name, run };
};
const VISUAL_STUDIO_CODE_OPTIONS = {
  destination: path.join("dist", "visual-studio-code.json"),
  reference: () => "",
  transformer: (_context, element) => element
};
const visualStudioCode = (userOptions) => {
  const name = "visualStudioCode";
  const options = Object.assign(
    {},
    VISUAL_STUDIO_CODE_OPTIONS,
    userOptions
  );
  const finish = (global) => {
    const contexts = global.contexts.sort((a, b) => {
      return a.elementKey.toUpperCase() > b.elementKey.toUpperCase() ? 1 : -1;
    });
    const json = {
      $schema: "TODO",
      version: 1.1,
      tags: []
    };
    for (const context of contexts) {
      const tag = Object.assign(
        {
          name: context.elementKey,
          attributes: [],
          references: [
            {
              name: "Source code",
              url: options.reference?.(context)
            }
          ]
        },
        extractFromComment(context.class, ["description"])
      );
      for (const property of context.classProperties || []) {
        const attribute = Object.assign(
          {
            name: extractAttribute(property) || kebabCase(property.key["name"]),
            values: []
          },
          extractFromComment(property, ["description"])
        );
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
      const transformed = options.transformer?.(context, tag) || tag;
      json.tags.push(transformed);
    }
    const dirname2 = path.dirname(options.destination);
    fs.ensureDirSync(dirname2);
    fs.writeJSONSync(options.destination, json, {
      encoding: "utf8",
      spaces: 2
    });
  };
  return { name, finish };
};
const WEB_TYPES_OPTIONS = {
  destination: path.join("dist", "web-types.json"),
  packageName: "",
  packageVersion: "",
  reference: () => "",
  transformer: (_context, element) => element
};
const webTypes = (userOptions) => {
  const name = "webTypes";
  const options = Object.assign({}, WEB_TYPES_OPTIONS, userOptions);
  const finish = (global) => {
    const contexts = global.contexts.sort((a, b) => {
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
      const attributes = context.classProperties?.map(
        (property) => Object.assign(
          {
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
            default: getInitializer(property.value)
          },
          extractFromComment(property, ["description", "deprecated", "experimental"])
        )
      );
      const events = context.classEvents?.map(
        (event) => Object.assign(
          {
            name: kebabCase(event.key["name"])
            // TODO
            // 'value': TODO
          },
          extractFromComment(event, ["description", "deprecated", "experimental"])
        )
      );
      const methods = context.classMethods?.map(
        (method) => Object.assign(
          {
            name: method.key["name"]
            // 'value': TODO
          },
          extractFromComment(method, ["description", "deprecated", "experimental"])
        )
      );
      const properties = context.classProperties?.map(
        (property) => Object.assign(
          {
            name: property.key["name"],
            // 'value': TODO
            default: getInitializer(property.value)
          },
          extractFromComment(property, ["description", "deprecated", "experimental"])
        )
      );
      const element = Object.assign(
        {
          name: context.elementKey,
          "doc-url": options.reference?.(context),
          js: {
            events,
            properties: [].concat(properties, methods)
          },
          attributes
        },
        extractFromComment(context.class, ["description", "deprecated", "experimental", "slots"])
      );
      const transformed = options.transformer?.(context, element) || element;
      json.contributions.html.elements.push(transformed);
    }
    const dirname2 = path.dirname(options.destination);
    fs.ensureDirSync(dirname2);
    fs.writeJSONSync(options.destination, json, {
      encoding: "utf8",
      spaces: 2
    });
  };
  return { name, finish };
};
const logger = ora({
  color: "yellow"
});
const log = (message, persist) => {
  const content = `${(/* @__PURE__ */ new Date()).toLocaleTimeString()} [${KEY}] ${message}`;
  const log2 = logger.start(content);
  if (!persist) return;
  log2.succeed();
};
const transformer = (...plugins) => {
  let global = {
    contexts: []
  };
  const start = async () => {
    log(`Started.`, true);
    log(`${plugins.length} plugins detected.`, true);
    log(`Plugins are starting.`, true);
    for (const plugin of plugins) {
      if (!plugin.start) continue;
      log(`Plugin '${plugin.name}' is starting.`);
      global = await plugin.start(global) || global;
      log(`Plugin '${plugin.name}' started successfully.`);
    }
    log(`Plugins have been successfully started.`, true);
  };
  const run = async (filePath) => {
    let context = {
      filePath
    };
    const parsed = path.parse(filePath);
    for (const plugin of plugins) {
      if (!plugin.run) continue;
      const source = path.join(parsed.dir).split(path.sep).slice(-2).concat(parsed.base).join("/");
      log(`Plugin '${plugin.name}' is executing on '${source}' file.`);
      try {
        context = await plugin.run(context, global) || context;
      } catch (error) {
        log(`Error in '${plugin.name}' plugin on '${source}' file.
`, true);
        throw error;
      }
      global.contexts = global.contexts.filter((current) => {
        return current.filePath !== context.filePath;
      }).concat(context);
      log(`Plugin '${plugin.name}' executed successfully on '${source}' file.`);
    }
    logger.stop();
    return context;
  };
  const finish = async () => {
    log(`Plugins are finishing.`, true);
    for (const plugin of plugins) {
      if (!plugin.finish) continue;
      log(`Plugin '${plugin.name}' is finishing.`);
      global = await plugin.finish(global) || global;
      log(`Plugin '${plugin.name}' finished successfully.`);
    }
    log(`Plugins have been successfully finished.`, true);
    log(`Finished.`, true);
  };
  return { global, start, run, finish };
};
export {
  ASSETS_OPTIONS,
  COPY_OPTIONS,
  CUSTOM_ELEMENT_OPTIONS,
  DOCUMENT_OPTIONS,
  PARSE_OPTIONS,
  README_OPTIONS,
  STYLE_OPTIONS,
  VISUAL_STUDIO_CODE_OPTIONS,
  WEB_TYPES_OPTIONS,
  assets,
  copy,
  customElement,
  document,
  extract,
  parse,
  read,
  readme,
  style,
  transformer,
  validate,
  visualStudioCode,
  webTypes
};
