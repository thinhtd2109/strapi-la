import React, { useState, useRef, useEffect, Fragment } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Row, Col, Typography, Input, Button, Form, Select, Tag, Space, Spin, Image, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import style from './style.module.scss';
import clsx from 'clsx';
import { useGetProvinces, useGetDistricts, useGetWards } from '../../../../graphql/schemas/masterdata/address/query';
import _ from 'lodash';
import Wrapper from '../../../../components/Wrapper/Wrapper';
import Vector from "../../../../assets/icons/Vector.svg";

import { ReactComponent as NotFoundAddressIcon } from '../../../../assets/icons/booths/notFoundAddress.svg';
import { ReactComponent as ArrowBack } from '../../../../assets/icons/ArrowBack.svg';
import NoImage from './../../../../assets/images/no-image.svg'

import uuid from 'react-uuid'
import { useGetBoothExist } from '../../../../graphql/schemas/hook';
import { useDebounce } from 'use-debounce';
import { formatMoney } from '../../../../helpers';
import { useQuery } from '@apollo/client';
import { GET_BOOTH_PRODUCT_LIST } from '../../../../graphql/schemas/booths/query';
import moment from 'moment';
import { useGetBooth } from '../../../Booths/hooks';

const { useForm, Item: FormItem } = Form;

const { Text, Title } = Typography;
const { Option } = Select;

const validPhone = new RegExp(
    /^[0-9\-\+]{9,15}$/
)

