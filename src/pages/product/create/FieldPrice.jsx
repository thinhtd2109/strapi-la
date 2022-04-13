import React from 'react'
import { Row, Col, Form, Input, Button, InputNumber, Radio, Spin } from 'antd';
import './style.scss';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

import style from '../style.module.scss';
import _ from 'lodash';
import { useQuery } from '@apollo/client';
import { GET_APP_CONFIG } from '../../../graphql/schemas/order/query';
import { GET_WHOLESALE } from '../../../graphql/schemas/product/query';

const FieldPrice = ({ form, field, fields, remove, addField }) => {
    const currencyFormatter = selectedCurrOpt => value => {
        return new Intl.NumberFormat().format(value);
    };

    const { data, loading } = useQuery(GET_WHOLESALE, {});
    if (loading) return <div className="wapperLoading"><Spin tip="Đang tải dữ liệu..." /></div>
    return (
        <div className={field.key === fields.length - 1 ? "w-max h-max flex flex-column container" : "w-max h-max flex flex-column container border-bottom"}>
            <Col span={24}>
                <Row gutter={[16, 0]}>
                    <Col span={24}>
                        <Form.Item name={[field.name, 'active']}>
                            <Radio.Group value='true'>
                                <Radio value='false' className={style.styleRadio}>Ẩn</Radio>
                                <Radio value='true'>Hiện</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item shouldUpdate={true}>
                            {
                                () => (
                                    <Form.Item
                                        rules={[{ required: true, message: 'Phân loại không được để trống' }]}
                                        name={[field.name, 'product_type']}
                                        style={{ paddingRight: 5 }}
                                        label={<span style={{ color: '#748CAD' }}>Phân loại</span>}
                                    >
                                        <Input disabled={form?.getFieldValue('product_pricings')[field.key]?.active === 'false' ? true : false} />
                                    </Form.Item>
                                )
                            }
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item shouldUpdate={true}>
                            {
                                () => (
                                    <Form.Item
                                        label={<span style={{ color: '#748CAD' }}>Mã phân loại</span>}
                                        name={[field.name, 'product_sku']}
                                        style={{ paddingRight: 5 }}
                                    >
                                        <Input
                                            disabled={form?.getFieldValue('product_pricings')[field.key]?.active === 'false' ? true : false}
                                        />
                                    </Form.Item>
                                )
                            }
                        </Form.Item>
                    </Col>

                    {
                        (_.size(fields) > 1) && (
                            <Col span={4}>
                                <Button
                                    className={style.styleButtonPricingsDelete}
                                    onClick={() => remove(field.name)}
                                ><MinusOutlined /> Xoá</Button>
                            </Col>
                        )
                    }
                </Row>

                <Row>
                    <div className="w-max inputItem">
                        <p style={{ color: '#748CAD' }}><span style={{ color: '#EF4036' }}>*</span> Hình thức </p>
                    </div>
                    <div className="w-max inputItem">
                        <span style={{ color: '#748CAD' }}> <span style={{ color: '#EF4036' }}>*</span> Giá lẻ </span>
                    </div>
                    <div className="w-max inputItem">
                        <span style={{ color: '#748CAD' }}><span style={{ color: '#EF4036' }}>*</span> Giá sỉ </span>
                    </div>
                    {
                        _.lowerCase(_.get(data, 'appconfig[0].value')) === 'false' ? null : <div className="w-max inputItem">
                            <span style={{ color: '#748CAD' }}><span style={{ color: '#EF4036' }}>*</span> Số lượng đạt sỉ </span>
                        </div>
                    }


                </Row>

                <Row>
                    <Form.List name={[field.name, 'type_price']}>
                        {(types, { add, remove }) => (
                            <>
                                {types.map(type => (
                                    <div className="w-max h-max flex" key={type.key}>
                                        <div className="w-max inputItem">
                                            <Form.Item shouldUpdate={true}>
                                                {
                                                    () => (
                                                        <Form.Item
                                                            {...type}
                                                            name={[type.name, 'package']}

                                                            fieldKey={[type.fieldKey, 'package']}
                                                            rules={[{ required: true, message: 'Hình thức không được để trống' }]}
                                                        >
                                                            <Input
                                                                style={{ width: '100%' }} placeholder="Nhập thông tin"
                                                                disabled={form?.getFieldValue('product_pricings')[field.key]?.active === 'false' ? true : false}
                                                            />
                                                        </Form.Item>
                                                    )
                                                }
                                            </Form.Item>
                                        </div>
                                        <div className="w-max inputItem">
                                            <Form.Item shouldUpdate={true}>
                                                {
                                                    () => (
                                                        <Form.Item
                                                            {...type}
                                                            name={[type.name, 'price']}
                                                            fieldKey={[type.fieldKey, 'price']}
                                                            rules={[{ required: true, message: 'Giá không được để trống' }]}
                                                        >
                                                            <InputNumber
                                                                addonAfter="đ"
                                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                style={{ width: '100%' }}
                                                                placeholder="Nhập thông tin"
                                                                disabled={form?.getFieldValue('product_pricings')[field.key]?.active === 'false' ? true : false}
                                                            />
                                                        </Form.Item>
                                                    )
                                                }
                                            </Form.Item>
                                        </div>
                                        <div className="w-max inputItem">
                                            <Form.Item shouldUpdate={true}>
                                                {
                                                    () => (
                                                        <Form.Item
                                                            {...type}
                                                            name={[type.name, 'wholesale_price']}
                                                            fieldKey={[type.fieldKey, 'wholesale_price']}
                                                            rules={[{ required: true, message: 'Giá sỉ không được để trống' }]}
                                                        >
                                                            <InputNumber
                                                                addonAfter="đ"
                                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                style={{ width: '100%' }}
                                                                placeholder='Nhập thông tin'
                                                                disabled={form?.getFieldValue('product_pricings')[field.key]?.active === 'false' ? true : false}
                                                            />
                                                        </Form.Item>
                                                    )
                                                }
                                            </Form.Item>
                                        </div>

                                        {
                                            _.lowerCase(_.get(data, 'appconfig[0].value')) === 'false' ? null :

                                                <div className="w-max inputItem">
                                                    <Form.Item shouldUpdate={true}>
                                                        {
                                                            () => (
                                                                <Form.Item
                                                                    {...type}
                                                                    name={[type.name, 'wholesale_quantity']}
                                                                    fieldKey={[type.fieldKey, 'wholesale_quantity']}
                                                                    rules={[{ required: true, message: 'Số lượng sỉ không được để trống' }]}
                                                                >
                                                                    <InputNumber
                                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                        style={{ width: '100%' }}
                                                                        placeholder='Nhập thông tin'
                                                                        disabled={form?.getFieldValue('product_pricings')[field.key]?.active === 'false' ? true : false}
                                                                    />
                                                                </Form.Item>
                                                            )
                                                        }
                                                    </Form.Item>
                                                </div>
                                        }

                                        <div className="w-max inputItem">
                                            <Form.Item>
                                                <div className={style.GroupButtonPrices}>
                                                    {
                                                        (_.get(type, 'key') !== _.get(_.first(types), 'key') || _.size(types) > 1) && (
                                                            <Button
                                                                className={style.styleButtonPriceDelete}
                                                                icon={<MinusOutlined />}
                                                                onClick={() => remove(type.name)}
                                                            />
                                                        )
                                                    }
                                                    {
                                                        _.get(type, 'key') === _.get(_.last(types), 'key') && (
                                                            <Button
                                                                className={style.styleButtonPriceAdd}
                                                                icon={<PlusOutlined />}
                                                                onClick={() => add()}
                                                            />
                                                        )
                                                    }
                                                </div>
                                            </Form.Item>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </Form.List>
                </Row>
            </Col>
        </div>
    )
}

export default FieldPrice
