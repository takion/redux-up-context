import React, {createContext} from 'react'
import deepmerge from 'deepmerge'

import { Provider, connect } from 'react-redux'

import useModel from './useModel'
import createModel from './createModel'

import { useContextStore, useContextAction } from '@redux-up/hooks'

function mergeRuntime(callFunc, defaultModel = {}, defaultOptions = {}){
  return function(model = {}, options = {}){
    if(typeof model==='function'){
      model = model(defaultModel)
    }
    else{
      if(typeof defaultModel==='function'){
        defaultModel = defaultModel()
      }
      model = deepmerge(defaultModel, model)
    }
    if(typeof options==='function'){
      options = options(defaultOptions)
    }
    else{
      if(typeof defaultOptions==='function'){
        defaultOptions = defaultOptions()
      }
      options = deepmerge(defaultOptions, options)
    }
    return callFunc(model, options)
  }
}


function createContextModel(model, options){
  const context = createContext()
  let contextCreateModel, contextUseModel, contextConnect, contextStore
  return {
    context,
    get createModel(){
      if(contextCreateModel===undefined)
        contextCreateModel = mergeRuntime(createModel, model, options)
      return contextCreateModel
    }, //class constructor component
    get useModel() {
      if(contextUseModel===undefined)
        contextUseModel = mergeRuntime(useModel, model, options)
      return contextUseModel
    }, //hook for function component
    Provider: ({store, children}) => {
      contextStore = store
      return <Provider context={context} store={store} children={children} />
    },
    useStore: mapState => useContextStore(context, mapState),
    useAction: mapActions => useContextAction(context, mapActions),
    get connect(){
      if(!contextConnect)
        contextConnect = function(mapStateToProps, mapDispatchToProps, mergeProps, options = {}){
          options = {
            context,
            ...options
          }
          return connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
        }
      return contextConnect
    },
    get select(){
      return contextStore.select
    },
  }
}

export default createContextModel