const BoothDetailSlip = () => {
    const history = useHistory();
    const [form] = useForm();
    const { id } = useParams();
    const [bothSupport, setBothSupport] = useState([]);

    const [initialValues, setInitialValues] = useState();

    const [name, setName] = useState('');
    const [valueName] = useDebounce(name, 1000);


    const existItem = useGetBoothExist({ searchText: valueName });

    // address
    const [province, setProvince] = useState(0);
    const [district, setDistrict] = useState(0);
    const [ward, setWard] = useState([]);

    const [phone, setPhone] = useState({
        inputValue: '',
        //editInputIndex: -1,
        //editInputValue: '',
    });

    const [tagsPhone, setTagsPhone] = useState([]);

    const { data: booth, loading: loadingBooth, refetch } = useGetBooth({ id });
    const { data, loading } = useQuery(GET_BOOTH_PRODUCT_LIST, {
        variables: {
            boothId: id
        }
    })

    const provinceList = useGetProvinces();
    const districtList = useGetDistricts({ provinceId: _.get(JSON.parse(province), 'id') });
    const wardList = useGetWards({ districtId: _.get(JSON.parse(district), 'id') });

    const removeTag = (e, tag, key) => {
        e.preventDefault();
        const filtered = _.filter(bothSupport, (item, index) => item.id !== tag.id);
        setBothSupport(filtered);
    }
    const addFieldSupport = (ward) => {
        let parseProvince = JSON.parse(province);
        let parseDistrict = JSON.parse(district);
        let temp = _.cloneDeep(bothSupport);

        _.forEach(ward, (item) => temp.push({ id: uuid(), province: parseProvince, ward: JSON.parse(item), district: parseDistrict }));

        let filteredDataUnique = temp.reduce((unique, o) => {
            if (!unique.some((obj) => obj.ward.name === o.ward.name)) {
                unique.push(o);
            }
            return unique;
        }, []);

        setBothSupport(filteredDataUnique);
    }


    const returnedTag = (list) => {
        return _.map(list, (item, index) => {
            return (
                <Tag key={index} className={clsx(style.tag)} onClose={(e) => removeTag(e, item, index)}>
                    {
                        _.join(_.pull([_.get(item, 'province.name', ''), _.get(item, 'district.name', ''), _.get(item, 'ward.name', '')], '', null), ', ')
                    }
                </Tag>
            )
        })

    }

    const handleWard = (value) => {
        setWard(value);
        addFieldSupport(value)
    }

    const handleInputChange = (e) => {
        setPhone((prev) => ({ ...prev, inputValue: e.target.value }));
    }

    const handleInputConfirm = (e) => {
        e.preventDefault();
        let { inputValue } = phone;
        let temp = _.cloneDeep(tagsPhone);
        if (inputValue && !validPhone.test(inputValue)) {
            return;
        }
        if (inputValue && tagsPhone.indexOf(inputValue) === -1) {
            temp.push(inputValue);
        }

        setTagsPhone(temp);
        setPhone((prev) => ({ ...prev, inputValue: '' }))
    }

    const saveInputRef = useRef(null)

    const removeTagPhone = (e, item, index) => {
        e.preventDefault();
        const removedTagList = _.filter(tagsPhone, (element, key) => key !== index);
        setTagsPhone(removedTagList);
    }

    useEffect(() => {
        if (booth) {
            setInitialValues({
                name: _.get(booth, 'name')
            });

            setBothSupport(_.map(_.get(booth, 'booth_incharges'), (item) => {
                return {
                    id: uuid(),
                    province: _.get(item, 'province'),
                    district: _.get(item, 'district'),
                    ward: _.get(item, 'ward')
                }
            }))
            setTagsPhone(_.map(_.get(booth, 'booth_accounts'), (item) => _.replace(item.account.phone, '+84', '0')))
        }
    }, [booth]);



    const keyPress = (e) => {
        if (e.charCode === 32) {
            handleInputConfirm(e);
        }
    }


    if (loadingBooth || _.isEmpty(initialValues)) return <div className="wapperLoading"><Spin tip="Đang tải dữ liệu..." /></div>
    return (
        <Fragment>
            <div className={clsx(style.customerPage)}>
                <Wrapper>
                    <Form form={form} initialValues={initialValues} >
                        <Row align='middle'>
                            <Col span={2} style={{ height: 48 }}>
                                <Text className="input-label">Số xe <span style={{ color: 'red' }}>*</span></Text>
                            </Col>
                            <Col span={22}>
                                <FormItem style={existItem && { marginBottom: 0 }} rules={[{ required: true, message: 'Số xe không được để trống' }]} name="name">
                                    <Input disabled={true} onChange={(e) => setName(e.target.value)} value={name} allowClear placeholder='Thông tin số xe' className={clsx(style.input)} />
                                </FormItem>
                                {existItem && (
                                    <span className='ant-form-item-explain-error'>Số xe đã tồn tại</span>
                                )}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={2} className={clsx(style.phoneTitle)}>
                                <Text className="input-label" >Số điện thoại <span style={{ color: 'red' }}>*</span></Text>
                            </Col>
                            <Col span={22}>
                                <FormItem
                                    rules={[
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!validPhone.test(value) && value) {
                                                    return Promise.reject(new Error('Số điện thoại không đúng định dạng'));
                                                } else {
                                                    return Promise.resolve();
                                                }
                                            },
                                        }),
                                    ]}
                                    name="phone"
                                    style={{ marginBottom: 0 }}
                                >
                                    <div className={clsx(style.tagPhone)}>
                                        <Row align='middle' style={{ width: '100%' }}>
                                            <Col>
                                                {_.map(tagsPhone, (item, index) => (
                                                    <Space size={2} key={index} >
                                                        <Tag disabled={true} key={item} className={clsx(style.tagPhoneItem)}>{item}</Tag>
                                                    </Space>

                                                ))}
                                            </Col>
                                            <Col>
                                                <Input
                                                    maxLength={12}
                                                    ref={saveInputRef}
                                                    placeholder='Nhập số điện thoại, phân cách bởi khoảng trắng'
                                                    value={phone.inputValue}
                                                    style={{ border: 'none', boxShadow: 'none', width: 400 }}
                                                    type="text"
                                                    onBlur={handleInputConfirm}
                                                    onKeyPress={keyPress}
                                                    onPressEnter={handleInputConfirm}
                                                    onChange={handleInputChange}
                                                />
                                            </Col>
                                        </Row>

                                    </div>
                                </FormItem>
                            </Col>
                        </Row>
                        <Row align='middle' style={{ marginBottom: 24, marginTop: 24 }}>
                            <Col span={2}>
                                <Text className="input-label">Khu vực hỗ trợ <span style={{ color: 'red' }}>*</span></Text>
                            </Col>
                            <Col span={22}>
                                <Row gutter={12}>
                                    <Col flex="auto">
                                        <Select value={bothSupport[0]?.province?.name} placeholder='Chọn tỉnh thành phố' style={{ display: 'block' }} >
                                            <Option disabled={true}>Chọn tỉnh thành phố</Option>
                                            {_.map(provinceList, (item) => {
                                                return <Option disabled={true} key={item.id} value={JSON.stringify(item)}>{item.name}</Option>
                                            })}
                                        </Select>
                                    </Col>
                                    <Col flex="auto">
                                        <Select value={bothSupport[0]?.district?.name} placeholder='Chọn quận huyện' style={{ display: 'block' }} onChange={(value) => { setDistrict(value); setWard([]); }}>
                                            <Option value={0} disabled={true}>Chọn quận huyện</Option>
                                            {_.map(districtList, (item) => {
                                                return <Option key={item.id} value={JSON.stringify(item)}>{item.name}</Option>
                                            })}
                                        </Select>
                                    </Col>
                                    <Col flex="auto">
                                        <Select value={ward} placeholder='Chọn phường xã' mode='multiple' style={{ display: 'block' }} onChange={handleWard} maxTagCount={3} allowClear={true}>
                                            <Option value={0}>Chọn phường xã</Option>
                                            {_.map(wardList, (item) => {
                                                return <Option key={item.id} value={JSON.stringify(item)}>{item.name}</Option>
                                            })}
                                        </Select>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={2}></Col>
                            <Col span={22}>
                                <div className={clsx(_.size(bothSupport) === 0 && style.notFoundAddressSupport, style.supportAddress)}>
                                    {_.size(bothSupport) === 0 ? (
                                        <NotFoundAddressIcon />
                                    ) : (
                                        <Row>
                                            <Col flex="auto">
                                                {returnedTag(bothSupport)}
                                            </Col>
                                        </Row>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Wrapper>
                <div style={{ marginTop: '40px' }}>
                    <div className="createFlash">
                        <Row justify="space-between" className="headerWrapper">
                            <Typography.Title level={4}>Danh sách sản phẩm</Typography.Title>

                        </Row>
                        <div className="contentWrapper">
                            {_.size(_.get(data, 'booth_product')) === 0 ? <div className="imgWrapper">
                                <img src={Vector} width={100} height={200}></img>
                            </div> :
                                <Fragment>
                                    {_.map(_.get(data, 'booth_product', []), (item, idx) => {
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
            </div>

        </Fragment>

    )
}

export default BoothDetailSlip
