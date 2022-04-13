import _, { values } from 'lodash';
import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Wrapper from '../../components/Wrapper/Wrapper';
import { Grid, Row, Col, Typography, Divider, Button, Form, Input, Select, Space, Spin, InputNumber, Radio, Checkbox } from 'antd';

import { scrollTop } from '../../helpers';
import axios from 'axios';
import style from './style.module.scss';
import clsx from 'clsx';
import NoImage from '../../assets/images/no-image.svg';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { ReactComponent as IconCapturePhoto } from '../../assets/icons/capture-photo.svg';
import {
    useGetProductDetail, useGetProductStatus, useGetCategories, useGetUnitList, useUpdateProduct
} from '../../graphql/schemas/hook';
import { useParams } from 'react-router-dom';
import SuccessModal from '../../components/Modal/SuccessModal';
import { notification } from 'antd';
import { GET_WHOLESALE } from '../../graphql/schemas/product/query';
import { useQuery } from '@apollo/client';

const { useBreakpoint } = Grid;

const { Option } = Select;

const ProductEdit = () => {
    const { id: productId } = useParams();

    const { REACT_APP_BASEURL_UPLOAD, REACT_APP_S3_GATEWAY } = process.env;
    const screens = useBreakpoint();
    const [form] = Form.useForm();
    const { data: dataConfig, loading: loadingConfig } = useQuery(GET_WHOLESALE, {});
    const [draft, setDraft] = useState({});
    const [thumbProduct, setThumbProduct] = useState({});
    const [successModal, setSuccessModal] = useState(false);
    const { data, loading } = useGetProductDetail(productId);
    const { data: dataStatusProduct } = useGetProductStatus();
    const { data: dataCategories } = useGetCategories();
    const { data: dataUnits } = useGetUnitList();
    const [exportDataUnits, setExportDataUnits] = useState();
    const { actionUpdate } = useUpdateProduct(setSuccessModal);

    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const handleReturn = () => {
        window.history.back();
    };

    const handleUploadImage = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("media_type_code", "PHOTO")
        try {
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
            await axios.post(REACT_APP_BASEURL_UPLOAD, formData, config).then((data) => {
                setThumbProduct(_.get(data, 'data[0]'))
            }).catch(err => {
                console.info("error", err)
            })
        } catch (error) {
            console.log(error);
        }
    }

    const onFinished = (values) => {
        let productPriceList = [];
        let count = 0;
        setLoadingSubmit(true)
        for (let i = 0; i < values.product_pricings.length; i++) {
            for (let j = 0; j < values.product_pricings[i].type_price.length; j++) {
                productPriceList.push({
                    active: values.product_pricings[i].active === 'false' ? false : true,
                    id: values.product_pricings[i].type_price[j].id,
                    index: count++,
                    package: values.product_pricings[i].type_price[j].package,
                    price: Number(values.product_pricings[i].type_price[j].price),
                    wholesale_price: Number(values.product_pricings[i].type_price[j].wholesale_price),
                    wholesale_quantity: Number(values.product_pricings[i].type_price[j].wholesale_quantity),
                    product_type: {
                        // id: values.product_pricings[i].id,
                        name: values.product_pricings[i].product_type
                    },
                    product_sku: {
                        sku: values.product_pricings[i].product_sku || ""
                    }
                })
            }
        };

        if (productPriceList.length > 0) {
            for (let i = 0; i < productPriceList.length; i++) {
                if (productPriceList[i].wholesale_price < 0) {
                    return notification['error']({
                        message: "Chỉnh sửa sản phẩm",
                        description: "Giá sỉ không được bé hơn 0"
                    })
                }
                if (productPriceList[i].price < 0) {
                    return notification['error']({
                        message: "Chỉnh sửa sản phẩm",
                        description: "Giá không được bé hơn 0"
                    })
                }
                if (productPriceList[i].wholesale_price > productPriceList[i].price) {
                    return notification['error']({
                        message: "Chỉnh sửa sản phẩm",
                        description: "Giá sỉ không được lớn hơn giá lẻ"
                    })
                }
            }
        }

        if (Number(values.wholesale_price) > Number(values.price)) {
            return notification['error']({
                message: "Chỉnh sửa sản phẩm",
                description: "Giá sỉ không được lớn hơn giá lẻ"
            })
        }

        if (Number(values.price) < 0) {
            return notification['error']({
                message: "Chỉnh sửa sản phẩm",
                description: "Giá không được bé hơn 0"
            })
        }

        if (Number(values.wholesale_price) < 0) {
            return notification['error']({
                message: "Chỉnh sửa sản phẩm",
                description: "Giá sỉ không được bé hơn 0"
            })
        }

        if (Number(values.wholesale_quantity) < 0) {
            return notification['error']({
                message: "Chỉnh sửa sản phẩm",
                description: "Số lượng đạt sỉ không được bé hơn 0"
            })
        }

        actionUpdate({
            variables: {
                data: {
                    id: productId,
                    category: values.category,
                    name: values.name,
                    price: Number(values.price),
                    wholesale_price: Number(values.wholesale_price),
                    unit: values.unit,
                    description: values.description,
                    photo: thumbProduct?.id,
                    status: values.status,
                    wholesale_quantity: _.isNull(values.wholesale_quantity) ? 0 : values.wholesale_quantity,
                    product_pricings: productPriceList,
                    only_booth: _.get(values, 'only_booth')
                }
            }
        }).then(() => setLoadingSubmit(false));
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    useEffect(() => {
        scrollTop();
    }, []);

    useEffect(() => {
        let temp = { ...data };
        if (temp?.categoryByCategory) {
            _.set(temp, 'category', _.get(data, 'categoryByCategory.id'));
            delete temp.categoryByCategory;
        };
        if (temp?.product_status) {
            _.set(temp, 'status', _.get(data, 'product_status.id'));
            delete temp.product_status;
        };
        if (temp?.unitByUnit) {
            _.set(temp, 'unit', _.get(data, 'unitByUnit.id'));
            delete temp.unitByUnit;
        };
        if(temp?.only_booth) {
          _.set(temp, 'only_booth', _.get(data, 'only_booth'));
          delete temp.only_booth
        }
        if (data?.product_pricings) {
            delete temp.product_pricings;

            _.map(_.chain(data?.product_pricings).groupBy("product_type.name").map((value, key) => ({ key: key, data: value })).value(), (item, key) => {
                _.set(temp, `product_pricings[${key}].id`, _.get(_.find(_.get(data, 'product_pricings'), ['product_type.name', item?.key]), 'product_type.id'));
                _.set(temp, `product_pricings[${key}].product_type`, _.get(item, 'key'));
                _.set(temp, `product_pricings[${key}].type_price`, _.get(item, 'data'));
                _.set(temp, `product_pricings[${key}].active`, _.toString(_.get(item, 'data[0].active')));
                _.set(temp, `product_pricings[${key}].product_sku`, _.get(item, 'data[0].product_sku.sku'));
            })
        };

        setDraft(temp);

    }, [data])

    useEffect(() => {
        if (dataUnits) {
            const unitByUnit = _.get(_.find(dataCategories, ['id', _.get(data, 'categoryByCategory.id')]), 'category_units');
            const tmp = _.map(unitByUnit, item => ({ id: _.get(item, 'unitByUnit.id'), name: _.get(item, 'unitByUnit.name') }))
            setExportDataUnits(tmp);
        }
    }, [dataUnits, data]);

    if (loading || _.isEmpty(draft) || loadingConfig) return <div className={style.wapperLoading}><Spin tip="Đang tải dữ liệu..." /></div>

    const filterDataUnits = (values) => {
        if (_.get(values, 'category')) {
            const unitByUnit = _.get(_.find(dataCategories, ['id', _.get(values, 'category')]), 'category_units');
            const tmp = _.map(unitByUnit, item => ({ id: _.get(item, 'unitByUnit.id'), name: _.get(item, 'unitByUnit.name') }))
            setExportDataUnits(tmp);
        };
    }

    return (
        <Form
            className={clsx(style.styleForm, 'w-max')}
            name="edit_data_form"
            initialValues={draft}
            onFinishFailed={onFinishFailed} onFinish={onFinished} onValuesChange={filterDataUnits}
            layout="vertical"
            form={form}
        >
            <SuccessModal onSuccess={handleReturn} visible={successModal} title="Thành công" content="Chỉnh sửa thông tin sản phẩm thành công" />

            <Row justify='space-between'>
                <Typography.Title level={3}>Chỉnh sửa thông tin sản phẩm</Typography.Title>
                <Form.Item name="only_booth" valuePropName="checked">
                    <Row justify='end'>
                        <Checkbox defaultChecked={_.get(data, 'only_booth')} style={{ marginRight: 6 }} />
                        <Typography>Chỉ hiện ở <span style={{ fontWeight: 'bold' }}>kho hàng lưu động</span></Typography>
                    </Row>
                    
                </Form.Item>
            </Row>

            <Wrapper>
                <Row>
                    <Typography.Text className={style.styleSection}>{`Thông tin chung ${_.get(data, 'code')}`}</Typography.Text>
                </Row>

                <Divider className={style.styleDivider} />

                <Row gutter={[32, 32]} className={clsx(_.includes([screens?.md, screens?.lg, screens?.xl, screens?.xxl], true) && style.resetMaginRight)}>
                    <Col className="gutter-row" md={{ span: 8 }}>
                        <img
                            className={style.styleWrapperImage}
                            src={_.get(thumbProduct, 'url') ? REACT_APP_S3_GATEWAY + _.get(thumbProduct, 'url') : _.get(draft, 'medium.url') ? REACT_APP_S3_GATEWAY + _.get(draft, 'medium.url') : NoImage}
                            alt={_.get(draft, 'name')}
                            style={{ width: '100%' }}
                        />

                        <input
                            accept="image/*"
                            id="upload-thumb-product"
                            // multiple
                            type="file"
                            hidden
                            onChange={handleUploadImage}
                        />
                        <label htmlFor="upload-thumb-product">
                            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                                <div className={clsx(style.UploadButton)}>
                                    <IconCapturePhoto />
                                    <span>Tải hình ảnh</span>
                                </div>
                            </div>
                        </label>
                    </Col>

                    <Col className="gutter-row" md={{ span: 16 }} xs={{ span: 24 }}>
                        <Form.Item name="name" label={<span style={{ color: '#748CAD' }}>Tên sản phẩm</span>}>
                            <Input autoComplete='off' />
                        </Form.Item>

                        <Form.Item name="status" label={<span style={{ color: '#748CAD' }}>Trạng thái sản phẩm</span>}>
                            <Select className={clsx(style.fontSize16)}>
                                {dataStatusProduct && _.map(dataStatusProduct, (item, key) => (
                                    <Option key={key} value={_.get(item, 'id')}>{_.get(item, 'name')}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Row>
                            <Col xs={{ span: 24 }} sm={{ span: 11 }}>
                                <Form.Item name="category" label={<span style={{ color: '#748CAD' }}>Loại sản phẩm</span>}>
                                    <Select className={clsx(style.fontSize16)} style={{ width: '98%' }} >
                                        {dataCategories && _.map(dataCategories, (item, key) => (
                                            <Option key={key} value={_.get(item, 'id')}>{_.get(item, 'name')}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={{ span: 24 }} sm={{ span: 11, offset: 2 }}>
                                <Form.Item name="unit" label={<span style={{ color: '#748CAD' }}>Đơn vị</span>}>
                                    <Select className={clsx(style.fontSize16)}>
                                        {/* {dataUnits && dataUnits.map((unit) => (
                                            <Option key={unit.id} value={unit.id}>{unit.name}</Option>
                                        ))} */}
                                        {exportDataUnits && exportDataUnits.map((unit) => (
                                            <Option key={unit.id} value={unit.id}>{unit.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="price" label={<span style={{ color: '#748CAD' }}>Giá lẻ</span>}>
                            <InputNumber
                                addonAfter="đ"
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                style={{ width: '100%' }}
                                placeholder="Nhập thông tin"
                            />
                        </Form.Item>

                        <Form.Item name="wholesale_price" label={<span style={{ color: '#748CAD' }}>Giá sỉ</span>}>
                            <InputNumber
                                addonAfter="đ"
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                style={{ width: '100%' }}
                                placeholder="Nhập thông tin"
                            />
                        </Form.Item>
                        <Form.Item name="wholesale_quantity" label={<span style={{ color: '#748CAD' }}>Số lượng đạt sỉ</span>}>
                            <InputNumber
                                defaultValue={2}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                style={{ width: '100%' }}
                                placeholder="Nhập thông tin"
                            />
                        </Form.Item>
                        <Form.Item name="description" label={<span style={{ color: '#748CAD' }}>Mô tả</span>}>
                            <Input.TextArea rows={5} />
                        </Form.Item>
                    </Col>
                </Row>
            </Wrapper>

            <div style={{ height: '16px' }} />

            <Wrapper>
                <Form.List name="product_pricings">
                    {(fields, { add, remove }) => {
                        return (
                            <Fragment>
                                <Row>
                                    <Col span={12}>
                                        <Typography.Text className={style.styleSection}>Giá sản phẩm</Typography.Text>
                                    </Col>
                                    <Col span={12} className="flex justify-end align-center">
                                        <Button
                                            className={style.styleButtonPricingsAdd}
                                            onClick={() => {
                                                add({ type_price: [''] })
                                            }}
                                        ><PlusOutlined /> Thêm</Button>
                                    </Col>
                                </Row>
                                {
                                    _.map(fields, (item, key) => {
                                        return (
                                            <Fragment>
                                                <Divider className={style.styleDivider} />
                                                <Row key={key}>
                                                    <div className={item.key === _.size(fields) - 1 ? "w-max h-max flex flex-column container" : "w-max h-max flex flex-column container border-bottom"}>
                                                        <Col span={24}>
                                                            <Row>
                                                                <Col span={20}>
                                                                    <Row gutter={[16, 16]}>
                                                                        <Col span={24}>
                                                                            <Form.Item name={[item.name, 'active']}>
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
                                                                                            label={<span style={{ color: '#748CAD' }}>Phân loại</span>}
                                                                                            name={[item.name, 'product_type']}
                                                                                            style={{ paddingRight: 5 }}
                                                                                            rules={[{ required: true, message: 'Phân loại không được để trống' }]}
                                                                                        >
                                                                                            <Input
                                                                                                disabled={form.getFieldValue('product_pricings')[key]?.active === 'false' ? true : false}
                                                                                            />
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
                                                                                            name={[item.name, 'product_sku']}
                                                                                            style={{ paddingRight: 5 }}
                                                                                        >
                                                                                            <Input
                                                                                                disabled={form.getFieldValue('product_pricings')[key]?.active === 'false' ? true : false}
                                                                                            />
                                                                                        </Form.Item>
                                                                                    )
                                                                                }
                                                                            </Form.Item>
                                                                        </Col>
                                                                    </Row>
                                                                </Col>
                                                                {
                                                                    (_.get(item, 'key') !== _.get(_.last(fields), 'key') || _.size(fields) > 1) && (
                                                                        <Col span={4}>
                                                                            <Button
                                                                                className={style.styleButtonPricingsDelete}
                                                                                onClick={() => remove(item.name)}
                                                                            ><MinusOutlined /> Xoá</Button>
                                                                        </Col>
                                                                    )
                                                                }
                                                            </Row>
                                                            <Row style={{ marginBottom: '8px' }}>
                                                                <Col span={5} className="w-max inputItem">
                                                                    <span style={{ color: '#EF4036' }}>{`* `}</span>
                                                                    <span style={{ color: '#748CAD' }}>Hình thức</span>
                                                                </Col>
                                                                <Col span={5} className="w-max inputItem">
                                                                  <span style={{ color: '#EF4036' }}>{`* `}</span>
                                                                  <span style={{ color: '#748CAD' }}>Giá lẻ</span>
                                                                </Col>
                                                                <Col span={5} className="w-max inputItem">
                                                                    <span style={{ color: '#EF4036' }}>{`* `}</span>
                                                                    <span style={{ color: '#748CAD' }}>Giá sỉ</span>
                                                                </Col>
                                                                {
                                                                    _.lowerCase(_.get(dataConfig, 'appconfig[0].value')) === 'false' ? null : <Col span={5} className="w-max inputItem">
                                                                        <span style={{ color: '#EF4036' }}>{`* `}</span>
                                                                        <span style={{ color: '#748CAD' }}>Số lượng đạt sỉ</span>
                                                                    </Col>
                                                                }


                                                            </Row>

                                                            <Row>
                                                                <Form.List name={[item.name, 'type_price']}>
                                                                    {(types, { add, remove }) => {

                                                                        return (
                                                                            <>
                                                                                {
                                                                                    types.map(type => {
                                                                                        return (
                                                                                            <Row gutter={[16, 16]} className="w-max h-max flex" key={type.key}>
                                                                                                <Col span={5} className="w-max inputItem">
                                                                                                    <Form.Item shouldUpdate={true}>
                                                                                                        {
                                                                                                            () => (
                                                                                                                <Form.Item
                                                                                                                    {...type}
                                                                                                                    fieldKey={[type.fieldKey, 'package']}
                                                                                                                    name={[type.name, 'package']}
                                                                                                                    rules={[{ required: true, message: 'Hình thức không được để trống' }]}
                                                                                                                >
                                                                                                                    <Input
                                                                                                                        placeholder="Nhập thông tin"
                                                                                                                        disabled={form.getFieldValue('product_pricings')[key]?.active === 'false' ? true : false}
                                                                                                                    />
                                                                                                                </Form.Item>
                                                                                                            )
                                                                                                        }
                                                                                                    </Form.Item>
                                                                                                </Col>
                                                                                                <Col span={5} className="w-max inputItem">
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
                                                                                                                        addonAfter='đ'
                                                                                                                        className={clsx(style.styleNumberInput)}
                                                                                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                                                                        style={{ width: '100%' }}
                                                                                                                        placeholder="Nhập thông tin"
                                                                                                                        disabled={form.getFieldValue('product_pricings')[key]?.active === 'false' ? true : false}
                                                                                                                    />
                                                                                                                </Form.Item>
                                                                                                            )
                                                                                                        }
                                                                                                    </Form.Item>
                                                                                                </Col>

                                                                                                <Col span={5} className="w-max inputItem">
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
                                                                                                                        className={clsx(style.styleNumberInput)}
                                                                                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                                                                        style={{ width: '100%' }}
                                                                                                                        placeholder="Nhập thông tin"
                                                                                                                        disabled={form.getFieldValue('product_pricings')[key]?.active === 'false' ? true : false}
                                                                                                                    />
                                                                                                                </Form.Item>
                                                                                                            )
                                                                                                        }
                                                                                                    </Form.Item>
                                                                                                </Col>
                                                                                                {
                                                                                                    _.lowerCase(_.get(dataConfig, 'appconfig[0].value')) === 'false' ? null : <Col span={5} className="w-max inputItem">
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
                                                                                                                            className={clsx(style.styleNumberInput)}
                                                                                                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                                                                            style={{ width: '100%' }}
                                                                                                                            placeholder="Nhập thông tin"
                                                                                                                            disabled={form.getFieldValue('product_pricings')[key]?.active === 'false' ? true : false}
                                                                                                                        />
                                                                                                                    </Form.Item>
                                                                                                                )
                                                                                                            }
                                                                                                        </Form.Item>
                                                                                                    </Col>
                                                                                                }




                                                                                                <Col span={3} className="w-max inputItem">
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
                                                                                                </Col>
                                                                                            </Row>
                                                                                        )
                                                                                    }
                                                                                    )}
                                                                            </>
                                                                        )
                                                                    }}
                                                                </Form.List>
                                                            </Row>
                                                        </Col>
                                                    </div>
                                                </Row>
                                            </Fragment>
                                        )
                                    })
                                }
                            </Fragment>
                        )
                    }}
                </Form.List >
            </Wrapper >

            <Row>
                <div className="w-max flex justify-end mt-3">
                    <Space size={24} className={style.styleGroupButton}>
                        <Button htmlType="button" className={style.styleResetButton} onClick={handleReturn}>Hủy</Button>
                        <Button loading={loadingSubmit} htmlType="submit" className={style.styleCreateButton}>Xác nhận</Button>
                    </Space>
                </div>
            </Row>




        </Form >
    )
};


ProductEdit.propTypes = {
    data: PropTypes.object
};

export default ProductEdit;
