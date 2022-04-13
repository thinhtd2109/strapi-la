import _ from "lodash";
import React, { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useHistory, useParams } from "react-router-dom";
import Wrapper from "../../components/Wrapper/Wrapper";
import {
  Grid,
  Row,
  Col,
  Typography,
  Divider,
  Button,
  Select,
  Spin,
  Space,
  Image,
  Checkbox,
} from "antd";
import NoImage from "../../assets/images/no-image.svg";
import style from "./style.module.scss";
import clsx from "clsx";

import { formatMoney, scrollTop } from "../../helpers";
import {
  useDeteleProduct,
  useGetProductDetail,
} from "../../graphql/schemas/hook";
import DeleteModal from "../../components/Modal/DeleteModal";

const { useBreakpoint } = Grid;
const { Option } = Select;
const { REACT_APP_S3_GATEWAY } = process.env;

const ProductDetail = () => {
  const { id: productId } = useParams();
  const userInfor = JSON.parse(localStorage.getItem("userInfo"));

  const history = useHistory();
  const screens = useBreakpoint();

  const { data, loading, refetch } = useGetProductDetail(productId);

  const [deleteModal, setDeleteModal] = useState(false);
  const [productType, setProductType] = useState(null);
  const [packagePcsType, setPackagePcsType] = useState(null);
  const [productPricingsSelect, setProductPricingsSelect] = useState(null);
  const [classify, setClassify] = useState(null);
  const [packagePcs, setPackagePcs] = useState(null);

  const { actionDelete, loading: loadingDelete } = useDeteleProduct();

  useEffect(() => {
    const headItem = _.head(_.get(data, "product_pricings"));
    const arr = _.map(
      _.groupBy(_.get(data, "product_pricings"), function (Obj) {
        return _.get(Obj, "product_type.name");
      }),
      (item, key) => _.get(_.head(item), "product_type")
    );
    setProductType(arr);
    setProductPricingsSelect(headItem);
    setClassify(_.get(headItem, "product_type.id"));
    setPackagePcsType(
      _.filter(data?.product_pricings, [
        "product_type.id",
        _.get(headItem, "product_type.id"),
      ])
    );
    setPackagePcs(_.get(data, "product_pricings[0].package"));
  }, [data]);

  const handleEditProduct = () => {
    history.push("/product/edit/" + _.get(data, "id"));
  };

  const handleDeleteProduct = () => {
    actionDelete({
      variables: {
        id: productId,
        updated_by: _.get(userInfor, "id"),
      },
    });

    handleReturn();
  };

  const handleReturn = () => {
    window.history.back();
  };

  const handleChangeClassify = (value) => {
    setClassify(value);
    setPackagePcs(
      _.get(
        _.find(_.get(data, "product_pricings"), ["product_type.id", value]),
        "package"
      )
    );
    setProductPricingsSelect(
      _.find(_.get(data, "product_pricings"), ["product_type.id", value])
    );
    setPackagePcsType(
      _.filter(data?.product_pricings, ["product_type.id", value])
    );
  };

  const handleChangePackagePcs = (value) => {
    setPackagePcs(value);
    setProductPricingsSelect(_.find(packagePcsType, ["package", value]));
  };

  useEffect(() => {
    scrollTop();
    refetch();
  }, []);

  if (loading || loadingDelete)
    return (
      <div className={style.wapperLoading}>
        <Spin tip="Đang tải dữ liệu..." />
      </div>
    );

  return (
    <Fragment>
      <DeleteModal
        type="DELETE"
        onDelete={handleDeleteProduct}
        visible={deleteModal}
        onCancel={() => setDeleteModal(false)}
      />

      <Row justify="space-between">
        <Typography.Title level={3}>Chi tiết sản phẩm</Typography.Title>

        <Row justify="end">
          <Checkbox
            checked={_.get(data, "only_booth")}
            disabled
            style={{ marginRight: 6 }}
          />
          <Typography>
            Chỉ hiện ở{" "}
            <span style={{ fontWeight: "bold" }}>kho hàng lưu động</span>
          </Typography>
        </Row>
      </Row>

      <Wrapper>
        <Row>
          <Typography.Text
            className={style.styleSection}
          >{`Thông tin chung ${_.get(data, "code")}`}</Typography.Text>
        </Row>

        <Divider className={style.styleDivider} />

        <Row
          gutter={[32, 32]}
          className={clsx(
            _.includes(
              [screens?.md, screens?.lg, screens?.xl, screens?.xxl],
              true
            ) && style.resetMaginRight
          )}
        >
          <Col className="gutter-row" md={{ span: 8 }}>
            <Image
              className={style.styleWrapperImage}
              src={
                _.get(data, "medium.url")
                  ? REACT_APP_S3_GATEWAY + _.get(data, "medium.url")
                  : NoImage
              }
              alt={_.get(data, "name")}
              style={{ width: "100%" }}
            />
          </Col>

          <Col className="gutter-row" md={{ span: 16 }}>
            <Row gutter={[16, 24]}>
              <Col className="gutter-row" span={24}>
                <Row gutter={[16, 8]}>
                  <Col className="gutter-row" span={24}>
                    <Typography.Text className={style.styleLabelContent}>
                      Tên sản phẩm
                    </Typography.Text>
                  </Col>
                  <Col
                    className={clsx("gutter-row", style.styleValueContent)}
                    span={24}
                  >
                    <Typography.Text>{_.get(data, "name")}</Typography.Text>
                  </Col>
                </Row>
              </Col>
              {/* 
                            <Col className="gutter-row" span={24}>
                                <Row gutter={[16, 8]}>
                                    <Col className="gutter-row" span={24}>
                                        <Typography.Text className={style.styleLabelContent}>Trạng thái sản phẩm</Typography.Text>
                                    </Col>
                                    <Col className={clsx("gutter-row", style.styleValueContent)} span={24}>
                                        <Typography.Text>{_.get(data, 'product_status.name')}</Typography.Text>
                                    </Col>
                                </Row>
                            </Col> 
                            */}

              <Col className="gutter-row" xs={{ span: 24 }} sm={{ span: 11 }}>
                <Row gutter={[16, 8]}>
                  <Col className="gutter-row" span={24}>
                    <Typography.Text className={style.styleLabelContent}>
                      Loại sản phẩm
                    </Typography.Text>
                  </Col>
                  <Col
                    className={clsx("gutter-row", style.styleValueContent)}
                    span={24}
                  >
                    <Typography.Text>
                      {_.get(data, "categoryByCategory.name")}
                    </Typography.Text>
                  </Col>
                </Row>
              </Col>
              <Col
                className="gutter-row"
                xs={{ span: 24 }}
                sm={{ span: 11, offset: 2 }}
              >
                <Row gutter={[16, 8]}>
                  <Col className="gutter-row" span={24}>
                    <Typography.Text className={style.styleLabelContent}>
                      Đơn vị
                    </Typography.Text>
                  </Col>
                  <Col
                    className={clsx("gutter-row", style.styleValueContent)}
                    span={24}
                  >
                    <Typography.Text>
                      {_.get(data, "unitByUnit.name")}
                    </Typography.Text>
                  </Col>
                </Row>
              </Col>
              <Col className="gutter-row" span={24}>
                <Row gutter={[16, 8]}>
                  <Col className="gutter-row" span={24}>
                    <Typography.Text className={style.styleLabelContent}>
                      Trạng thái sản phẩm
                    </Typography.Text>
                  </Col>
                  <Col
                    className={clsx("gutter-row", style.styleValueContent)}
                    span={24}
                  >
                    <Typography.Text>
                      {_.get(data, "product_status.name")}
                    </Typography.Text>
                  </Col>
                </Row>
              </Col>

              <Col className="gutter-row" span={24}>
                <Row gutter={[16, 8]}>
                  <Col className="gutter-row" span={24}>
                    <Typography.Text className={style.styleLabelContent}>
                      Phân loại
                    </Typography.Text>
                  </Col>
                  <Col
                    className={clsx("gutter-row", style.styleValueContent)}
                    span={24}
                  >
                    <Select
                      style={{ width: "100%" }}
                      className={style.styleSelect}
                      bordered={false}
                      value={
                        classify ||
                        _.get(
                          _.head(_.get(data, "product_pricings")),
                          "product_type.id"
                        )
                      }
                      onChange={handleChangeClassify}
                    >
                      {_.map(productType, (item, key) => (
                        <Option key={key} value={_.get(item, "id")}>
                          {_.get(item, "name")}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
              </Col>

              <Col className="gutter-row" span={24}>
                <Row gutter={[16, 8]}>
                  <Col className="gutter-row" span={24}>
                    <Typography.Text className={style.styleLabelContent}>
                      Gói
                    </Typography.Text>
                  </Col>
                  <Col
                    className={clsx("gutter-row", style.styleValueContent)}
                    span={24}
                  >
                    <Select
                      style={{ width: "100%" }}
                      className={style.styleSelect}
                      bordered={false}
                      value={
                        packagePcs ||
                        _.get(
                          _.head(_.get(data, "product_pricings")),
                          "package"
                        )
                      }
                      onChange={handleChangePackagePcs}
                    >
                      {_.map(packagePcsType, (item, key) => (
                        <Option key={key} value={_.get(item, "package")}>
                          {_.get(item, "package")}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
              </Col>

              <Col className="gutter-row" span={24}>
                <Row gutter={[16, 8]}>
                  <Col className="gutter-row" span={24}>
                    <Typography.Text className={style.styleLabelContent}>
                      Giá lẻ
                    </Typography.Text>
                  </Col>
                  <Col
                    className={clsx("gutter-row", style.styleValueContent)}
                    span={24}
                  >
                    <Typography.Text>
                      {`${formatMoney(
                        _.get(productPricingsSelect, "price")
                      )} đ`}
                    </Typography.Text>
                  </Col>
                </Row>
              </Col>

              <Col className="gutter-row" span={24}>
                <Row gutter={[16, 8]}>
                  <Col className="gutter-row" span={24}>
                    <Typography.Text className={style.styleLabelContent}>
                      Giá sỉ
                    </Typography.Text>
                  </Col>
                  <Col
                    className={clsx("gutter-row", style.styleValueContent)}
                    span={24}
                  >
                    <Typography.Text>
                      {`${formatMoney(
                        _.get(productPricingsSelect, "wholesale_price")
                      )} đ`}
                    </Typography.Text>
                  </Col>
                </Row>
              </Col>
              <Col className="gutter-row" span={24}>
                <Row gutter={[16, 8]}>
                  <Col className="gutter-row" span={24}>
                    <Typography.Text className={style.styleLabelContent}>
                      Số lượng đạt sỉ
                    </Typography.Text>
                  </Col>
                  <Col
                    className={clsx("gutter-row", style.styleValueContent)}
                    span={24}
                  >
                    <Typography.Text>
                      {_.get(data, "wholesale_quantity")}
                    </Typography.Text>
                  </Col>
                </Row>
              </Col>
              <Col className="gutter-row" span={24}>
                <Row gutter={[16, 8]}>
                  <Col className="gutter-row" span={24}>
                    <Typography.Text className={style.styleLabelContent}>
                      Mô tả
                    </Typography.Text>
                  </Col>
                  <Col
                    className={clsx("gutter-row", style.styleValueContent)}
                    span={24}
                  >
                    <Typography.Text>
                      {_.get(data, "description")}
                    </Typography.Text>
                  </Col>
                </Row>
              </Col>

              <Row
                gutter={[16, 16]}
                className={clsx(
                  style.styleGroupButton,
                  !screens?.lg && style.fixButtonGroup
                )}
              >
                <Space size={24} className={style.styleGroupButton}>
                  <Button
                    htmlType="button"
                    className={style.styleEditButton}
                    onClick={handleEditProduct}
                  >
                    Sửa thông tin
                  </Button>
                  <Button
                    htmlType="button"
                    className={style.styleCreateButton}
                    onClick={() => setDeleteModal(true)}
                  >
                    Xóa
                  </Button>
                </Space>
              </Row>
            </Row>
          </Col>
        </Row>
      </Wrapper>
    </Fragment>
  );
};

ProductDetail.propTypes = {
  data: PropTypes.object,
};

export default ProductDetail;
