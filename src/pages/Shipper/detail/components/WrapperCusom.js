import React from "react";
import style from "./wrapper.module.scss";

Wrapper.propTypes = {};

function Wrapper({ children }) {
  return <div className={style.wrapper}>{children}</div>;
}

export default Wrapper;
