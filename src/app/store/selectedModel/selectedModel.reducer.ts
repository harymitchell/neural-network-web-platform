import { SELECTED_MODEL_GET_SUCCESS, SELECTED_MODEL_REMOVE_SUCCESS, SELECTED_MODEL_SET_SUCCESS, 
  SELECTED_MODEL_ADD_LAYER_SUCCESS, SELECTED_MODEL_UPDATE_SUCCESS, Actions, SELECTED_MODEL_ADD_LAYER,
  SELECTED_MODEL_UPDATE_LAYER, SELECTED_MODEL_UPDATE_LAYER_SUCCESS, SELECTED_MODEL_REMOVE_LAYER_SUCCESS,
  SELECTED_MODEL_REMOVE_LAYER, SELECTED_MODEL_UPDATE} from './selectedModel.actions';
import { IModel, IModelLayer } from '../model/model.reducer';

export class ISelectedModel {
  selectedModel: IModel;
  sliderCurrentIndex: Number;
}

// export class ISelectedModelLayer extends IModelLayer{
// }

export function selectedModelReducer(state: ISelectedModel, action: Actions): ISelectedModel {
  let selectedModel, sliderCurrentIndex;
  switch (action.type) {

    case SELECTED_MODEL_GET_SUCCESS:
      console.log ("SELECTED_MODEL_SET_SUCCESS"); 
      return Object.assign({}, state, {selectedModel: action.payload});

    case SELECTED_MODEL_SET_SUCCESS:
      console.log ("SELECTED_MODEL_SET_SUCCESS");
      sliderCurrentIndex = 1;
      if (action.payload && action.payload.evaluations && action.payload.evaluations.length){
        sliderCurrentIndex = action.payload.evaluations.length;
      }
      return Object.assign({}, state, {selectedModel: action.payload, sliderCurrentIndex: sliderCurrentIndex});

    case SELECTED_MODEL_REMOVE_SUCCESS:
      console.log ("SELECTED_MODEL_REMOVE_SUCCESS");
      return state;
      //.filter((selectedModel: ISelectedModel) => action.payload._id !== selectedModel._id);

    case SELECTED_MODEL_UPDATE:
      console.log ("SELECTED_MODEL_UPDATE");
      if (state && state.selectedModel){
        selectedModel = JSON.parse(JSON.stringify(state.selectedModel));
        if (action.dataset){
          selectedModel.dataset = action.dataset;
        }
        if (typeof action.sliderCurrentIndex === 'number' && action.sliderCurrentIndex >= 0) { 
          sliderCurrentIndex = action.sliderCurrentIndex;
        } else {
          sliderCurrentIndex = state.sliderCurrentIndex;
        }
        if (selectedModel.evaluations && sliderCurrentIndex < selectedModel.evaluations.length) {
          // Return historical.
          let parent = JSON.parse(JSON.stringify(selectedModel.parent || selectedModel));
          let parent_evals = parent.evaluations;
          selectedModel = selectedModel.evaluations[sliderCurrentIndex].model_ref;
          selectedModel.evaluations = parent_evals;
          selectedModel.parent = parent;
          selectedModel.dataset = parent.dataset;
        } else if (selectedModel.parent){
          // Return Current.
          selectedModel = selectedModel.parent;
        }
        return Object.assign({}, state, {selectedModel: selectedModel, 
          sliderCurrentIndex: sliderCurrentIndex});
      }
      return state;

    case SELECTED_MODEL_UPDATE_LAYER:
      // payload = {i: Number, arguments: {}, layerType: String}
      console.log ("SELECTED_MODEL_UPDATE_LAYER");
      if (!state.selectedModel){
        return state;
      }
      selectedModel = JSON.parse(JSON.stringify(state.selectedModel));
      selectedModel.layers = [];
      let i = 0;
      state.selectedModel.layers.forEach(layer => {
        if (i === action.payload['i']) {
          selectedModel.layers.push(action.payload['layer']);
        } else {
          selectedModel.layers.push(layer);
        }
        ++i;
      });
      // return model;
      return Object.assign({}, state, {selectedModel: selectedModel});

    case SELECTED_MODEL_ADD_LAYER_SUCCESS:
      console.log ("SELECTED_MODEL_ADD_LAYER_SUCCESS");
      if (!state.selectedModel){
        return state;
      }
      // selectedModel = JSON.parse(JSON.stringify(state.selectedModel));
      // selectedModel.layers = JSON.parse(JSON.stringify(action.payload.model.layers));
      selectedModel = Object.assign({}, JSON.parse(JSON.stringify(state.selectedModel)), JSON.parse(JSON.stringify(action.payload.model)), {dataset: state.selectedModel.dataset});
      if (!selectedModel.layers){
        selectedModel.layers = [];
      }
      selectedModel.layers.push(action.payload.newLayer);
      // return model;
      return Object.assign({}, state, {selectedModel: selectedModel});

    case SELECTED_MODEL_REMOVE_LAYER: 
      console.log("SELECTED_MODEL_REMOVE_LAYER_SUCCESS");
      if (!state.selectedModel){
        return state;
      }
      selectedModel = JSON.parse(JSON.stringify(state.selectedModel));
      selectedModel.layers.splice(action['index'], 1);
      // return state;
      return Object.assign({}, state, {selectedModel: selectedModel});

    default:
      return state;
  }
}
