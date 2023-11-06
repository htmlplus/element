import t from '@babel/types';
export const toPropertySignature = (property, options) => {
    var _a, _b, _c;
    const key = property.key;
    const typeAnnotation = property.typeAnnotation;
    return Object.assign(t.tSPropertySignature(t.stringLiteral(((_a = options === null || options === void 0 ? void 0 : options.keyTransformer) === null || _a === void 0 ? void 0 : _a.call(options, key.name)) || key.name), ((_b = options === null || options === void 0 ? void 0 : options.typeAnnotationTransformer) === null || _b === void 0 ? void 0 : _b.call(options, typeAnnotation)) || typeAnnotation), {
        optional: (_c = options === null || options === void 0 ? void 0 : options.optional) !== null && _c !== void 0 ? _c : property.optional,
        leadingComments: t.cloneNode(property, true).leadingComments
    });
};
