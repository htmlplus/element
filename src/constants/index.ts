export const KEY = 'htmlplus';
export const PACKAGE_NAME = '@htmlplus/element';

// APIs
export const API_CONNECTED = Symbol();
export const API_DEFAULTS = Symbol();
export const API_HOST = Symbol();
export const API_REQUEST = Symbol();
export const API_RENDER_COMPLETED = Symbol();
export const API_STACKS = Symbol();
export const API_STYLE = Symbol();

// comments
export const COMMENT_AUTO_ADDED = ' THIS IS AUTO-ADDED, DO NOT EDIT MANUALY';

// CSS decorators
export const DECORATOR_CSS_VARIABLE = '@Property()';

// decorators
export const DECORATOR_ELEMENT = 'Element';
export const DECORATOR_EVENT = 'Event';
export const DECORATOR_PROPERTY = 'Property';
export const DECORATOR_PROPERTY_TYPE = 'type';
export const DECORATOR_STATE = 'State';
export const DECORATOR_METHOD = 'Method';

// element
export const ELEMENT_HOST_NAME = 'host';

// lifecycle
export const LIFECYCLE_ADOPTED = 'adoptedCallback';
export const LIFECYCLE_CONNECTED = 'connectedCallback';
export const LIFECYCLE_CONSTRUCTED = 'constructedCallback';
export const LIFECYCLE_DISCONNECTED = 'disconnectedCallback';
export const LIFECYCLE_READY = 'readyCallback';
export const LIFECYCLE_UPDATE = 'updateCallback';
export const LIFECYCLE_UPDATED = 'updatedCallback';

// internal
export const INTERNAL_ATTRIBUTES_IMPORTED = '_internal_a_';
export const INTERNAL_ATTRIBUTES_LOCAL = 'INTERNAL_ATTRIBUTES';
export const INTERNAL_HTML_IMPORTED = '_internal_h_';
export const INTERNAL_HTML_LOCAL = 'INTERNAL_HTML';
export const INTERNAL_STYLES_IMPORTED = '_internal_s_';
export const INTERNAL_STYLES_LOCAL = 'INTERNAL_STYLES';
export const INTERNAL_PATH = PACKAGE_NAME;

// methods
export const METHOD_RENDER = 'render';

// statics
export const STATIC_STYLE = 'style';
export const STATIC_TAG = 'tag';

// style
export const STYLE_IMPORTED = 'STYLE_IMPORTED';

// types
export const TYPE_ARRAY = 2 ** 0;
export const TYPE_BIGINT = 2 ** 1;
export const TYPE_BOOLEAN = 2 ** 2;
export const TYPE_DATE = 2 ** 3;
export const TYPE_ENUM = 2 ** 4;
export const TYPE_FUNCTION = 2 ** 5;
export const TYPE_NULL = 2 ** 6;
export const TYPE_NUMBER = 2 ** 7;
export const TYPE_OBJECT = 2 ** 8;
export const TYPE_STRING = 2 ** 9;
export const TYPE_UNDEFINED = 2 ** 10;
