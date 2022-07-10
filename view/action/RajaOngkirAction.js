import axios from "axios"
import { API_HEADER_RAJAONGKIR, API_RAJAONGKIR, API_TIMEOUT } from "../utils"

export const GET_PROVINSI = "GET_PROVINSI"
export const GET_KOTA = "GET_KOTA"

export const getProvinsiList = () =>{
    return (dispatch) => {
        //Loading
        dispatch({
            type: GET_PROVINSI,
            payload:{
                loading: true,
                data: false,
                errorMessage: false,
            }
        })

        axios({
            method: 'get',
            url: API_RAJAONGKIR+"province",
            timeout: API_TIMEOUT,
            headers: API_HEADER_RAJAONGKIR,
        }).then((response) => {
            if(response.status !== 200) {
                //Error
                dispatch({
                    type: GET_PROVINSI,
                    payload:{
                        loading: false,
                        data: false,
                        errorMessage: response,
                    }
                })
            }else{
                //Berhasil
                dispatch({
                    type: GET_PROVINSI,
                    payload:{
                        loading: false,
                        data: response.data ? response.data.rajaongkir.results: [],
                        errorMessage: false,
                    }
                })
            }
        }).catch((error)=>{
            //Error
            dispatch({
                type: GET_PROVINSI,
                payload:{
                    loading: false,
                    data: false,
                    errorMessage: error,
                }
            })
            alert(error)
        })

    }
}



export const getKotaList = (provinsi_id) =>{
    return (dispatch) => {
        //Loading
        dispatch({
            type: GET_KOTA,
            payload:{
                loading: true,
                data: false,
                errorMessage: false,
            }
        })

        axios({
            method: 'get',
            url: API_RAJAONGKIR+"city?province="+provinsi_id,
            timeout: API_TIMEOUT,
            headers: API_HEADER_RAJAONGKIR,
        }).then((response) => {
            if(response.status !== 200) {
                //Error
                dispatch({
                    type: GET_KOTA,
                    payload:{
                        loading: false,
                        data: false,
                        errorMessage: response,
                    }
                })
            }else{
                //Berhasil
                dispatch({
                    type: GET_KOTA,
                    payload:{
                        loading: false,
                        data: response.data ? response.data.rajaongkir.results: [],
                        errorMessage: false,
                    }
                })
            }
        }).catch((error)=>{
            //Error
            dispatch({
                type: GET_KOTA,
                payload:{
                    loading: false,
                    data: false,
                    errorMessage: error,
                }
            })
            alert(error)
        })

    }
}