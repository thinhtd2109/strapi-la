import React, { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Typography } from "antd";
import "./styles.scss";

WarningModal.propTypes = {
  visible: PropTypes.bool,
  title: PropTypes.string,
  content: PropTypes.string,
  onBack: PropTypes.func,
  onDelete: PropTypes.func,
};
WarningModal.defaultProps = {
  title: "Thành công",
  content: "Chỉnh sửa sản phẩm thành công",
  textButton: "Đồng ý",
  textBackButton: "Hủy",
  width: 320,
  onBack: () => {},
  onDelete: () => {},
};
function WarningModal({
  visible,
  title,
  content,
  onBack,
  textBackButton,
  textButton,
  onSubmit,
  loading,
  width,
}) {
  const { Text, Title } = Typography;
  const [open, setOpen] = useState(visible);

  useEffect(() => {
    setOpen(visible);
  }, [visible]);

  return (
    <Fragment>
      <Modal
        style={{ maxWidth: width }}
        className="modal-wrapper"
        centered
        width={width}
        visible={open}
        footer={[]}
        onOk={() => setOpen(false)}
        onCancel={onBack}
        title={
          <Fragment>
            <p className="warning-icon"></p>
          </Fragment>
        }
      >
        <Title level={3}>{title}</Title>
        <div>
          <Text>{content}</Text>
        </div>
        <Button className="back-warning-btn" onClick={onBack}>
          {textBackButton}
        </Button>
        <Button
          disabled={loading}
          loading={loading}
          className="confirm-warning-btn"
          onClick={onSubmit}
        >
          {textButton}
        </Button>
      </Modal>
    </Fragment>
  );
}

export default WarningModal;
