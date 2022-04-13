
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import styles from './category.module.scss';
import { useGetCategories, useDeleteCategory } from './hooks';
import _ from 'lodash'
import { Button, Row, Table, notification } from 'antd';
import { column } from './helpers';
import slugs from '../../../constant/slugs';
import WarningModal from '../../../components/Modal/WarningModal';

const CategoryArticles = () => {
    const { data, loading, refetch } = useGetCategories({});
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [pageSize, setPageSize] = useState(0);
    const [isDelete, setIsDelete] = useState(false);
    const [idDelete, setIdDelete] = useState();
    const history = useHistory();
    const deleteFunc = useDeleteCategory();
    const deleteCategoryArticleHandle = () => {
        setLoadingDelete(true);
        deleteFunc({
            variables: {
                id: idDelete
            }
        }).then(() => {
            refetch();
            setIsDelete(false);
            setLoadingDelete(false);
            setIdDelete();
        }, (err) => {
            setLoadingDelete(false);
            setIsDelete(false);
            notification["error"]({
                message: "Thất bại",
                description: _.get(err, 'message', "Xoá danh mục thất bại"),
            });
        })
    }

    return (
        <div className={styles.categoryPage}>
            <WarningModal
                onSubmit={deleteCategoryArticleHandle}
                title="Thông báo"
                content="Bạn có muốn xóa danh mục khỏi hệ thống?"
                onBack={() => setIsDelete(false)}
                visible={isDelete}
                loading={loadingDelete}
            />
            <Row justify='end' className="mb-3">
                <Button onClick={() => history.push(slugs.articlesCreate)} className={styles.addBtn}>Tạo tin tức</Button>
            </Row>
            <Row className="wrapper-table">
                <Table
                    dataSource={_.get(data, 'data')}
                    rowKey="id"
                    columns={column(history, setIsDelete, setIdDelete)}
                    pagination={false}
                    loading={loading}
                    onRow={(record, rowIndex) => {
                        return {
                            style: {
                                cursor: 'pointer'
                            },
                            onClick: () => history.push('/article/category/detail/' + record.id)
                        };
                    }}

                />
            </Row>

        </div>
    )
}

export default CategoryArticles