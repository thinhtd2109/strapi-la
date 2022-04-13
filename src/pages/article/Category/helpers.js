import { Space } from 'antd';
import { FormOutlined, DeleteOutlined } from "@ant-design/icons";
import _ from 'lodash'

export const column = (history, setIsDelete, setIdDelete) => [
    {
        title: "Mã danh mục",
        ellipsis: true,
        key: "code",
        align: "center",
        width: 250,
        render: (text, record) => {
            return _.get(record, 'attributes.code')
        },
    },
    {
        title: "Tên danh mục",
        ellipsis: true,
        key: "code",
        align: "center",
        width: 250,
        render: (text, record) => {
            return _.get(record, 'attributes.name')
        },
    },
    {
        title: "Action",
        ellipsis: true,
        align: "center",
        width: 250,
        render: (text, record) => {
            return <Space size="middle" style={{ cursor: 'pointer' }}>
                <FormOutlined style={{ color: '#748cad' }} onClick={(e) => { e.stopPropagation(); history.push('/article/category/edit/' + record.id) }} />
                <DeleteOutlined style={{ color: '#EF4036' }} onClick={(e) => { e.stopPropagation(); setIsDelete(true); setIdDelete(record.id) }} />
            </Space>

        },
    }
]