import React, { useRef, Fragment } from 'react';
import Wrapper from '../../../../components/Wrapper/Wrapper';
import styles from './styles.module.scss';
import { Row, Col, Input, Typography, Space, Tag, Spin, Image, Divider } from 'antd';
import clsx  from 'clsx';
import { Select } from 'antd';
import _ from 'lodash';
import { ReactComponent as NotFoundAddressIcon } from "../../../../assets/icons/booths/notFoundAddress.svg";
import '../styles.scss'
import BoxDistrict from '../components/BoxDistrict';
import { useGetBooth } from '../../../Booths/hooks';

import Vector from "../../../../assets/icons/Vector.svg";
import { useGetBoothProductList } from '../../hooks';
import { formatMoney } from '../../../../helpers/index';

import NoImage from "../../../../assets/images/no-image.svg";

import moment from 'moment';

const { Option } = Select;
const { Text } = Typography;

const BoothDetailSlip = ({ id }) => {

    const { data, loading } = useGetBooth({ id })

    const { data: productList, loading: loadingBoothProductList } = useGetBoothProductList({ id });

    if(loading) return <Spin  />

    return (
        <div className={clsx(styles.boothDetailContainer, "boothDetailContainer")}>
            <Row>
                <Wrapper className={styles.wrapper}>
                    <Row className={styles.rowContainer} align="middle">
                        <Col span={3} className={styles.textRight}>
                            <Text className="input-label">
                                Mã kho hàng - Biển số <span className={styles.required}>*</span>
                            </Text>
                        </Col>
                        <Col span={21}>
                            <Input
                                readOnly
                                placeholder="Thông tin số xe"
                                className={clsx(styles.input)}
                                value={_.get(data, 'name')}
                            />
                        </Col>
                    </Row>
                    <Row className={styles.rowContainer} align="middle">
                        <Col span={3} className={styles.textRight}>
                            <Text className="input-label">
                                Số xe <span className={styles.required}>*</span>
                            </Text>
                        </Col>
                        <Col span={21}>
                            <Input
                                readOnly
                                placeholder="Thông tin số xe"
                                className={clsx(styles.input)}
                                value={_.get(data, 'booth_shippers[0].shipper.license_plate')}
                            />
                        </Col>
                    </Row>
                    <Row className={styles.rowContainer} align="middle">
                        <Col span={3} className={styles.textRight}>
                            <Text className="input-label">
                                Số điện thoại <span className={styles.required}>*</span>
                            </Text>
                        </Col>
                        <Col span={21}>
                            <div className={clsx(styles.tagPhone)}>
                                <Row align="middle">
                                    <Col flex="auto">
                                        {/* {_.map(tagsPhone, (item) => (
                                            <Space size={2}>
                                            <Tag
                                                key={item.id}
                                                closable
                                                onClose={() => removeTagPhone(item)}
                                                className={clsx(style.tagPhoneItem)}
                                            >
                                                {item}
                                            </Tag>
                                            </Space>
                                        ))} */}
                                        <Space size={2}>
                                            <Tag className={styles.tagPhoneItem}>0335644678</Tag>
                                        </Space>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                    <Row className={styles.rowContainer} align="middle">
                        <Col span={3}>
                            <Text className="input-label">
                                Khu vực hỗ trợ <span style={{ color: "red" }}>*</span>
                            </Text>
                        </Col>
                        <Col span={21}>
                            <Row gutter={12}>
                                <Col flex="auto">
                                    <Select
                                        //value={province}
                                        size="large"
                                        placeholder="Chọn tỉnh thành phố"
                                        // onChange={(value) => {
                                        //     setProvince(value);
                                        //     setDistrict([]);
                                        // }}
                                        style={{ display: "block" }}
                                        disabled
                                    >
                                        <Option value={0} disabled={true}>
                                            Chọn tỉnh thành phố
                                        </Option>
                                          
                                    </Select>

                                </Col>
                         
                                <Col flex="auto">
                                    <Select
                                        mode="multiple"
                                        size="large"
                                        //value={district}
                                        placeholder="Chọn quận huyện"
                                        style={{ display: "block" }}
                                        showArrow
                                        onChange={(value) => {
                                            //addFieldSupport(value);
                                            // _.set(temp, "province", JSON.parse(province));
                                            // listOldAddress.current.push(temp);
                                            //setDistrict(value);
                                        }}
                                        disabled
                                    >
                                         <Option value={0} disabled={true}>
                                            Chọn Quận/Huyện
                                            </Option>
                                    </Select>
                                </Col>
                            </Row>
                            <Row>
                                   
                                <Col span={24}>
                                    <div
                                        className={clsx(
                                            _.isEmpty(_.get(data, 'booth_incharges')) && (styles.notFoundAddressSupport && styles.bordered), styles.supportAddress, styles.rowContainer
                                        )}
                                    >
                                        {_.isEmpty(_.get(data, 'booth_incharges')) ? (
                                            <NotFoundAddressIcon />
                                        ) : (
                                            <Row gutter={[12, 12]}>
                                                {_.get(data, 'booth_incharges').map((item, index) => {
                                                    return (
                                                      
                                                        <BoxDistrict
                                                            key={index}
                                                            data={item}
                                                        />
                                                    );
                                                })}
                                          
                                            </Row>
                                            )}
                                        </div>

                                </Col>
                            </Row>
                    
                        </Col>
                    </Row>
                </Wrapper>
                <div style={{ marginTop: '40px', width: '100%' }}>
                    <div className="createFlash">
                        <Row justify="space-between" className="headerWrapper">
                            <Typography.Title level={4}>Danh sách sản phẩm</Typography.Title>
                        </Row>
                        <div className="contentWrapper">
                        {_.isEmpty(productList) ? <div className="imgWrapper">
                                <img src={Vector} width={100} height={200}></img>
                            </div> :
                                <Fragment>
                                    {_.map(productList ?? [], (item, idx) => {
                                        return <Row key={idx}>

                                            <Col span={8}>
                                                <div className="flex align-center h-max">
                                                    <Space size={12}>
                                                        {
                                                            _.get(item, 'productPricingByProductPricing.productByProduct.photo.url') !== undefined ? <Image className="productImage" src={process.env.REACT_APP_S3_GATEWAY + _.get(item, 'productPricingByProductPricing.productByProduct.photo.url')} alt="product_image" /> : <Image src={NoImage} />
                                                        }

                                                        <div className="flex flex-column">
                                                            <Text style={{ fontSize: '20px' }}>{_.get(item, 'productPricingByProductPricing.productByProduct.name', '-')}</Text>
                                                            <Text>Giá: <Text className="red">{formatMoney(_.get(item, 'price', "-"))} đ</Text></Text>
                                                            <Text>Mã sản phẩm: {_.get(item, 'productPricingByProductPricing.productByProduct.code')}</Text>
                                                            <Text>Mã phân loại: {_.get(item, 'productPricingByProductPricing.product_sku.sku')}</Text>
                                                        </div>
                                                    </Space>
                                                </div>
                                            </Col>
                                            <Col span={3} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                <div className="align-center titleProduct">
                                                    <Text>Phân loại</Text>
                                                </div>
                                                <div className="subTitle align-center">
                                                    <Text>{_.get(item, 'productPricingByProductPricing.product_type.name', '-')}</Text>
                                                </div>
                                            </Col>
                                            <Col span={3} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                <div className="align-center titleProduct">
                                                    <Text>Hình thức</Text>

                                                </div>
                                                <div className="subTitle">
                                                    <Text>{_.get(item, 'productPricingByProductPricing.package', '-')}</Text>
                                                </div>
                                            </Col>
                                            <Col span={3} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                <div className="align-center titleProduct">
                                                    <Text>Đơn vị</Text>

                                                </div>
                                                <div className="subTitle">
                                                    <Text>{_.get(item, 'productPricingByProductPricing.productByProduct.unitByUnit.name', '-')}</Text>
                                                </div>
                                            </Col>
                                            <Col span={4} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                <div className="align-center titleProduct">
                                                    <Text>Thời gian nhập</Text>

                                                </div>
                                                <div className="subTitle">
                                                    <Text>{moment(item?.booth_order_item?.created).format("DD/MM/YYYY HH:mm")}</Text>
                                                </div>
                                            </Col>
                                            <Col span={3} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                <div className="align-center titleProduct">
                                                    <Text>Số lượng</Text>

                                                </div>
                                                <div className="subTitle">
                                                    <Text>{_.get(item, 'stock', '-')}</Text>
                                                </div>
                                            </Col>

                                            <Divider />
                                        </Row>
                                    })}

                                </Fragment>
                            }
                        </div>
                    </div>
                </div>
            </Row>
        
    
        </div>
    )
}

export default BoothDetailSlip