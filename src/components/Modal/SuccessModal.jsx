import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Typography } from 'antd';
import "./styles.scss";

SuccessModal.propTypes = {
    visible: PropTypes.bool,
    title: PropTypes.string,
    content: PropTypes.string,
};
SuccessModal.defaultProps = {
    title: "Thành công",
    content: "Chỉnh sửa sản phẩm thành công",
    textButton: 'Đóng'
}
function SuccessModal({ visible, title, content, onSuccess, textButton }) {

    const { Text, Title } = Typography;
    const [open, setOpen] = useState(visible);

    useEffect(() => {
        setOpen(visible)
    }, [visible])

    return (
        <Fragment>
            <Modal
                className="modal-wrapper"
                centered
                width={320}
                visible={open}
                footer={[]}
                onOk={() => setOpen(false)}
                onCancel={() => setOpen(false)}
                title={
                    <Fragment>
                        <p className="check-icon"></p>
                    </Fragment>
                }
            >
                <Title level={3}>{title}</Title>
                <div>
                    <Text>{content}</Text>
                </div>
                <Button className="back-btn" onClick={onSuccess}>{textButton}</Button>

            </Modal>
        </Fragment>
    );
}

export default SuccessModal;
