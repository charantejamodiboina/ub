
import Header from "./Header";
import Intro from "./Intro";

import styles from "./style.module.css";
export default function HomePage() {
  return (
    <div className={styles.sharedBackground}>
      
      <div>
        <Intro/>
      </div>
    </div>
  );
}