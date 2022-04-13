import _ from "lodash";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Input, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import style from "./style.module.scss";

const SearchContent = ({ searchContent, setSearchContent, width }) => {
  const [inputValue, setInputValue] = useState(searchContent);

  const onchangeAction = (e) => {
    setInputValue(_.get(e, "target.value"));
  };

  const onBlurSetValue = () => {
    const value = _.trim(inputValue);
    if (searchContent === value) return;
    if (_.isEmpty(value) && inputValue === undefined) return;

    if (_.isFunction(setSearchContent)) setSearchContent(value);
  };

  const onKeyPress = (e) => {
    if (e.key === "Enter" || e.charCode === 13) {
      onBlurSetValue();
    }
    return;
  };

  useEffect(() => {
    setInputValue(searchContent);
  }, [searchContent]);

  return (
    <Col>
      <Input
        style={{ height: 38, width }}
        className={style.styleInput}
        placeholder="Tìm kiếm..."
        prefix={<SearchOutlined className="site-form-item-icon" />}
        value={inputValue}
        id={"input-search-content"}
        onBlur={onBlurSetValue}
        onChange={onchangeAction}
        onKeyPress={onKeyPress}
        autoComplete="off"
      />
    </Col>
  );
};

SearchContent.propTypes = {
  searchContent: PropTypes.string,
  setSearchContent: PropTypes.func,
};

SearchContent.defaultProps = {
  searchContent: "",
};

export default SearchContent;
