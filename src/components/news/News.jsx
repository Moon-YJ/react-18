import { useEffect, useRef } from "react";
import "./News.scss";

export default function News() {
  const thisEl = useRef(null);
  const boxEl = useRef(null);
  useEffect(() => {
    window.addEventListener("scroll", () => {
      const currentPos = thisEl.current.offsetTop;
      const scroll = window.scrollY;
      const modifiedScroll = scroll - currentPos;
      if (modifiedScroll >= 0) {
        boxEl.current.style.transform = `rotate(${modifiedScroll}deg)`;
      } else {
        boxEl.current.style.transform = "rotate(0deg)";
      }
    });
  }, []);
  return (
    <div className="News" ref={thisEl}>
      <div className="box" ref={boxEl}></div>
    </div>
  );
}
