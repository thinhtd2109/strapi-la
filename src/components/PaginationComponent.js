import _ from "lodash";
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Select, Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { scrollTop } from "../helpers";
import { useHistory } from "react-router-dom";

import style from "./style.module.scss";

const { Option } = Select;

const PaginationComponent = ({
  total = 0,
  pageSize,
  pageIndex,
  pageSizeOptions,
  setPageSize,
  setPageIndex,
  pagename,

}) => {
  // const scrollTop = () => {
  //     document.body.scrollTop = 100;
  //     document.documentElement.scrollTop = 100;
  // }
  const history = useHistory();
  const handleChangePageSize = (value) => {
    setPageSize(value);
    setPageIndex(1);
  };

  const handleClickNext = () => {
    setPageIndex(pageIndex + 1);
    // localStorage.setItem('paging', JSON.stringify({ pagename: pagename, pageIndex: pageIndex + 1, pageSize: pageSize }));
    scrollTop(200);
  };

  const handleClickPrev = () => {
    setPageIndex(pageIndex - 1);
    localStorage.setItem('paging', JSON.stringify({ pagename: pagename, pageIndex: pageIndex - 1, pageSize: pageSize }));
    scrollTop(200);
  };

  useEffect(() => {
    if (_.get(JSON.parse(localStorage.getItem('paging')), 'pagename') !== pagename) {
      localStorage.removeItem('paging');
    }
  }, []);

  return (
    <div className={style.stylePagination}>
      <div>Hiển thị</div>
      <div>
        <Select
          className={style.styleSelect}
          defaultValue={pageSize}
          value={pageSize}
          onChange={handleChangePageSize}
        >
          {_.map(pageSizeOptions, (item, key) => (
            <Option key={key} value={item}>
              {item}
            </Option>
          ))}
        </Select>
      </div>
      <div>{`${pageSize * (pageIndex - 1) + 1} - ${total < pageIndex * pageSize ? total : pageIndex * pageSize
        } of ${total}`}</div>
      <Button
        className={style.styleButton}
        disabled={pageIndex === 1}
        onClick={handleClickPrev}
      >
        <LeftOutlined className="site-form-item-icon" />
      </Button>
      <Button
        className={style.styleButton}
        disabled={total <= pageIndex * pageSize}
        onClick={handleClickNext}
      >
        <RightOutlined className="site-form-item-icon" />
      </Button>
    </div>
  );
};

PaginationComponent.propTypes = {
  pageSize: PropTypes.number,
  pageIndex: PropTypes.number,
  pageSizeOptions: PropTypes.array,
  setPageSize: PropTypes.func,
  setPageIndex: PropTypes.func,
};

PaginationComponent.defaultProps = {
  pageSize: 20,
  pageIndex: 1,
  pageSizeOptions: [20, 40, 80, 120],
};

export default PaginationComponent;
