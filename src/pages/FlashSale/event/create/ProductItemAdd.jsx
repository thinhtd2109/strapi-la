import React, { Fragment, useEffect, useState } from 'react'
import { Row, Col, Space, Typography, Image, Input, Button, Table, Form } from 'antd';
import * as _ from "lodash";
import './style.scss';
import FilterDropdown from '../../../../components/FilterDropdown';
import clsx from 'clsx';
import { useGetCategories } from '../../../../graphql/schemas/hook';
import SearchContent from '../../../../components/SearchContent';
import { useQuery } from '@apollo/client';
import { GET_PRODUCT_PRICINGS } from '../../../../graphql/schemas/promotion/query';
import PaginationComponent from '../../../../components/PaginationComponent';
import { formatMoney } from '../../../../helpers';

const ProductItemAdd = ({ onCancel, onComplete }) => {
    const { data: categoryList, loading: loadingCategory } = useGetCategories();
    const { data: products, loading, error, refetch } = useQuery(GET_PRODUCT_PRICINGS, {
        variables: {
            where: {
                deleted: { _eq: false },
                productByProduct: {
                    deleted: { _eq: false }
                }
            },
        }
    });


    const [data, setData] = useState([]);
    const [filterType, setFilterType] = useState([]);
    const [rowSelection, setRowSelection] = useState([]);
    const [percentAll, setPercentAll] = useState(0);
    const [inputValue, setInputValue] = useState(0);
    const pagingLocalStorage = JSON.parse(localStorage.getItem('paging'));

    const [pageIndex, setPageIndex] = useState(pagingLocalStorage?.pagename === "PRODUCT" ? pagingLocalStorage?.pageIndex : 1);
    const [pageSize, setPageSize] = useState(pagingLocalStorage?.pagename === "PRODUCT" ? pagingLocalStorage?.pageSize : 20);

    const [selectedRows, setSelectedRows] = useState([]);

    const [searchContent, setSearchContent] = useState("");
    const { Title, Text } = Typography;
    const filterData = [
        {
            group: { code: "TYPE", name: "" },
            filterList: categoryList,
        },
    ];

    useEffect(() => {
        if (products) {
            let newData = _.map(products.result, (item) => {
                return { ...item, percent: percentAll }
            })
            setData(newData);
        }
    }, [products]);

    useEffect(() => {
        let newData = _.map(data, (item, index) => {
            return { ...item, percent: percentAll }
        });
        setData(newData);
        setInputValue(percentAll);
    }, [percentAll]);

    //Columns
    const columns = [
        {
            title: 'Chọn tất cả',
            dataIndex: 'id',
            key: "id",
            width: '30%',
            render: (_, record) => {
                return <div className="flex align-center h-max">
                    <Space size={12}>
                        <Image className="productImage" src={process.env.REACT_APP_S3_GATEWAY + record?.productByProduct?.photo?.url} alt="product_image" />
                        <div className="flex flex-column">
                            <Text style={{ fontSize: '18px' }}>{record?.productByProduct?.name}</Text>
                            <Text>Giá: <Text className="red">{formatMoney(record?.price)} đ</Text></Text>
                            <Text>Mã sản phẩm: {record?.productByProduct.code}</Text>
                        </div>
                    </Space>
                </div>
            }
        },
        {
            title: '',
            dataIndex: 'status',
            key: 'status',
            width: '20%',
            render: (_, record) => {
                return <div className="titleWrapper">
                    <div className="align-center titleProduct">
                        <Text>Trạng thái sản phẩm</Text>
                    </div>
                    <div className="subTitle align-center">
                        <Text>{record?.productByProduct?.product_status?.name}</Text>
                    </div>
                </div>
            }
        },
        {
            title: '',
            dataIndex: 'category',
            key: 'category',
            width: '20%',
            render: (_, record) => {
                return <div className="titleWrapper">
                    <div className="align-center titleProduct">
                        <Text>Phân loại</Text>
                    </div>
                    <div className="subTitle">
                        <Text>{record?.product_type?.name}</Text>
                    </div>
                </div>
            }
        },
        {
            title: '',
            dataIndex: 'percent',
            key: 'percent',
            width: '20%',
            render: (_, record) => {
                return <div className="titleWrapper">
                    <div className="align-center titleProduct">
                        <Text>Phần trăm giảm giá (%)</Text>
                    </div>
                    <div>
                        <Input type="number" min={0} max={100} style={{ textAlign: 'center' }} defaultValue={percentAll} value={record.percent} onChange={(e) => save(record.id, e.target.value * 1)}></Input>
                    </div>
                </div>
            }
        }
    ];
    const save = (id, value) => {
        try {
            let newValue = value < 0 ? 0 : value > 100 ? 100 : value;
            const row = {};
            const newSelectedRow = [...selectedRows];
            const indexSelected = newSelectedRow.findIndex(item => id === item.id);
            if (indexSelected > -1) {
                let result = _.map(newSelectedRow, item => {
                    if (id === item.id) {
                        return {
                            ...item,
                            percent: newValue,
                        }
                    }
                    return item;

                });
                setSelectedRows(result);
            }
            const newData = [...data];
            const index = newData.findIndex(item => id === item.id);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                    percent: newValue
                });
                setData(newData);
                setInputValue(newValue);
                //setEditingKey('');
            } else {
                newData.push(row);
                setData(newData);
                //setEditingKey('');
            }
        } catch (errInfo) {
        }
    };

    const onSelectChange = (selectedRowKeys, selectedRows) => {
        setRowSelection(selectedRowKeys);
        setSelectedRows(selectedRows);
    };

    const handleFilterProduct = (value) => {
        if (value?.group === "TYPE") {
            setFilterType(value.checkedValue);
        }
    };


    const handleComplete = () => {
        onComplete(selectedRows);
    }

    const handlePercentAll = (e) => {
        let percent = e.target.value * 1 < 0 ? 0 : e.target.value * 1 > 100 ? 100 : e.target.value * 1;
        setPercentAll(percent);
    }

    useEffect(() => {
        refetch({
            where: {
                productByProduct: {
                    name: { _ilike: `%${searchContent}%` },
                    categoryByCategory: {
                        id: { _in: filterType.length !== 0 ? filterType : undefined },
                    },
                    deleted: { _eq: false },
                },
                deleted: { _eq: false },
            },
        });
    }, [filterType, refetch, searchContent]);




    if (!data) return null;

    return (
        <Fragment>
            <Title level={3}>Thêm danh sách sản phẩm</Title>
            <div className="createFlash">
                <div className="headerWrapper" style={{ paddingBottom: '10px' }}>
                    <Row justify="space-between">
                        <Col
                            span={4}
                        >
                            <SearchContent
                                searchContent={searchContent}
                                setSearchContent={setSearchContent}
                            />
                        </Col>
                        <Col
                            span={4}
                        >
                            <FilterDropdown
                                className={clsx("filter-dropdown custom-filter")}
                                filterItems={filterData}
                                onChange={handleFilterProduct}
                                filterByType={filterType}
                                title="Danh mục sản phẩm"
                                flashSale={true}
                            />
                        </Col>
                        <Col span={4}>
                        </Col>
                        <Col span={4}>
                        </Col>
                        <Col span={3}>
                        </Col>
                        <Col span={4}>
                            <div style={{ textAlign: 'center' }}>
                                Phần trăm giảm giá (%)
                            </div>
                            <div><Input min={0} max={100} style={{ textAlign: 'center' }} type="number" value={percentAll} onChange={handlePercentAll} /></div>
                        </Col>
                    </Row>
                </div>

                <div>
                    <Table
                        rowSelection={{ selectedRowKeys: rowSelection, onChange: onSelectChange }}
                        dataSource={_.slice(data, pageSize * (pageIndex - 1), pageSize * pageIndex)}
                        rowKey="id"
                        columns={columns}
                        pagination={false}
                        loading={loading}
                    />
                    <PaginationComponent
                        total={_.size(data)}
                        pageSize={pageSize}
                        pageIndex={pageIndex}
                        pageSizeOptions={[10, 20, 40, 80, 120]}
                        setPageSize={setPageSize}
                        setPageIndex={setPageIndex}
                        pagename='PRODUCT'
                    />
                </div>

            </div>
            <Row>
                <div className="w-max flex justify-end mt-3 custom-button">
                    <Space size={24}>
                        <Button htmlType="button" onClick={() => { onCancel(true) }} className="btn_reset__product_create">Hủy</Button>
                        <Button htmlType="submit" className="btn__btn-create__product" onClick={handleComplete}>Xác nhận</Button>
                    </Space>
                </div>
            </Row>


        </Fragment >

    )
}

export default ProductItemAdd;
