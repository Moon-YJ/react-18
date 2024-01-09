import { useState, useTransition, useEffect, Suspense } from "react";
import News from "./components/news/News";
import Pics from "./components/pics/Pics";
import Visual from "./components/visual/Visual";
import "./global.scss";
import { flushSync } from "react-dom";
import useGetData from "./useGetData";
import Post from "./components/post/Post";

function App() {
  console.log("re-render");
  const [Count1, setCount1] = useState(0);
  const [Count2, setCount2] = useState(1);
  const [Count3, setCount3] = useState(2);
  const [Items, setItems] = useState([]);
  const [isPending, startTransition] = useTransition();

  const data = useGetData();

  // Auto Batching 테스트
  const returnPromise = () => {
    return new Promise((res) => setTimeout(res, 500));
  };
  const changeState = () => {
    // promise가 반환되는 핸들러 안쪽에서 복수개의 state가 변경되면 Batching 기능이 풀리면서 state의 개수만큼 재랜더링됨
    // 해당 기능을 개선한것이 react 18의 Automatic Batching
    returnPromise().then(() => {
      // flushSync - 특정 State값을 Auto Batching에서 제외
      flushSync(() => {
        setCount1(Count1 + 1);
      });
      setCount2(Count2 + 1);
      setCount3(Count3 + 1);
    });
  };

  // useTransition 테스트
  // 한개의 핸들러함수 안쪽에 화면의 재랜더링을 담당하는 두개의 State값
  // Count1 - 중요한 정보값이고 빠르게 연산 가능한 값이라고 가정
  // Items - 상대적으로 덜 중요한 정보값이고 연산 시간이 긴 정보값이라고 가정
  // useTransition이 없다면 덜 중요한 정보값인 Items의 연산이 끝나지 않았기 때문에 상대적으로 빠르게 처리할 수 있는 Count1값까지 화면에 늦게 출력됨
  // 따라서 사용자는 무거운 연산이 필요한 State값이 만들어질때까지 기다려야 함(갱신된 화면을 늦게 보게되는 이슈 발생)
  const handleClick = () => {
    // urgent op - 급하게 처리해야하는 중요한 연산
    setCount1(Count1 + 1);
    // not urgent op - 시간이 많이 걸리지만 우선순위가 떨어지는 덜 중요한 연산
    // 우선순위가 떨어지는 연산 구문을 startTransition의 콜백함수로 전달
    startTransition(() => {
      const arr = Array(20000)
        .fill(1)
        .map((_, idx) => Count1 + idx);
      setItems(arr);
    });
  };

  useEffect(() => {
    console.log(data);
  }, []);

  return (
    <div className="App">
      {/* Auto Batching 테스트 */}
      {/* <button onClick={changeState}>버튼</button>
      <h1>
        {Count1}, {Count2}, {Count3}
      </h1> */}

      {/* useTransition 테스트 */}
      {/* 버튼클릭할때마다 Count1값만 먼저 연산이 일어나서 부분적으로 중요한 버튼 내용 먼저 갱신 */}
      {/* 초기 로딩시 연산이 오래 걸리지 않는 콘텐츠를 미리 화면에 띄워줌 */}
      <button onClick={handleClick} disabled={isPending}>
        버튼{Count1}
      </button>
      <ul>
        {/* startTransition으로 우선순위를 뒤로 빼놓은 Items값은 조금 뒤에 연산처리 */}
        {Items.map((num) => (
          <li key={num}>{num}</li>
        ))}
      </ul>
      <Suspense fallback={<p>Loading...</p>}>
        <h1>Post List</h1>
        <Post />
      </Suspense>
      <Visual />
      <News />
      <Pics />
    </div>
  );
}

export default App;

/*
  - Automatic Batching
    : 여러개의 state가 하나의 핸들러함수 안쪽에서 동시에 변경될때 그룹으로 묶어서 한번만 랜더링 처리
    : 리액트17에서도 Batching기능이 동작되긴하지만, Promise를 반환하는 핸들러 안쪽에 여러개의 state가 변경될 경우에는 동작 안됨
*/

