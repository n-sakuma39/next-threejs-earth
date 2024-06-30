import ThreeCanvas from "@/components/ThreeCanvas";
import "../styles/globals.css";

const Home = () => {
  return (
    <>
      <div id="progress-bar">
        <div id="progress"></div>
      </div>
      <div id="container">
        <ThreeCanvas />
        <div id="veil"></div>
        {/* <div id="box-text" className="box-text">
          <div className="box-text-inner">
            <h1>タイトル</h1>
            <p>
              テキストテキストテキストテキストテキスト
              <br />
              テキストテキストテキストテキストテキスト
            </p>
          </div>
        </div> */}
        <div id="box-text" className="box-text">
          <div className="box-text-inner">
            <h1>SakuTech blog</h1>
            <p>
              This is webGL created by SakeTech blog.
              <br />
              Stack technology uses Next.js14 and Three.js.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
