import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Typography } from 'antd';
import "./styles.scss";

DeleteModal.propTypes = {
    onDelete: PropTypes.func,
    type: PropTypes.arrayOf(),
};

DeleteModal.defaultProps = {
    onDelete: () => { },
    type: ['DELETE', 'CANCEL']
}
function DeleteModal({ visible, onDelete, type, onCancel, title, content1, content2 }) {
    const { Text, Title } = Typography;
    const [open, setOpen] = useState(visible);
    const handleComplete = () => {
        onDelete();
    }

    useEffect(() => {
        setOpen(visible);
    }, [visible])

    return (
        <div>
            <Fragment>
                <Modal
                    className="modal-wrapper"
                    centered
                    width={600}
                    visible={open}
                    footer={[]}
                    onCancel={onCancel}
                    title={
                        <Fragment>
                            <p className="cancel-icon"></p>
                        </Fragment>
                    }
                >
                    {title ? <Title level={3}></Title> : <Title level={3}>{type === 'DELETE' ? "Xóa sản phẩm" : "Hủy tạo sản phẩm"}</Title>}
                    <div>
                        {content1 ? <Text>{content1}</Text> : <Text>{type === 'DELETE' ? "Bạn muốn xóa sản phẩm," : "Bạn muốn hủy sản phẩm"}</Text>}
                    </div>
                    <div>
                        {content2 ? <Text>{content2}</Text> : <Text>{type === 'DELETE' ? "Vui lòng xác nhận xóa bên dưới" : "Vui lòng xác nhận hủy bên dưới"}</Text>}
                    </div>
                    <Button className="delete-btn" onClick={handleComplete}>Đồng ý</Button>

                </Modal>
            </Fragment>
        </div>
    );
}

export default DeleteModal;