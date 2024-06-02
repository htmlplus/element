import * as CONSTANTS from '../../constants/index.js';
export const extractAttribute = (property) => {
    try {
        return property.decorators
            .find((decorator) => decorator.expression.callee.name == CONSTANTS.DECORATOR_PROPERTY)
            .expression.arguments[0].properties.find((property) => property.key.name == 'attribute').value
            .value;
    }
    catch { }
};