/*
  - useTransition
    : 컴포넌트 랜더링시 연산의 우선순위를 정해서 좀 늦게 랜더링해도 될 것들을 선별 지정
    : react 17에서는 한번 랜더링 연산이 시작되면 중간에 멈추는 것이 불가능
    : 따라서 특정 핸들러 함수에 의해서 화면을 재연산해야하는 경우, 중간에 무거운 로직이 실행되는 연산이 있다면 굳이 무거운 연산이 필요없는 컴포넌트까지 같이 지연 됨 ==> 전반적인 로딩 속도에 악영향

  - useTransition 주로 사용하는 사례 (hydration 처리할때)
    : hydration - 초기 HTML 페이지를 렌더링한 후에 클라이언트 측에서 추가적인 데이터를 가져와서 웹 페이지를 업데이트하는 프로세스(전통적인 서버 사이드 렌더링(SSR)과 클라이언트 사이드 렌더링(CSR)의 중간점에 위치하며, 더 나은 성능과 사용자 경험을 제공하기 위해 사용)
    : 굳이 데이터 fetching이 필요없는 정적인 콘텐츠를 먼저 빠르게 화면에 출력하고나서
    : 서버나 외부 API에서 불러와야되는 비동기 데이터를 나중에 선별적으로 호출할때

  - 프론트엔드 개발에 따른 화면 랜더링 연산 흐름의 변화

    - 예전 SSR(Server Side Rendering) 작업방식 (HTML, CSS, jQuery, ajax)
      1) 처음 서버로부터 HTML파일을 가져옴
      2) 추후 동적 데이터가 필요할때마다 다시 서버쪽에 요청해서 전체 화면을 Full load (화면 깜빡임, jQuery 등장 전)
      3) 이후 jQuery Ajax 기능을 사용할 수 있게 되면서 전체화면을 다시 Full load하지 않고 필요한 데이터만 실시간 호출 가능해짐
      4) 비동기 데이터를 jQuery로 일일이 동적 DOM 생성해야하는 번거로움이 생김

    - 리액트를 활용한 CSR(Client Side Rendering) 작업방식 등장 (React17까지)
      1) 빈 HTML파일을 브라우저가 서버로부터 호출
      2) 자바스크립트(리액트) 파일 로드(React)
      3) 리액트 컴포넌트 로드(useEffect에 의해서 data fetching 시작)
      4) 컴포넌트 해석 후 랜더링 시작
      5) 최종하면에 data fetching까지 적용된 동적 DOM 화면에 출력 (이때까지 사용자는 빈화면을 보게 됨)

    - 리액트18버전에서의 SSR, CSR 작업흐름
      1) 서버쪽에서 미리 static하게 프리 랜더링된 HTML 파일 가져옴
      2) 동적으로 바뀔 필요가 없는 정적인 데이터를 미리 서버쪽에서 HTML파일로 만들어서 준비해뒀다가 URL 입력시 미리 완성된 HTML파일을 전송해줌
      3) 리액트 관련 자바스크립트 파일 로드
      4) 미리 프리랜더링된 정적인 콘텐츠를 먼저 출력해둔 상태에서 동적 데이터를 다루는 컴포넌트 해석
      5) 동적 데이터가 해석되면 기존 정적 페이지에 동적 데이터를 기반으로 한 콘텐츠를 부드럽게 호출 (Hydration)

    - Next에서 작업흐름
      1) 클라이언트 컴포넌트, 서버 컴포넌트가 분리
      2) 기본적으로 모든 컴포넌트는 서버 컴포넌트로 구현됨(미리 서버쪽에서 정적인 데이터를 바탕으로해서 pre-render된 HTML파일을 바로 전달하는 방식)
      3) 미리 어느정도 데이터가 있는 형태로 우선 SSR방식으로 출력함
      4) 추후 사용자 이벤트에 의해서 동적 데이터를 가져올 확률이 있는 콘텐츠는 클라이언트 컴포넌트로 제작
*/

/*
  React18에서 Suspense를 활용한 컴포넌트 랜더링의 동기화 처리
    - 각 페이지에 구성되어있는 컴포넌트들을 동시에 호출하는 것이 아닌 영역별로 랜더링 시점을 동기화 처리
    - 이전 버전까지는 클라이언트 컴포넌트에서만 제한적으로 동작되는 기술이었지만 18버전에서부터는 SSR방식의 컴포넌트에서도 활용가능하도록 개선

    - 활용 예시: 비동기 데이터를 활용하는 컴포넌트의 경우, 비동기 데이터 fetching이 완료될때까지 해당 비동기 데이터 관련 컴포넌트의 랜더링을 시작하지 않으면서 Suspense가 Promise의 상태값을 감시
    - Promise가 fulfilled나 rejected로 상태가 전환되면 동기적으로 해당 데이터를 활용하는 컴포넌트를 랜더링
    
    - 활용 예시: 비동기 데이터의 pending 상태가 길어질때는 fallback을 통해서 정적인 UI를 대신 호출 (ex. 로딩바)

  useTransition vs Suspense의 차이
    - useTransition은 컴포넌트간의 동기화 처리가 아닌, 동시에 실행되는 비동기 방식이지만 startTransition으로 묶어놓은 연산의 우선순위가 밀리는 것 뿐
    - Suspense는 해당 컴포넌트에서 관리하는 promise객체의 상태를 실시간으로 감시하면서 pending이 끝났을때 동기적으로 컴포넌트를 호출

  Suspense 사용 조건
    - Suspense로 동기화시키는 컴포넌트 내부에 Promise객체의 상태변화를 추적할 수 있는 로직이 구현되어야함
*/
