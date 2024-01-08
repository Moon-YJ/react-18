import News from "./components/news/News";
import Pics from "./components/pics/Pics";
import Visual from "./components/visual/Visual";
import "./global.scss";

function App() {
  return (
    <div className="App">
      <Visual />
      <News />
      <Pics />
    </div>
  );
}

export default App;
