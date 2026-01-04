import {Element,State,Method } from '@htmlplus/element';

@Element()
export class MyElement {
  internalProperty ="htmlplus"

  @Method()
  public() {};

	private() {}
  
  @Method()
  caseSensitive(){}

  @Method()
  binding(){
    return this
  }

  @Method()
  parameterChecking (...parameters){
    return parameters
  }

  @Method()
  syncFunction(){};

  @Method()
  async asyncFunction(){
  }

}
