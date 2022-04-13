import React, { Fragment, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Typography } from 'antd';
import "./styles.scss";
import _ from 'lodash';
import XLSX from 'xlsx';
import { useLazyQuery } from '@apollo/client';
import { GET_BOOTH_PRODUCT_FOR_IMPORT } from '../../graphql/schemas/booths/query';


UploadModal.propTypes = {
    visible: PropTypes.bool,
    title: PropTypes.string,
    content: PropTypes.string,
};
UploadModal.defaultProps = {
    title: "Nhập sản phẩm",
    content: "Bạn đang thực hiện nhập sản phẩm cho kho hàng lưu động. Chọn file để nhập sản phẩm",
    textButton: 'Tải lên',
    textBackButton: 'Hủy'
}
function UploadModal({ visible, title, content, onBack, textBackButton, textButton, onComplete }) {

    const { Text, Title } = Typography;
    const [open, setOpen] = useState(visible);
    const [getBoothProduct, { loading, data }] = useLazyQuery(GET_BOOTH_PRODUCT_FOR_IMPORT);
    const [fileName, setFileName] = useState("");
    const [columns, setColumns] = useState([]);
    const [skus, setSkus] = useState([]);
    const [productList, setProductList] = useState([]);

    useEffect(() => {
        setOpen(visible)
    }, [visible]);

    useEffect(() => {
        if (!_.isEmpty(skus)) {
            getBoothProduct({
                variables: {
                    skus: skus
                }
            })
        }

    }, [skus]);

    useEffect(() => {
        if (data) {
            let productsExisted = _.map(_.get(data, 'result', []), (item) => {
                let idx = _.findIndex(productList, function (o) {
                    return o.sku_detail.sku === item.sku_detail.sku;
                });
                if (idx > -1) {
                    return { ...item, stock: productList[idx].stock ?? "" };
                }
            });
            let otherProductList = _.differenceBy(productList, productsExisted, 'sku_detail.sku');
            onComplete(productsExisted, otherProductList);
        }

    }, [data]);

    const processData = dataString => {
        const dataStringLines = dataString.split(/\r\n|\n/);
        const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);

        const list = [];
        const skuTmp = [];
        for (let i = 1; i < dataStringLines.length; i++) {
            const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
            if (headers && row.length == headers.length) {
                let obj = {};
                _.set(obj, 'product_detail.code', row[1]);//Mã sản phẩm
                _.set(obj, 'product_detail.name', row[2]);//Tên SP
                _.set(obj, 'price');//Giá
                _.set(obj, 'sku_detail.sku', row[3]); // Mã Phân loại
                skuTmp.push(row[3]);
                _.set(obj, 'type_detail.name', row[4]); // Phân loại
                _.set(obj, 'package', row[5]); // Hinh thức
                _.set(obj, 'unit_detail.name', row[6]);// Đơn vị
                //Thời gian nhập - Ngày hiện tại
                _.set(obj, 'stock', row[7]); // Số lượng
                if (Object.values(obj).filter(x => x).length > 0) {
                    list.push(obj);
                }
            }
        }
        setSkus(skuTmp);
        setProductList(list);

    }

    // handle file upload
    const handleFileUpload = e => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (evt) => {
            /* Parse data */
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            /* Get first worksheet */
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            /* Convert array of arrays */
            const data = XLSX.utils.sheet_to_csv(ws, { header: 1, blankrows: false });
            processData(data);
        };
        reader.readAsBinaryString(file);
    }

    return (
        <Fragment>
            <Modal
                className="modal-wrapper"
                centered
                width={600}
                visible={open}
                footer={[]}
                onOk={() => setOpen(false)}
                onCancel={onBack}
                title={
                    <Fragment>
                        <p className="upload-icon"></p>
                    </Fragment>
                }
            >
                <Title level={3}>{title}</Title>
                <div>
                    <Text>{content}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: ' center' }}>
                    <Button className="back-warning-btn" onClick={onBack}>{textBackButton}</Button>
                    <div className="confirm-upload-btn">
                        <input onChange={handleFileUpload} accept=".csv,.xlsx,.xls" style={{ display: 'none' }} id="icon-button-file" type="file" />
                        <label htmlFor="icon-button-file"  >
                            {textButton}
                        </label>
                    </div>
                </div>


            </Modal>
        </Fragment>
    );
}

export default UploadModal;
