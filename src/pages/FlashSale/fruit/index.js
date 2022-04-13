import { Fragment, useState } from "react";
import { Button, Row, Typography, Table, Spin, Space, notification, Tag } from "antd";
import { PlusOutlined, FormOutlined, DeleteOutlined } from "@ant-design/icons";
import style from './style.module.scss'
import _ from "lodash";
import moment from "moment";
import PaginationComponent from "../../../components/PaginationComponent";
import { useHistory } from "react-router";
import slugs from "../../../constant/slugs";
import { useMutation, useQuery } from "@apollo/client";
import { GET_PROMOTIONS_BY_TYPE_CODE } from "../../../graphql/schemas/promotion/query";
import DeleteModal from "../../../components/Modal/DeleteModal";
import { DELETE_PROMOTION } from "../../../graphql/schemas/promotion/mutation";
import { user } from "../../../constant/user";
import { Link } from "react-router-dom";
import { FRUIT_EVENT } from "../../../constant/info";
import clsx from "clsx";

const FruitEvent = () => {
    const { Title, Text } = Typography;
    const history = useHistory();
    const pagingLocalStorage = JSON.parse(localStorage.getItem('paging'));
    const [pageIndex, setPageIndex] = useState(pagingLocalStorage?.pagename === "ORDER" ? pagingLocalStorage?.pageIndex : 1);
    const [pageSize, setPageSize] = useState(pagingLocalStorage?.pagename === "ORDER" ? pagingLocalStorage?.pageSize : 20);
    const [isDelete, setIsDelete] = useState(false);
    const [idDelete, setIdDelete] = useState(null);
    const { loading, data } = useQuery(GET_PROMOTIONS_BY_TYPE_CODE, {
        variables: {
            code: FRUIT_EVENT
        }
    });
    const [deletePromotion] = useMutation(DELETE_PROMOTION, {
        refetchQueries: [{
            query: GET_PROMOTIONS_BY_TYPE_CODE,
            variables: {
                code: FRUIT_EVENT
            }
        }]
    })


    const handleDelete = () => {
        deletePromotion({
            variables: {
                id: idDelete,
                updated_by: user.getValue('id')
            }
        }).then(() => {
            notification["success"]({
                message: "Xóa khuyến mãi",
                description: "Xóa khuyến mãi thành công.",
            });
            setIdDelete(null);
            setIsDelete(false);
        }).catch(err => {
            notification["error"]({
                message: "Xóa khuyến mãi",
                description: "Xóa khuyến mãi thất bại",
            });
        });
    }
    const compareTime = (record) => {
        let now = moment(new Date(), "YYYY-MM-DD HH:mm").subtract(7, 'hours');
        let startTime = moment(_.get(record, 'start_time'), "YYYY-MM-DD HH:mm");
        let endTime = moment(_.get(record, 'end_time'), "YYYY-MM-DD HH:mm");
        if (now.isBefore(startTime)) {
            return <Tag className={clsx(style.tagColumn, style.waitingStatus)} onClick={() => history.push('/flash-sale/detail/' + record.id)}>Đang chờ</Tag>
        }

        if (now.isBetween(startTime, endTime)) {
            return <Tag className={clsx(style.tagColumn, style.runningStatus)} onClick={() => history.push('/flash-sale/detail/' + record.id)}>Đang chạy</Tag>
        }

        if (now.isAfter(endTime)) {
            return <Tag className={clsx(style.tagColumn, style.endStatus)} onClick={() => history.push('/flash-sale/detail/' + record.id)}>Kết thúc</Tag>
        }

    }

    const columns = [
        {
            key: "id", title: "STT",
            ellipsis: true,
            width: 90,
            render: (text, record, index) => {
                return <span className='item-center'>{(pageIndex - 1) * pageSize + index + 1}</span>;
            },
        },
        {
            key: "status", title: "Trạng thái", dataIndex: "status",
            ellipsis: true,
            width: 200,
            render: (text, record, index) => {
                return compareTime(record);
            }
        },
        {
            key: "name", title: "Tên chương trình", dataIndex: "name",
            ellipsis: true,
            width: 250,
            render: (text, record) => {
                return <div>{text}</div>
            }
        },
        {
            key: "start_time", title: "Thời gian bắt đầu", dataIndex: "start_time",
            ellipsis: true,
            width: 250,
            render: (text, record) => {
                return <div>{moment(text).format("DD/MM/YYYY HH:mm")}</div>;
            },
        },
        {
            key: "end_time", title: "Thời gian kết thúc", dataIndex: "end_time",
            ellipsis: true,
            width: 250,
            render: (text, record) => {
                return <div>{moment(text).format("DD/MM/YYYY HH:mm")}</div>;
            },
        },
        {
            key: "promotion_booths", title: "Kho hàng lưu động", dataIndex: "promotion_booths",
            ellipsis: true,
            width: 350,
            render: (text, record) => {
                return _.map(text, (item, index) => {
                    return <Fragment>

                        <span key={index} onClick={(e) => {
                            e.stopPropagation();
                            history.push(`/booths/detail/${_.get(item, "boothByBooth.id")}`)
                        }}>{_.get(item, "boothByBooth.code", "")}</span>,
                    </Fragment>
                })
            },
        },
        {
            ellipsis: true,
            width: 300,
            key: "description", title: "Mô tả", dataIndex: "description"
        },
        {
            ellipsis: true,
            width: 250,
            key: "action", title: "-", dataIndex: "action",
            render: (_, record) => {
                let now = moment(new Date(), "YYYY-MM-DD HH:mm").subtract(7, 'hours');
                let startTime = moment(record?.start_time, "YYYY-MM-DD HH:mm");
                let endTime = moment(record?.end_time, "YYYY-MM-DD HH:mm");
                if (now.isBetween(startTime, endTime) || now.isAfter(endTime)) {
                    return <div>-</div>
                }
                return <Space size="middle" style={{ cursor: 'pointer' }}>
                    <FormOutlined style={{ color: '#748cad' }} onClick={() => history.push('/fruit-event/edit/' + record.id)} />
                    <DeleteOutlined style={{ color: '#EF4036' }} onClick={() => { setIsDelete(true); setIdDelete(record.id) }} />

                </Space>

            }
        },
    ];

    if (loading) {
        return <div className="wapperLoading"><Spin tip="Đang tải dữ liệu..." /></div>
    }

    return <div className={style.flashPage}>
        <DeleteModal
            title="Xóa chương trình khuyến mãi"
            content1="Bạn muốn xóa khuyến mãi,"
            content2="Vui lòng xác nhận bên dưới"
            visible={isDelete} onCancel={() => setIsDelete(false)}
            onDelete={handleDelete}
        />
        <Row justify="space-between" className={style.titleRow}>
            <Typography.Title level={3}>Chương trình khuyến mãi</Typography.Title>
            <Button
                className={style.stylePrimary}
                icon={<PlusOutlined />}
                onClick={() => history.push(slugs.fruitEventCreate)}
            >
                Tạo mới
            </Button>
        </Row>
        <div className={style.bg}>
            <Row className={style.wrapperTable}>
                <Table
                    dataSource={_.slice(_.get(data, "result"), pageSize * (pageIndex - 1), pageSize * pageIndex)}
                    rowKey="id"
                    columns={columns}
                    pagination={false}
                    loading={loading}
                    onRow={(record, rowIndex) => {
                        return {
                            style: {
                                cursor: 'pointer'
                            },
                            onClick: () => history.push('/fruit-event/detail/' + record.id)
                        };
                    }}

                />
            </Row>

            <PaginationComponent
                total={_.size(_.get(data, "result"))}
                pageSize={pageSize}
                pageIndex={pageIndex}
                pageSizeOptions={[10, 20, 40, 80, 120]}
                setPageSize={setPageSize}
                setPageIndex={setPageIndex}
                pagename='CUSTOMER'
            />
        </div>

    </div>
}

export default FruitEvent;