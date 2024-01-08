import { useState } from "react";
import News from "./components/news/News";
import Pics from "./components/pics/Pics";
import Visual from "./components/visual/Visual";
import "./global.scss";
import { flushSync } from "react-dom";

function App() {
  console.log("re-render");
  const [Count1, setCount1] = useState(0);
  const [Count2, setCount2] = useState(1);
  const [Count3, setCount3] = useState(2);
  const [Items, setItems] = useState([]);

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
    setCount1(Count1 + 1);
    const arr = Array(20000)
      .fill(1)
      .map((_, idx) => Count1 + idx);
    setItems(arr);
  };

  return (
    <div className="App">
      {/* Auto Batching 테스트 */}
      {/* <button onClick={changeState}>버튼</button>
      <h1>
        {Count1}, {Count2}, {Count3}
      </h1> */}

      {/* useTransition 테스트 */}
      <button onClick={handleClick}>버튼{Count1}</button>
      <ul>
        {Items.map((num) => (
          <li key={num}>{num}</li>
        ))}
      </ul>
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
*/
