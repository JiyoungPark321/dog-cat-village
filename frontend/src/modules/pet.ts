import { AxiosError, AxiosResponse } from "axios"; 
import { ActionType, createAsyncAction, createReducer } from "typesafe-actions"; 
import { asyncState, createAsyncReducer, transformToArray } from "../lib/reducerUtils";
import { takeEvery } from 'redux-saga/effects';
import createAsyncSaga from "../lib/createAsyncSaga";
import * as PetAPI from '../service/pet';
import { PetDetailType, PetEditType, PetListType, PetProfileImage } from "../interface/pet";

// 반려동물 전체 조회 요청 액션 타입
const GET_PET_LIST = 'pet/GET_PET_LIST';
const GET_PET_LIST_SUCCESS = 'pet/GET_PET_LIST_SUCCESS';
const GET_PET_LIST_ERROR = 'pet/GET_PET_LIST_ERROR';

// 반려동물 등록 요청 액션 타입
const REGISTER_PET = 'pet/REGISTER_PET';
const REGISTER_PET_SUCCESS = 'pet/REGISTER_PET_SUCCESS';
const REGISTER_PET_ERROR = 'pet/REGISTER_PET_ERROR';

// 반려 동물 정보 조회 액션 타입
const GET_PET = 'pet/GET_PET';
const GET_PET_SUCCESS = 'pet/GET_PET_SUCCESS';
const GET_PET_ERROR = 'pet/GET_PET_ERROR';

// 반려 동물 정보 수정 액션 타입
const MODIFY_PET = 'pet/MODIFY_PET';
const MODIFY_PET_SUCCESS = 'pet/MODIFY_PET_SUCCESS';
const MODIFY_PET_ERROR = 'pet/MODIFY_PET_ERROR';

// 반려 동물 정보 삭제 액션 타입
const DELETE_PET = 'pet/DELETE_PET';
const DELETE_PET_SUCCESS = 'pet/DELETE_PET_SUCCESS';
const DELETE_PET_ERROR = 'pet/DELETE_PET_ERROR';

// 반려 동물 이미지 삽입 액션 타입
const SET_PROFILE_IMAGE = 'pet/SET_PROFILE_IMAGE = ';
const SET_PROFILE_IMAGE_SUCCESS = 'pet/SET_PROFILE_IMAGE_SUCCESS';
const SET_PROFILE_IMAGE_ERROR = 'pet/SET_PROFILE_IMAGE_ERROR';

// 선택된 동물 지우는 액션 타입
const SET_INITIAL_SELECTED_PET = 'pet/SET_INITIAL_SELECTED_PET';
const SET_INITIAL_SELECTED_PET_SUCCESS = 'pet/SET_INITIAL_SELECTED_PET_SUCCESS';
const SET_INITIAL_SELECTED_PET_ERROR = 'pet/SET_INITIAL_SELECTED_PET_ERROR';

// 반려 동물 전체 조회 액션
// 반려 동물 등록 액션
// 반려 동물 조회 액션
// 반려 동물 수정 액션
// 반려 동물 삭제 액션
// 반려 동물 이미지 삽입 액션
// 선택된 동물 지우는 액션

// 반려 동물 전체 조회 액션 객체 생성함수
export const getPetListAsync = createAsyncAction(
  GET_PET_LIST,
  GET_PET_LIST_SUCCESS,
  GET_PET_LIST_ERROR
)<any, AxiosResponse<PetListType[]>, AxiosError>();

// 반려 동물 등록 액션 객체 생성함수
export const registerPetAsync = createAsyncAction(
  REGISTER_PET,
  REGISTER_PET_SUCCESS,
  REGISTER_PET_ERROR
)<PetEditType, AxiosResponse<undefined>, AxiosError>();

// 반려 동물 조회 액션 객체 생성함수
export const getPetAsync = createAsyncAction(
  GET_PET,
  GET_PET_SUCCESS,
  GET_PET_ERROR
)<number, AxiosResponse<PetDetailType>, AxiosError>();

// 반려 동물 수정 액션 객체 생성함수
export const modifyPetAsync = createAsyncAction(
  MODIFY_PET,
  MODIFY_PET_SUCCESS,
  MODIFY_PET_ERROR
)<PetEditType, AxiosResponse<PetDetailType>, AxiosError>();

// 반려 동물 삭제 액션 객체 생성함수
export const deletePetAsync = createAsyncAction(
  DELETE_PET,
  DELETE_PET_SUCCESS,
  DELETE_PET_ERROR
)<number, AxiosResponse<undefined>, AxiosError>();

