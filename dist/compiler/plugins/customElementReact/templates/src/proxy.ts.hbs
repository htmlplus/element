/**************************************************
 * THIS FILE IS AUTO-GENERATED, DO NOT EDIT MANUALY
 **************************************************/
import React from 'react';

import { camelCase, kebabCase, pascalCase } from 'change-case';

export type Rename<T, R extends { [K in keyof R]: K extends keyof T ? PropertyKey : 'Error: key not in T' }> = {
  [P in keyof T as P extends keyof R ? R[P] : P]: T[P];
};

type EventHandlerType = (event: Event) => any;

type FinalPropsType<ElementType> = Omit<PropsType<ElementType>, 'forwardedRef'>;

type Mutable<T> = { -readonly [P in keyof T]-?: T[P] };

interface ExtraType {
  props?: Array<string>;
  events?: Array<string>;
}

interface PropsType<ElementType> extends React.HTMLAttributes<ElementType> {
  forwardedRef: React.RefObject<ElementType>;
  ref?: React.Ref<any>;
}

export interface StyleReactProps {
  class?: string;
  className?: string;
  style?: {
    [key: string]: any;
  };
}

const arrayToMap = (array: string[] | DOMTokenList) => {
  const map = new Map<string, string>();

  (array as string[]).forEach((s: string) => map.set(s, s));

  return map;
};

const getCustomEvent = (name: string, events: Array<string>) => {
  // TODO
  name = camelCase(name.slice(3));

  const event = events.find((event) => event.endsWith(name));

  if (!event) return;

  return event;
};

const forwardRef = <ElementType, PropType>(ReactComponent: any) => {
  const forwardRef = (
    props: PropType & Omit<React.HTMLAttributes<ElementType>, 'style'> & StyleReactProps,
    ref: React.Ref<ElementType>
  ) => {
    const { children, ...remainedProps } = props;

    const newProps = {
      ...remainedProps,
      forwardedRef: ref
    };

    return React.createElement(ReactComponent, newProps, children);
  };

  forwardRef.displayName = ReactComponent.displayName;

  return React.forwardRef(forwardRef);
};

const isEvent = (name: string) => {
  return name.indexOf('on') === 0 && name[2] === name[2].toUpperCase();
};

const isPrimitive = (value: any) => {
  const type = typeof value;

  const match = type.match(/boolean|string|number/);

  return match;
};

const getProps = <ElementType>(ref: React.Ref<ElementType>, props: PropsType<ElementType>, extra: ExtraType) => {
  const { forwardedRef } = props;

  const result: FinalPropsType<ElementType> = {
    ref: mergeRefs(forwardedRef, ref)
  };

  Object.keys(props).forEach((name) => {
    if (name === 'children' || name === 'className' || name === 'forwardedRef' || name === 'ref') return;

    const value = (props as any)[name];

    if (isEvent(name)) {
      if (typeof document === 'undefined') return;

      const event = getCustomEvent(name, extra.events || []);

      if (event) return;

      (result as any)[name] = value;
    } else if (extra.props?.includes(name)) {
      if (!isPrimitive(value)) return;

      (result as any)[kebabCase(name)] = value;
    } else {
      (result as any)[name] = value;
    }
  });

  return result;
};

const mergeRefs =
  <ElementType>(...refs: React.Ref<ElementType>[]) =>
  (value: ElementType) => {
    return refs.forEach((ref) => {
      if (typeof ref === 'function') return ref(value);

      if (ref == null) return;

      (ref as Mutable<React.RefObject<ElementType>>).current = value;
    });
  };

const setClass = <ElementType>(element: ElementType, props: PropsType<ElementType>) => {
  const classes: string[] = [];

  const current = arrayToMap((element as any).classList);

  const prev: string = (element as any)['$class'];
  const next: string = props.className || (props as any).class;

  const prevClass = arrayToMap(prev ? prev.split(' ') : []);
  const nextClass = arrayToMap(next ? next.split(' ') : []);

  current.forEach((key) => {
    if (nextClass.has(key)) {
      classes.push(key);

      nextClass.delete(key);
    } else if (!prevClass.has(key)) {
      classes.push(key);
    }
  });

  nextClass.forEach((key) => classes.push(key));

  const className = classes.join(' ');

  (element as any).className = className;

  (element as any)['$class'] = className;
};

const setEvent = (element: Element, name: string, handler: EventHandlerType) => {
  const events = (element as any)['$events'] || ((element as any)['$events'] = {});

  const previous = events[name];

  previous && element.removeEventListener(pascalCase(name), previous);

  element.addEventListener(
    pascalCase(name),
    (events[name] = function callback(event: Event) {
      handler && handler.call(this, event);
    })
  );
};

const setProps = <ElementType>(element: ElementType, props: PropsType<ElementType>, extra: ExtraType) => {
  if (!(element instanceof Element)) return;

  setClass<ElementType>(element, props);

  Object.keys(props).forEach((name) => {
    if (
      name === 'children' ||
      name === 'class' ||
      name === 'className' ||
      name === 'forwardedRef' ||
      name === 'ref' ||
      name === 'style'
    )
      return;

    const value = (props as any)[name];

    if (isEvent(name)) {
      if (typeof document === 'undefined') return;

      const event = getCustomEvent(name, extra.events || []);

      if (!event) return;

      setEvent(element, event, value);
    } else if (extra.props?.includes(name)) {
      if (isPrimitive(value)) {
        element.setAttribute(kebabCase(name), value);
      } else {
        (element as any)[name] = value;
      }
    } else {
      (element as any)[name] = value;
    }
  });
};

export const proxy = <ElementType, PropType>(
  tagName: string,
  props: Array<string> = [],
  events: Array<string> = []
) => {
  const extra: ExtraType = {
    props,
    events
  };

  const ReactComponent = class extends React.Component<PropsType<ElementType>> {
    element!: ElementType;

    setElement = (element: ElementType) => {
      this.element = element;
    };

    constructor(props: PropsType<ElementType>) {
      super(props);
    }

    componentDidMount() {
      this.componentDidUpdate(/*this.props*/);
    }

    componentDidUpdate(/*prevProps: InternalProps<ElementType>*/) {
      setProps<ElementType>(this.element as any, this.props, extra);
    }

    componentWillUnmount() {
      if (!this.element) return;

      const events = (this.element as any)['$events'] || {};

      Object.keys(events).forEach((name) => {
        const handler = events[name];

        (this.element as any).removeEventListener(pascalCase(name), handler);
      });

      delete (this.element as any)['$events'];
    }

    render() {
      const { children } = this.props;

      const props = getProps<ElementType>(this.setElement, this.props, extra);

      return React.createElement(tagName, props, children);
    }
  };

  (ReactComponent as any)['displayName'] = pascalCase(tagName);

  return forwardRef<ElementType, PropType>(ReactComponent);
};
