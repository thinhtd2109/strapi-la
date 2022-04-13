import _ from "lodash";
import React from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { Card, Row, Col, Typography } from "antd";
import NoImage from "../assets/images/no-image.svg";
import Fire from "../assets/icons/card/fire.svg";
import Star from "../assets/icons/card/star.svg";
import clsx from "clsx";
import style from "./style.module.scss";
import { formatMoney } from "../helpers";

const CardProduct = ({ product }) => {
  const history = useHistory();

  const handleProductDetail = () => {
    history.push("/product/detail/" + _.get(product, "id"));
  };

  return (
    <Card
      className={style.styleCardProduct}
      hoverable
      size="small"
      cover={
        <img
          style={{ width: "100%" }}
          src={
            _.get(product, "medium.url")
              ? process.env.REACT_APP_S3_GATEWAY + _.get(product, "medium.url")
              : NoImage
          }
          alt={_.get(product, "medium.alt")}
        />
      }
      onClick={handleProductDetail}
    >
      {_.includes(["HOT", "NEW"], _.get(product, "product_status.code")) && (
        <div
          className={clsx(
            style.styleStatus,
            _.get(product, "product_status.code") === "NEW"
              ? style.styleStatusNew
              : style.styleStatusHot,
            _.toLower(_.get(product, "product_status.code"))
          )}
        >
          {_.get(product, "product_status.code") === "NEW" ? (
            <img src={Star} alt="logo pinnow" width={8} height={12} />
          ) : (
            <img src={Fire} alt="logo pinnow" width={8} height={12} />
          )}
          {_.get(product, "product_status.name")}
        </div>
      )}
      <Row justify="space-between" className={clsx(style.itemRow, style.mode2)}>
        <Col>
          <Typography.Text strong>{_.get(product, "name")}</Typography.Text>
        </Col>
        <Col>
          <Typography.Text type="secondary">
            {_.get(product, "categoryByCategory.name")}
          </Typography.Text>
        </Col>
      </Row>
      <Row className={style.itemRow}>
        <Typography.Text type="danger" className={style.styleRetailPrice}>
          {`${formatMoney(_.get(product, "price"))} đ`}
        </Typography.Text>
      </Row>
      <Row className={style.itemRow}>
        <Typography.Text type="warning" className={style.styleSalePrice}>
          {`${formatMoney(_.get(product, "wholesale_price"))} đ`}
        </Typography.Text>
      </Row>
    </Card>
  );
};

export default CardProduct;

CardProduct.propTypes = {
  product: PropTypes.object,
};