// 반려 동물 이미지 삽입 액션 객체 생성함수
export const setProfileImageAsync = createAsyncAction(
  SET_PROFILE_IMAGE,
  SET_PROFILE_IMAGE_SUCCESS,
  SET_PROFILE_IMAGE_ERROR
)<PetProfileImage, AxiosResponse<undefined>, AxiosError>();

// 선택된 동물 지우는 액션 객체 생성함수
export const setInitialSelectedPetAsync = createAsyncAction(
  SET_INITIAL_SELECTED_PET,
  SET_INITIAL_SELECTED_PET_SUCCESS,
  SET_INITIAL_SELECTED_PET_ERROR
)<any, undefined, undefined>();

// saga
const getPetListSaga = createAsyncSaga(getPetListAsync, PetAPI.getPetList);
const registerPetSaga = createAsyncSaga(registerPetAsync, PetAPI.registerPet);
const getPetSaga = createAsyncSaga(getPetAsync, PetAPI.getPet);
const modifyPetSaga = createAsyncSaga(modifyPetAsync, PetAPI.modifyPet);
const deletePetSaga = createAsyncSaga(deletePetAsync, PetAPI.deletePet);
const setProfileImageSaga = createAsyncSaga(setProfileImageAsync, PetAPI.setProfileImage);
// const setInitialSelectedPetSaga = createAsyncSaga(setInitialSelectedPetAsync, );



// yield takeEvery(SIGN_IN, signInSaga);
// pet saga 생성
export function* petSaga() {
  yield takeEvery(GET_PET_LIST, getPetListSaga);
  yield takeEvery(REGISTER_PET, registerPetSaga);
  yield takeEvery(GET_PET, getPetSaga);
  yield takeEvery(MODIFY_PET, modifyPetSaga);
  yield takeEvery(DELETE_PET, deletePetSaga);
  yield takeEvery(SET_PROFILE_IMAGE, setProfileImageSaga);
  // 선택 동물 초기화
}

// pet actions 객체 모음
const actions = {

}

// pet actions type 저장
type PetAction = ActionType<typeof actions>

// pet state 선언
type PetState = {
  petList: {
    loading: boolean;
    data: PetListType[] | null;
    error: Error | null;
  },
  selectedPet: {
    loading: boolean;
    data: PetDetailType | null;
    error: Error | null;
  }
}

// pet state 초기 상태
const initialState: PetState = {
  petList: asyncState.initial(),
  selectedPet: asyncState.initial(),
}

// reducer 생성
// const pet = createReducer<PetState, PetAction>(initialState).handleAction(
//   transformToArray(getPetListAsync),
//   createAsyncReducer(getPetListAsync, 'petList')
// )


// reducer 함수
// const petReducer = handleActions(
//   {
//     [SET_INITIAL_SELECTED_PET]: (state, action) => {
//       return { ...state, selectedPet: {...initailState.selectedPet}};
//     }
//   }, 
//   initailState
// )

// export default applyPenders(petReducer, [
//   {
//     type: GET_PET_LIST,
//     onSuccess: (state, action) => {
//       const response = action.payload;

//       console.log("동물 리스트 응답 ", response);

//       return {
//         ...state,
//         petList: { ...response.data, }
//       };
//     },
//     onFailure: (state, action) => {
//       return { ...state };
//     }
//   },
//   {
//     type: REGISTER_PET,
//     onSuccess: (state, action) => {
//       const response = action.payload;

//       console.log("동물 등록 응답 ", response);

//       return {
//         ...state,
//       };
//     },
//     onFailure: (state, action) => {
//       return { ...state };
//     }
//   },
//   {
//     type: GET_PET,
//     onSuccess: (state, action) => {
//       const response = action.payload;

//       console.log("동물 디테일 정보 응답 ", response);

//       return {
//         ...state,
//         selectedPet: { ...response.data, }
//       };
//     },
//     onFailure: (state, action) => {
//       return { ...state };
//     }
//   },
//   {
//     type: MODIFY_PET,
//     onSuccess: (state, action) => {
//       const response = action.payload;

//       console.log("동물 정보 수정 응답 ", response);

//       return {
//         ...state,
//         petList: { ...response.data, }
//       };
//     },
//     onFailure: (state, action) => {
//       return { ...state };
//     }
//   },
//   {
//     type: DELETE_PET,
//     onSuccess: (state, action) => {
//       const response = action.payload;

//       console.log("동물 정보 삭제 응답 ", response);

//       return {
//         ...state,
//         selectedPet: { ...initailState.selectedAnimal, }
//       };
//     },
//     onFailure: (state, action) => {
//       return { ...state };
//     }
//   },
// ]);