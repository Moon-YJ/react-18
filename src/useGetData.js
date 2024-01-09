import { useEffect, useState } from "react";
import axios from "axios";
// npm i axios

// data fetching (axios, fetch)
// axios (라이브러리) : 데이터입출력 요청에 대한 전용메서드, 비동기 데이터 반환에러의 상태값을 실시간 체크해서 catch로 잡을 수 있음
// fetch (js 내장함수) : 데이터입출력 요청에 대한 전용메서드 없음, network상의 문제가 있을때만 catch로 에러를 잡아주기 때문에 비동기데이터 반환실패에 대한 상태값을 수동으로 직접 연결해야함

// promise객체를 인수로 받아서 해당 promise상태에 따라 반환되는 값을 직접 리턴해주는 함수를 반환
const checkPromiseStatus = (promise) => {
  let status = "pending";
  let result;

  // 인수로 전달된 promise의 상태에 따라 현재 상태 값과 반환(value)값을 각각 status, result 변수에 담아줌
  const setPromise = promise
    .then((value) => {
      status = "fulfilled";
      result = value;
    })
    .catch((error) => {
      status = "rejected";
      result = error;
    });

  // 위에서 저장되는 status값에 따라 fetching된 결과값을 반환하는 함수를 리턴
  return () => {
    switch (status) {
      case "pending":
        throw setPromise;
      case "fulfilled":
        return result;
      case "rejected":
        return result;
      default:
        throw new Error("Unknown Status");
    }
  };
};

function useGetData(url) {
  const [Data, setData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      // 데이터 요청 후 현재 데이터 상태를 확인하는 promise 객체 자체를 비동기적으로 받음
      const promise = axios.get(url).then((response) => response.data);
      // 해당 promise 객체를 checkPromiseStatus함수의 인수로 전달해서 직접 동기화시키는 커스텀함수 호출 후 반환된 결과값을 state에 담아줌
      setData(checkPromiseStatus(promise));
    };
    getData();
  }, [url]);
  // state에 담아진 promise 반환 값을 리턴
  return Data;
}

export default useGetData;
